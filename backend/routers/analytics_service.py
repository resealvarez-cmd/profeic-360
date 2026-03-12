import os
from typing import Dict, Any, List, Set
from supabase import Client

SAVED_MINUTES_MAP = {
    "planificador": 85,
    "lectura-inteligente": 55,
    "rubricas": 40,
    "analizador": 35,
    "evaluaciones": 60,
    "nee": 50,
    "mentor": 15
}

LIB_MAP = {
    "PLANIFICACION": "planificador",
    "RUBRICA": "rubricas",
    "EVALUACION": "evaluaciones",
    "AUDITORIA": "analizador",
    "LECTURA": "lectura-inteligente",
    "ESTRATEGIA": "nee",
    "ELEVADOR": "mentor"
}

def calculate_global_stats(supabase: Client):
    """
    Core logic to calculate global engagement and impact metrics.
    Ensures consistency between Admin and Telemetry dashboards.
    """
    # 1. Fetch Data
    res_auth = supabase.table('authorized_users').select('email', count='exact').execute()
    total_authorized = res_auth.count or 1

    res_events = supabase.table('telemetry_events').select('*').order('created_at', desc=True).limit(2000).execute()
    events = res_events.data or []

    res_lib = supabase.table('biblioteca_recursos').select('tipo, user_id, created_at').execute()
    lib_items = res_lib.data or []

    res_profiles = supabase.table('profiles').select('id, email, full_name, school_id').execute()
    profiles_data = res_profiles.data or []
    profile_map = {p['id']: {"email": p.get('email', 'anon'), "name": p.get('full_name', 'Docente')} for p in profiles_data}
    email_to_name = {p.get('email'): p.get('full_name', 'Docente') for p in profiles_data if p.get('email')}
    user_to_school = {p['id']: p.get('school_id') or "individual" for p in profiles_data}

    # 2. Process Metrics
    total_saved_minutes = 0
    module_usage: Dict[str, int] = {}
    user_activity: Dict[str, int] = {}
    unique_active_users: Set[str] = set()
    friction_count = 0

    # 2.1 Process Library Resources (Proven Success)
    for item in lib_items:
        tipo = str(item.get('tipo', '')).upper()
        uid = item.get('user_id')
        user_info = profile_map.get(uid, {"email": "anonymous", "name": "Anónimo"})
        email = user_info["email"]
        
        if email != "anonymous":
            unique_active_users.add(email)
            user_activity[email] = user_activity.get(email, 0) + 1
        
        mod_key = LIB_MAP.get(tipo, "unknown")
        if mod_key != "unknown":
            total_saved_minutes += SAVED_MINUTES_MAP.get(mod_key, 0)
            module_usage[mod_key] = module_usage.get(mod_key, 0) + 1

    # 2.2 Process Telemetry Events (Interaction/Drift)
    for ev in events:
        mod = ev.get('module', 'unknown')
        mod_clean = mod.split('/')[-1] if '/' in mod else mod
        email = ev.get('email', 'anonymous')
        
        if email != "anonymous":
            unique_active_users.add(email)
            user_activity[email] = user_activity.get(email, 0) + 1

        if ev.get('event_name') == 'regenerate_question':
            friction_count += 1

        # Hybrid weight for interaction success without saving
        if 'success' in ev.get('event_name', '').lower() or 'generar' in ev.get('event_name', '').lower():
            if mod_clean in SAVED_MINUTES_MAP:
                # Add 20% of the weight for using the tool successfully even if not saved
                total_saved_minutes += (SAVED_MINUTES_MAP.get(mod_clean, 0) * 0.2)
                module_usage[mod_clean] = module_usage.get(mod_clean, 0) + 0.2

    # 3. Final Aggregations
    adoption_pct = round((len(unique_active_users) / total_authorized) * 100, 1) if total_authorized > 0 else 0
    
    top_users = []
    sorted_user_activity = sorted(user_activity.items(), key=lambda x: x[1], reverse=True)[:10]
    for email, count in sorted_user_activity:
        name = email_to_name.get(email, email)
        top_users.append({"email": email, "count": int(count), "name": name})

    sorted_modules = sorted(
        [{"name": k.capitalize(), "val": int(v), "value": int(v)} for k, v in module_usage.items()],
        key=lambda x: x["val"],
        reverse=True
    )

    # 4. School Stats (Multi-tenancy)
    school_counts = {}
    for p in profiles_data:
        sid = p.get('school_id') or "individual"
        school_counts[sid] = school_counts.get(sid, 0) + 1

    res_schools = supabase.table('schools').select('id, name').execute()
    schools_name_map = {s['id']: s['name'] for s in (res_schools.data or [])}
    schools_name_map["individual"] = "Profesores Independientes"

    school_stats = sorted(
        [{"name": schools_name_map.get(sid, sid), "count": count} for sid, count in school_counts.items()],
        key=lambda x: x["count"],
        reverse=True
    )

    return {
        "summary": {
            "total_authorized": total_authorized,
            "active_users": len(unique_active_users),
            "active_users_count": len(unique_active_users),
            "adoption_percent": adoption_pct,
            "saved_hours": round(total_saved_minutes / 60, 1),
            "total_resources": len(lib_items),
            "total_events": len(events),
            "friction_count": friction_count
        },
        "top_modules": sorted_modules,
        "power_users": top_users,
        "school_stats": school_stats,
        "recent_events": events[:10]
    }
