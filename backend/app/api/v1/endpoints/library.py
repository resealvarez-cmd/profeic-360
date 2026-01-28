from fastapi import APIRouter, HTTPException
from app.db.supabase import supabase
from app.models.common import SaveWorkRequest

router = APIRouter()

@router.post("/library/save")
async def save_library(work: SaveWorkRequest):
    if not supabase: raise HTTPException(500, "DB Off")
    res = supabase.table("library").insert(work.dict()).execute()
    return {"status": "ok", "id": res.data[0]['id']}

@router.get("/library")
async def list_library(user_id: str):
    if not supabase: raise HTTPException(500, "DB Off")
    return supabase.table("library").select("*").eq("user_id", user_id).order("created_at", desc=True).execute().data

@router.delete("/library/{id}")
async def del_library(id: str):
    if not supabase: raise HTTPException(500, "DB Off")
    supabase.table("library").delete().eq("id", id).execute()
    return {"status": "ok"}
