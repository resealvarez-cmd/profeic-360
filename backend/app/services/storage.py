import os
import io
from fastapi import UploadFile, HTTPException
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

class StorageService:
    def __init__(self):
        self.url = os.getenv("SUPABASE_URL")
        self.key = os.getenv("SUPABASE_KEY")
        self.bucket = "biblioteca_contexto"
        
        if not self.url or not self.key:
            print("⚠️ ADVERTENCIA: Credenciales de Supabase no encontradas en environment.")
            self.client: Client = None
        else:
            self.client = create_client(self.url, self.key)

    def upload_file(self, file: UploadFile, user_id: str) -> dict:
        """
        Sube un archivo a Supabase Storage.
        Retorna la URL pública o path del archivo.
        """
        if not self.client:
            raise HTTPException(status_code=500, detail="Servicio de Storage no configurado")

        try:
            # Leemos el contenido del archivo
            file_content = file.file.read()
            
            # Definimos path: user_id/filename (para evitar colisiones entre usuarios)
            # Sanitizamos un poco el nombre por seguridad básica
            filename = os.path.basename(file.filename)
            file_path = f"{user_id}/{filename}"
            
            # Subir a Supabase (upsert=True para reemplazar si existe)
            # Nota: 'file_content' debe ser bytes
            response = self.client.storage.from_(self.bucket).upload(
                path=file_path,
                file=file_content,
                file_options={"content-type": file.content_type, "upsert": "true"}
            )
            
            # Resetear puntero del archivo por si se usa después
            file.file.seek(0)
            
            return {
                "status": "success",
                "path": file_path,
                "full_path": f"{self.bucket}/{file_path}",
                "id": response.id if hasattr(response, 'id') else None
            }
            
        except Exception as e:
            print(f"❌ Error subiendo archivo a Supabase: {e}")
            raise HTTPException(status_code=500, detail=str(e))

    def get_public_url(self, file_path: str) -> str:
        if not self.client:
            return ""
        return self.client.storage.from_(self.bucket).get_public_url(file_path)

# Instancia global
storage = StorageService()
