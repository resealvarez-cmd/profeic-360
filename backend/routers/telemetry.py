from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from supabase import create_client, Client
import os
from dotenv import load_dotenv

load_dotenv()

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
        raise HTTPException(status_code=403, detail="Access denied. Super Admin only.")

    try:
        # 1. Fetch total authorized users (for Adoption denominator)
        res_auth = supabase.table('authorized_users').select('email', count='exact').execute()
        total_authorized = res_auth.count or 1 

        # 2. Fetch all telemetry events
        res = supabase.table('telemetry_events').select('*').execute()
        events = res.data or []

        # 3. Fetch historical library resources
        res_lib = supabase.table('biblioteca_recursos').select('tipo, user_id').execute()
        library_resources = res_lib.data or []

        # 4. Basic Aggregations
        total_events = len(events)
        module_usage: Dict[str, int] = {}
        user_activity: Dict[str, int] = {}
        unique_identities = set() # To track unique users across telemetry AND library
        friction_events = 0 
        
        # 5. Process Library Items (Historical)
        total_saved_minutes = 0
        LIB_MAP = {
            "PLANIFICACION": "planificador",
            "RUBRICA": "rubricas",
            "EVALUACION": "evaluaciones",
            "AUDITORIA": "analizador",
            "LECTURA": "lectura-inteligente",
            "ESTRATEGIA": "nee",
            "ELEVADOR": "mentor"
        }

        for item in library_resources:
            tipo = item.get('tipo', '')
            uid = item.get('user_id')
            if uid: unique_identities.add(uid) # Add user_id to active set
            
            mod_key = LIB_MAP.get(tipo, "unknown")
            weight = SAVED_MINUTES_MAP.get(mod_key, 0)
            total_saved_minutes += weight

        # 6. Process Telemetry Events (Real-time)
        for event in events:
            m = event.get('module') or "unknown"
            m_clean = m.split('/')[-1] if '/' in m else m
            
            module_usage[m_clean] = module_usage.get(m_clean, 0) + 1
            
            email_user = event.get('email') or "anonymous"
            user_activity[email_user] = user_activity.get(email_user, 0) + 1
            if email_user != "anonymous": unique_identities.add(email_user)
            
            if event.get('event_name') == 'regenerate_question':
                friction_events += 1

            if 'success' in event.get('event_name', '').lower() or 'generar' in event.get('event_name', '').lower():
                if m_clean == 'mentor' or m_clean == 'lectura-inteligente':
                     weight = SAVED_MINUTES_MAP.get(m_clean, 0)
                     total_saved_minutes += (weight * 0.2)

        # 7. Adoption Calculation (%)
        unique_active_count = len(unique_identities)
        adoption_percent = round((unique_active_count / total_authorized) * 100, 1) if total_authorized > 0 else 0

        # 8. Format Top Users (Power Users)
        # We prioritize those with email if available
        top_users = sorted(
            [{"email": k, "count": v} for k, v in user_activity.items()],
            key=lambda x: x["count"],
            reverse=True
        )[:5]

        # 9. Format Module Usage
        module_stats = sorted(
            [{"name": k, "value": v} for k, v in module_usage.items()],
            key=lambda x: x["value"],
            reverse=True
        )

        return {
            "summary": {
                "total_events": total_events,
                "saved_hours": round(total_saved_minutes / 60, 1),
                "adoption_percent": adoption_percent,
                "active_users_count": unique_active_count,
                "total_authorized": total_authorized,
                "friction_count": friction_events
            },
            "top_modules": module_stats,
            "power_users": top_users,
            "recent_events": events[-10:]
        }

    except Exception as e:
        print(f"Error calculating analytics: {e}")
        raise HTTPException(status_code=500, detail=str(e))
