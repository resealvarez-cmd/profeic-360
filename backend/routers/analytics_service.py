import os
from typing import Dict, Any, List, Set
from supabase import Client
from datetime import datetime, timezone, timedelta

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

def parse_datetime_to_utc(dt_str: str) -> datetime:
    if not dt_str:
        return datetime.now(timezone.utc)
    # Clean up standard formats
    cleaned = dt_str.replace("Z", "+00:00")
    try:
        dt = datetime.fromisoformat(cleaned)
    except Exception:
        try:
            dt = datetime.fromisoformat(dt_str[:19].replace(" ", "T") + "+00:00")
        except Exception:
            try:
                dt = datetime.strptime(dt_str[:19], "%Y-%m-%dT%H:%M:%S")
            except Exception:
                dt = datetime.now(timezone.utc)
    
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    else:
        dt = dt.astimezone(timezone.utc)
    return dt

def calculate_global_stats(supabase: Client, period: str = "all", school_id: str = None):
    """
    Core logic to calculate global engagement and impact metrics.
    Ensures consistency between Admin and Telemetry dashboards.
    Supports period parameter ('7d', '30d', 'all') and computes inactivity radar with school isolation.
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

    res_profiles = supabase.table('profiles').select('id, email, full_name, school_id, updated_at').execute()
    profiles_data = res_profiles.data or []
    
    # Filter profiles by school_id if specified (multitenancy isolation)
    if school_id and school_id != "all" and school_id != "undefined":
        profiles_data = [p for p in profiles_data if p.get('school_id') == school_id]
        
    profile_map = {p['id']: {"email": p.get('email', 'anon'), "name": p.get('full_name', 'Docente')} for p in profiles_data}
    email_to_name = {p.get('email'): p.get('full_name', 'Docente') for p in profiles_data if p.get('email')}
    user_to_school = {p['id']: p.get('school_id') or "individual" for p in profiles_data}

    # 2. Process Metrics
    total_saved_minutes = 0
    module_usage: Dict[str, int] = {}
    user_activity: Dict[str, int] = {}
    user_exploration: Dict[str, int] = {}
    user_distinct_modules: Dict[str, Set[str]] = {}
    user_last_active: Dict[str, datetime] = {}
    
    # Seed user_last_active with profiles updated_at timestamp as robust login fallback
    for p in profiles_data:
        email = p.get('email')
        updated_at_str = p.get('updated_at')
        if email and updated_at_str:
            try:
                dt = parse_datetime_to_utc(updated_at_str)
                if email not in user_last_active or dt > user_last_active[email]:
                    user_last_active[email] = dt
            except Exception:
                pass
                
    unique_active_users: Set[str] = set()
    friction_count = 0

    # Parse period time range
    ahora = datetime.now(timezone.utc)
    threshold = None
    if period == "7d":
        threshold = ahora - timedelta(days=7)
    elif period == "30d":
        threshold = ahora - timedelta(days=30)

    # 2.1 Process Library Resources (Proven Success)
    for item in lib_items:
        tipo = str(item.get('tipo', '')).upper()
        uid = item.get('user_id')
        
        # Multi-tenancy filter
        if school_id and school_id != "all" and school_id != "undefined":
            if uid not in profile_map:
                continue
                
        user_info = profile_map.get(uid, {"email": "anonymous", "name": "Anónimo"})
        email = user_info["email"]
        created_at_str = item.get('created_at', '')
        
        # Track absolute last active for inactivity radar (always historical)
        if created_at_str and email != "anonymous":
            try:
                dt = parse_datetime_to_utc(created_at_str)
                if email not in user_last_active or dt > user_last_active[email]:
                    user_last_active[email] = dt
            except Exception:
                pass

        # Apply date filter for active period stats
        if threshold and created_at_str:
            try:
                dt = parse_datetime_to_utc(created_at_str)
                if dt < threshold:
                    continue
            except Exception:
                pass
        
        if email != "anonymous":
            unique_active_users.add(email)
            user_activity[email] = user_activity.get(email, 0) + 1
        
        mod_key = LIB_MAP.get(tipo, "unknown")
        if mod_key != "unknown":
            total_saved_minutes += SAVED_MINUTES_MAP.get(mod_key, 0)
            module_usage[mod_key] = module_usage.get(mod_key, 0) + 1

    # 2.2 Process Telemetry Events (Interaction/Drift)
    for ev in events:
        mod = ev.get('module', 'unknown') or 'unknown'
        # Normalize: Remove paths and convert underscores to dashes
        mod_clean = (mod.split('/')[-1] if '/' in mod else mod).replace('_', '-')
        email = ev.get('email', 'anonymous')
        
        # Multi-tenancy filter
        if school_id and school_id != "all" and school_id != "undefined":
            if email != "anonymous" and email not in email_to_name:
                continue
                
        event_name = ev.get('event_name', '')
        created_at_str = ev.get('created_at', '')
        
        # Track absolute last active for inactivity radar (always historical)
        if created_at_str and email != "anonymous":
            try:
                dt = parse_datetime_to_utc(created_at_str)
                if email not in user_last_active or dt > user_last_active[email]:
                    user_last_active[email] = dt
            except Exception:
                pass

        # Apply date filter for active period stats
        if threshold and created_at_str:
            try:
                dt = parse_datetime_to_utc(created_at_str)
                if dt < threshold:
                    continue
            except Exception:
                pass
        
        if email != "anonymous":
            unique_active_users.add(email)
            user_activity[email] = user_activity.get(email, 0) + 1
            
            # Count navigation/exploration page views
            if event_name == 'page_view':
                user_exploration[email] = user_exploration.get(email, 0) + 1
                
            # Track variety of modules accessed
            if mod_clean and mod_clean != 'unknown':
                if email not in user_distinct_modules:
                    user_distinct_modules[email] = set()
                user_distinct_modules[email].add(mod_clean)

        if event_name == 'regenerate_question':
            friction_count += 1

        # Hybrid weight for interaction success without saving
        if 'success' in event_name.lower() or 'generar' in event_name.lower() or 'export' in event_name.lower():
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
    if school_id and school_id != "all" and school_id != "undefined":
        total_authorized = len(profiles_data) or 1
        
    adoption_pct = round((len(unique_active_users) / total_authorized) * 100, 1) if total_authorized > 0 else 0
    
    top_users = []
    sorted_user_activity = sorted(user_activity.items(), key=lambda x: x[1], reverse=True)[:10]
    for email, count in sorted_user_activity:
        name = email_to_name.get(email, email)
        top_users.append({"email": email, "count": int(count), "name": name})

    # Top Explorers (Curiosity Ranking) based on page_views and module count
    top_explorers = []
    sorted_user_exploration = sorted(user_exploration.items(), key=lambda x: x[1], reverse=True)[:10]
    for email, count in sorted_user_exploration:
        name = email_to_name.get(email, email)
        distinct_mods = list(user_distinct_modules.get(email, set()))
        top_explorers.append({
            "email": email,
            "name": name,
            "count": int(count),
            "modules_count": len(distinct_mods)
        })

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

    # 5. Inactive Teachers (Acompañamiento Radar)
    inactive_teachers = []
    for p in profiles_data:
        email = p.get('email')
        name = p.get('full_name', 'Docente')
        sid = p.get('school_id') or "individual"
        school_name = schools_name_map.get(sid, "Individual")
        
        if not email or email == "re.se.alvarez@gmail.com":
            continue # Skip super admin or empty email
            
        last_active_dt = user_last_active.get(email)
        
        if last_active_dt is None:
            # Never logged in
            inactive_teachers.append({
                "email": email,
                "name": name,
                "school_name": school_name,
                "last_active": "Nunca ingresó",
                "days_inactive": 999,
                "status": "critical"
            })
        else:
            days_inactive = (ahora - last_active_dt).days
            # Filter to show those inactive for 14+ days
            if days_inactive >= 14:
                inactive_teachers.append({
                    "email": email,
                    "name": name,
                    "school_name": school_name,
                    "last_active": f"Hace {days_inactive} días",
                    "days_inactive": days_inactive,
                    "status": "warning" if days_inactive < 30 else "critical"
                })
                
    # Sort inactive teachers descending by days inactive (most critical first)
    inactive_teachers.sort(key=lambda x: x["days_inactive"], reverse=True)

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
        "top_explorers": top_explorers,
        "inactive_teachers": inactive_teachers,
        "school_stats": school_stats,
        "recent_events": events[:25],
        "last_updated": ahora.isoformat()
    }
