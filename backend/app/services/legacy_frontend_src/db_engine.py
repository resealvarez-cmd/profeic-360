"""
Motor de autenticación y persistencia con Supabase para ProfeIC.
Gestiona usuarios, autenticación y almacenamiento de trabajos generados.
"""

import streamlit as st
from supabase import create_client, Client
from typing import Optional, Dict, List, Any
import json
from datetime import datetime


def get_supabase_client() -> Optional[Client]:
    """
    Inicializa y retorna el cliente de Supabase usando secrets de Streamlit.
    
    Returns:
        Cliente de Supabase o None si faltan credenciales
    """
    try:
        # Intentar obtener secrets de diferentes formas
        try:
            supabase_url = st.secrets.get("supabase", {}).get("url")
            supabase_key = st.secrets.get("supabase", {}).get("key")
        except:
            # Si falla, intentar acceso directo
            try:
                supabase_url = st.secrets["supabase"]["url"]
                supabase_key = st.secrets["supabase"]["key"]
            except:
                st.error("⚠️ Credenciales de Supabase no configuradas. Configura st.secrets en Streamlit Cloud.")
                return None
        
        if not supabase_url or not supabase_key:
            st.error("⚠️ Credenciales de Supabase no configuradas. Verifica que los secrets estén correctamente configurados en Streamlit Cloud.")
            return None
        
        # Validar formato de URL
        if not supabase_url.startswith("https://"):
            st.error("⚠️ La URL de Supabase debe comenzar con https://")
            return None
        
        client = create_client(supabase_url, supabase_key)
        return client
    except Exception as e:
        st.error(f"⚠️ Error al inicializar Supabase: {str(e)}")
        st.info("💡 Verifica que los secrets estén configurados correctamente en Streamlit Cloud (Settings > Secrets)")
        return None


def authenticate_user(email: str, password: str) -> Optional[Dict[str, Any]]:
    """
    Autentica un usuario con Supabase Auth.
    
    Args:
        email: Email del usuario
        password: Contraseña del usuario
    
    Returns:
        Diccionario con token y datos del usuario, o None si falla
    """
    supabase = get_supabase_client()
    if not supabase:
        return None
    
    try:
        response = supabase.auth.sign_in_with_password({
            "email": email,
            "password": password
        })
        
        # Verificar si hay error en la respuesta
        if hasattr(response, 'error') and response.error:
            error_msg = response.error.message
            if "Invalid login credentials" in error_msg or "invalid" in error_msg.lower():
                st.error("❌ Email o contraseña incorrectos.")
            else:
                st.error(f"❌ Error: {error_msg}")
            return None
        
        if response.user and response.session:
            return {
                "token": response.session.access_token,
                "user_id": response.user.id,
                "email": response.user.email,
                "user_data": response.user
            }
        
        st.error("❌ No se pudo obtener la sesión. Verifica tus credenciales.")
        return None
    except Exception as e:
        error_msg = str(e)
        if "Invalid login credentials" in error_msg or "invalid" in error_msg.lower():
            st.error("❌ Email o contraseña incorrectos.")
        else:
            st.error(f"❌ Error en autenticación: {error_msg}")
        return None


def register_user(email: str, password: str, full_name: str = "") -> Optional[Dict[str, Any]]:
    """
    Registra un nuevo usuario en Supabase Auth.
    
    Args:
        email: Email del usuario
        password: Contraseña del usuario
        full_name: Nombre completo del usuario (opcional)
    
    Returns:
        Diccionario con token y datos del usuario, o None si falla
    """
    supabase = get_supabase_client()
    if not supabase:
        return None
    
    try:
        sign_up_data = {
            "email": email,
            "password": password
        }
        
        if full_name:
            sign_up_data["options"] = {
                "data": {
                    "full_name": full_name
                }
            }
        
        response = supabase.auth.sign_up(sign_up_data)
        
        # Verificar si hay error en la respuesta
        if hasattr(response, 'error') and response.error:
            st.error(f"Error al registrar: {response.error.message}")
            return None
        
        # Si hay usuario pero no hay sesión (confirmación de email requerida)
        if response.user:
            if response.session:
                # Sesión disponible (email confirmado automáticamente)
                return {
                    "token": response.session.access_token,
                    "user_id": response.user.id,
                    "email": response.user.email,
                    "user_data": response.user
                }
            else:
                # Email requiere confirmación
                st.info("✅ Cuenta creada. Por favor verifica tu email antes de iniciar sesión.")
                return None
        
        return None
    except Exception as e:
        error_msg = str(e)
        # Mostrar mensaje más específico
        if "already registered" in error_msg.lower() or "already exists" in error_msg.lower():
            st.error("❌ Este email ya está registrado. Intenta iniciar sesión en su lugar.")
        elif "invalid" in error_msg.lower():
            st.error(f"❌ Error: {error_msg}")
        else:
            st.error(f"❌ Error al crear la cuenta: {error_msg}")
        return None


def save_assessment(
    user_id: str,
    assessment_type: str,
    assessment_data: Dict[str, Any],
    rag_context: str = "",
    metadata: Optional[Dict[str, Any]] = None,
    token: Optional[str] = None
) -> bool:
    """
    Guarda una evaluación/rúbrica/PPT generada en la base de datos.
    
    Args:
        user_id: ID del usuario
        assessment_type: Tipo de trabajo ('rubric', 'assessment', 'ppt', 'plan_clase')
        assessment_data: Datos del trabajo (JSON validado)
        rag_context: Contexto RAG utilizado para generar el trabajo
        metadata: Metadatos adicionales (nivel, asignatura, etc.)
        token: Token de autenticación del usuario (requerido para RLS)
    
    Returns:
        True si se guardó correctamente, False en caso contrario
    """
    supabase = get_supabase_client()
    if not supabase:
        return False
    
    try:
        # Si se proporciona token, autenticar el cliente para cumplir con RLS
        if token:
            supabase.auth.set_session(token, refresh_token=token) # Usamos el mismo token como refresh por simplicidad si no tenemos el refresh real a mano, o solo set_session con access_token si la lib lo permite.
            # Nota: supabase-py suele requerir access_token y refresh_token. 
            # Si solo tenemos access_token, podríamos intentar pasar solo headers o usar postgrest client directamente.
            # Una forma más segura con la librería estándar es:
            supabase.postgrest.auth(token)
            
        record = {
            "user_id": user_id,
            "assessment_type": assessment_type,
            "assessment_data": assessment_data,
            "rag_context": rag_context,
            "metadata": metadata or {},
            "created_at": datetime.utcnow().isoformat()
        }
        
        result = supabase.table("assessments").insert(record).execute()
        
        if result.data:
            return True
        return False
    except Exception as e:
        st.error(f"Error al guardar trabajo: {str(e)}")
        return False


def fetch_user_assessments(
    user_id: str,
    assessment_type: Optional[str] = None,
    limit: int = 50
) -> List[Dict[str, Any]]:
    """
    Recupera los trabajos guardados de un usuario.
    
    Args:
        user_id: ID del usuario
        assessment_type: Filtrar por tipo (opcional)
        limit: Límite de resultados
    
    Returns:
        Lista de trabajos guardados
    """
    supabase = get_supabase_client()
    if not supabase:
        return []
    
    try:
        query = supabase.table("assessments").select("*").eq("user_id", user_id)
        
        if assessment_type:
            query = query.eq("assessment_type", assessment_type)
        
        query = query.order("created_at", desc=True).limit(limit)
        
        result = query.execute()
        
        if result.data:
            return result.data
        return []
    except Exception as e:
        st.error(f"Error al recuperar trabajos: {str(e)}")
        return []


def delete_assessment(user_id: str, assessment_id: str) -> bool:
    """
    Elimina un trabajo guardado.
    
    Args:
        user_id: ID del usuario
        assessment_id: ID del trabajo a eliminar
    
    Returns:
        True si se eliminó correctamente, False en caso contrario
    """
    supabase = get_supabase_client()
    if not supabase:
        return False
    
    try:
        result = supabase.table("assessments").delete().eq("id", assessment_id).eq("user_id", user_id).execute()
        return True
    except Exception as e:
        st.error(f"Error al eliminar trabajo: {str(e)}")
        return False


def verify_token(token: str) -> Optional[Dict[str, Any]]:
    """
    Verifica si un token de sesión es válido.
    
    Args:
        token: Token de acceso
    
    Returns:
        Datos del usuario si el token es válido, None en caso contrario
    """
    supabase = get_supabase_client()
    if not supabase:
        return None
    
    try:
        # Obtener el usuario actual usando el token
        response = supabase.auth.get_user(token)
        
        if response and response.user:
            return {
                "user_id": response.user.id,
                "email": response.user.email,
                "user_data": response.user
            }
        return None
    except Exception as e:
        # Token inválido o expirado
        return None


def logout_user():
    """
    Cierra la sesión del usuario actual.
    """
    if "token" in st.session_state:
        del st.session_state["token"]
    if "user_id" in st.session_state:
        del st.session_state["user_id"]
    if "user_email" in st.session_state:
        del st.session_state["user_email"]

