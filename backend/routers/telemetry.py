from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from supabase import create_client, Client
import os
from .analytics_service import calculate_global_stats


router = APIRouter(
    prefix="/telemetry",
    tags=["Telemetry & Analytics"]
)

# --- CONFIGURACIÓN ---
supabase_url = os.getenv("SUPABASE_URL")
role_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
supabase_key = role_key if role_key and role_key != "false_role_key" else os.getenv("SUPABASE_KEY")
supabase: Client = create_client(supabase_url, supabase_key)

# --- WEIGHTS FOR SAVED HOURS (Minutes) ---
SAVED_MINUTES_MAP = {
    "planificador": 85,
    "lectura-inteligente": 55,
    "rubricas": 40,
    "analizador": 35,
    "evaluaciones": 60,
    "nee": 50,
    "mentor": 15
}

class TelemetryTrackRequest(BaseModel):
    user_id: str
    email: str
    event_name: str
    module: Optional[str] = None
    metadata: Dict[str, Any] = {}

@router.post("/track")
async def track_event(req: TelemetryTrackRequest):
    try:
        res = supabase.table('telemetry_events').insert({
            "user_id": req.user_id,
            "email": req.email,
            "event_name": req.event_name,
            "module": req.module,
            "metadata": req.metadata
        }).execute()
        return {"status": "ok"}
    except Exception as e:
        print(f"Error tracking event: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/analytics")
async def get_product_analytics(email: str = Query(...)):
    # SECURITY: Only re.se.alvarez@gmail.com can call this
    if email != "re.se.alvarez@gmail.com":
        print(f"🚫 Telemetry: Denied access to {email}")
        raise HTTPException(status_code=403, detail="Access denied. Super Admin only.")
    
    print(f"📊 Telemetry: Building analytics for {email} (Centralized)")
    try:
        stats = calculate_global_stats(supabase)
        stats["version"] = "v1.2.0-Sync" # Unificado
        return stats

    except Exception as e:
        print(f"❌ Error in analytics: {e}")
        raise HTTPException(status_code=500, detail=str(e))

    except Exception as e:
        print(f"Error calculating analytics: {e}")
        raise HTTPException(status_code=500, detail=str(e))
