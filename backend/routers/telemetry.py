from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from supabase import create_client, Client
import os
from .analytics_service import calculate_global_stats
from fastapi.responses import JSONResponse

router = APIRouter(
    prefix="/telemetry",
    tags=["Telemetry & Analytics"]
)

# --- CONFIGURACIÓN ---
supabase_url = os.getenv("SUPABASE_URL", "")
# Standard client for public tracking (Anon Key)
supabase: Client = create_client(supabase_url, os.getenv("SUPABASE_KEY", ""))

# Admin client for global analytics (Service Role) - Bypasses 1000 row limits
supabase_admin: Client = create_client(
    supabase_url, 
    os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_KEY", "")
)

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
    if email != "re.se.alvarez@gmail.com":
        print(f"🚫 Telemetry: Denied access to {email}")
        raise HTTPException(status_code=403, detail="Access denied. Super Admin only.")
    
    print(f"📊 Telemetry: Building analytics for {email} (Forced Admin Mode)")
    try:
        # Use supabase_admin to bypass 1000 row cap
        stats = calculate_global_stats(supabase_admin)
        stats["version"] = "v1.2.6-BuildFix"
        
        return JSONResponse(
            content=stats,
            headers={"Cache-Control": "no-store, no-cache, must-revalidate, max-age=0"}
        )

    except Exception as e:
        print(f"❌ Error in analytics: {e}")
        raise HTTPException(status_code=500, detail=str(e))
