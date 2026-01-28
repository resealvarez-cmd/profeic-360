import requests
import json

print("📡 Probando conexión al servidor...")

try:
    # Simulamos la petición que hace la página web
    response = requests.post("http://localhost:8000/curriculum/options", json={})
    
    print(f"Estado HTTP: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        niveles = data.get("data", [])
        
        if len(niveles) > 0:
            print("\n✅ ¡ÉXITO TOTAL! El servidor funciona.")
            print(f"📦 Niveles encontrados ({len(niveles)}):")
            print(niveles)
            print("\n--> CONCLUSIÓN: El problema está 100% en el Frontend (Navegador).")
        else:
            print("\n⚠️ El servidor responde, pero la lista está VACÍA.")
            print("Revisa si desactivaste el RLS en Supabase.")
    else:
        print(f"\n❌ Error del servidor: {response.text}")

except Exception as e:
    print(f"\n❌ No se pudo conectar. Asegúrate de que uvicorn esté corriendo. Error: {e}")