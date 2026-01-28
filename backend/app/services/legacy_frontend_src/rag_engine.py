"""
Motor RAG para ProfeIC usando Supabase Vector Store.
Elimina la dependencia de archivos locales y permite escalabilidad en la nube.
"""

import os
import streamlit as st
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import SupabaseVectorStore
from supabase.client import create_client, Client

@st.cache_resource
def initialize_rag_engine(
    embedding_model: str = "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"
):
    """
    Inicializa el motor RAG conectándose a Supabase.
    
    Args:
        embedding_model: Modelo de embeddings a usar (debe coincidir con ingest_data.py)
    
    Returns:
        Retriever configurado o None si falla
    """
    # Obtener credenciales
    supabase_url = os.environ.get("SUPABASE_URL") or st.secrets.get("supabase", {}).get("SUPABASE_URL")
    supabase_key = os.environ.get("SUPABASE_KEY") or st.secrets.get("supabase", {}).get("SUPABASE_KEY")
    
    if not supabase_url or not supabase_key:
        st.error("❌ Error: Credenciales de Supabase no encontradas (SUPABASE_URL, SUPABASE_KEY).")
        return None
        
    try:
        # Cliente Supabase
        supabase: Client = create_client(supabase_url, supabase_key)
        
        # Embeddings
        embeddings = HuggingFaceEmbeddings(model_name=embedding_model)
        
        # Vector Store
        vector_store = SupabaseVectorStore(
            client=supabase,
            embedding=embeddings,
            table_name="documents",
            query_name="match_documents"
        )
        
        # Crear retriever
        retriever = vector_store.as_retriever(
            search_kwargs={
                "k": 5
            }
        )
        return retriever
        
    except Exception as e:
        st.error(f"❌ Error al conectar con Supabase Vector Store: {str(e)}")
        return None


def retrieve_context_with_priority(
    retriever,
    query: str,
    prioritize_institutional: bool = True
) -> str:
    """
    Recupera contexto del RAG con prioridad para documentos institucionales.
    
    Args:
        retriever: Retriever de LangChain
        query: Consulta del usuario
        prioritize_institutional: Si True, prioriza documentos institucionales
    
    Returns:
        Contexto formateado como string
    """
    if retriever is None:
        return ""
    
    try:
        # Recuperar documentos
        docs = retriever.invoke(query)
    except Exception as e:
        st.error(f"Error al recuperar documentos: {str(e)}")
        return ""
    
    if not docs:
        return ""
    
    # Si se prioriza institucional, reordenar para que aparezcan primero
    if prioritize_institutional:
        institutional_docs = [d for d in docs if d.metadata.get("category") == "institucional"]
        mineduc_docs = [d for d in docs if d.metadata.get("category") == "mineduc"]
        docs = institutional_docs + mineduc_docs
    
    # Formatear contexto
    context_parts = []
    for i, doc in enumerate(docs, 1):
        content = doc.page_content
        metadata = doc.metadata
        category = metadata.get("category", "desconocido")
        source = metadata.get("source_file", "desconocido")
        
        context_parts.append(
            f"[Documento {i} - Categoría: {category.upper()} - Fuente: {source}]\n"
            f"{content}\n"
        )
    
    return "\n---\n".join(context_parts)

