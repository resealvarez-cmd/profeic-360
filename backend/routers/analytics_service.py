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
    "mentor": 25,
    "simce": 45,
    "omr": 45,
    "elevador": 30
}

LIB_MAP = {
    "PLANIFICACION": "planificador",
    "RUBRICA": "rubricas",
    "EVALUACION": "evaluaciones",
    "AUDITORIA": "analizador",
    "LECTURA": "lectura-inteligente",
    "ESTRATEGIA": "nee",
    "ELEVADOR": "elevador",
    "SIMCE": "simce",
    "OMR": "omr"
}

def calculate_global_stats(supabase: Client):
    """
    Core logic to calculate global engagement and impact metrics.
    Ensures consistency between Admin and Telemetry dashboards.
    """
    def fetch_all_rows(table_name: str, select_query: str = '*'):
        # Get real total to avoid guessing loop ends (Lighter query using limit(0))
        try:
            res_meta = supabase.table(table_name).select('id', count='exact').limit(0).execute()
            total_in_db = res_meta.count or 0
        except Exception as e:
            print(f"⚠️ Error getting count for {table_name}: {e}")
            total_in_db = 1000 # Fallback 

        all_rows = []
        page_size = 1000
        max_limit = 100000
        
        # Paginación robusta basada en offset real
        for offset in range(0, min(total_in_db, max_limit), page_size):
            try:
                res = supabase.table(table_name).select(select_query).range(offset, offset + page_size - 1).execute()
                data = res.data or []
                all_rows.extend(data)
                if not data: break
            except Exception as e:
                print(f"⚠️ Error fetching {table_name} at offset {offset}: {e}")
                break
        return all_rows

    # 1. Fetch Data with Exact Counts for UI clarity
    try:
        res_auth = supabase.table('authorized_users').select('email', count='exact').limit(0).execute()
        total_authorized = res_auth.count or 1
        
        res_evt_count = supabase.table('telemetry_events').select('id', count='exact').limit(0).execute()
        db_total_events = res_evt_count.count or 0
        
        res_lib_count = supabase.table('biblioteca_recursos').select('id', count='exact').limit(0).execute()
        db_total_resources = res_lib_count.count or 0
    except Exception as e:
        print(f"⚠️ Primary counts failed: {e}")
        total_authorized = 1
        db_total_events = 0
        db_total_resources = 0

    # Fetching only necessary columns to handle 100k rows without memory issues
    events = fetch_all_rows('telemetry_events', 'id, event_name, module, email, metadata, created_at')
    
    # Sort events descending by date for recent_events
    events.sort(key=lambda x: x.get('created_at', ''), reverse=True)

    lib_items = fetch_all_rows('biblioteca_recursos', 'tipo, user_id, created_at')

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
        # Normalize: Remove paths and convert underscores to dashes
        mod_clean = (mod.split('/')[-1] if '/' in mod else mod).replace('_', '-')
        email = ev.get('email', 'anonymous')
        
        if email != "anonymous":
            unique_active_users.add(email)
            user_activity[email] = user_activity.get(email, 0) + 1

        if ev.get('event_name') == 'regenerate_question':
            friction_count += 1

        # Hybrid weight for interaction success without saving
        if 'success' in ev.get('event_name', '').lower() or 'generar' in ev.get('event_name', '').lower() or 'export' in ev.get('event_name', '').lower():
            if mod_clean in SAVED_MINUTES_MAP:
                # Add 40% (increased from 35%) weight for using the tool successfully
                total_saved_minutes += (SAVED_MINUTES_MAP.get(mod_clean, 0) * 0.40)
                module_usage[mod_clean] = module_usage.get(mod_clean, 0) + 0.40

    # Filter out page_views from the "Impactful Events" count if desired,
    # or keep them if they want "Total Raw Events". Since they requested "Total Events",
    # and "we have many more than 1000", they are likely tracking everything.
    # We will keep raw count but provide a clean metric.
    impactful_events = [ev for ev in events if ev.get('event_name') != 'page_view']

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
            "active_users_count": len(unique_active_users),
            "adoption_percent": adoption_pct,
            "saved_hours": round(total_saved_minutes / 60, 1),
            "total_resources": db_total_resources,
            "total_events": db_total_events,
            "impactful_events_count": len(impactful_events),
            "friction_count": friction_count
        },
        "top_modules": sorted_modules,
        "power_users": top_users,
        "school_stats": school_stats,
        "recent_events": events[:25],
        "last_updated": __import__('datetime').datetime.now().isoformat()
    }
