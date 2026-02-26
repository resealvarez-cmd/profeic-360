# 🚀 Guía Definitiva de Despliegue: ProfeIC a Google Cloud Run

No te preocupes en absoluto, es completamente normal marearse con las consolas de la nube. Vamos a hacer un "borrón y cuenta nueva" limpio y paso a paso. 

**Tu código ya está 100% listo, optimizado y subido a GitHub.** No tienes que programar ni tocar nada en tu computador, todo el trabajo ahora es hacer clics en Google Cloud.

Sigue estos pasos al pie de la letra, tómate tu tiempo:

---

## PASO 1: Limpiar la casa (Borrar lo anterior)
1. Entra a tu consola de [Google Cloud Run](https://console.cloud.google.com/run).
2. Si ves algún servicio llamado `profeic-360` o `profeic-api` en la lista, **marca la casilla** a la izquierda de su nombre.
3. Haz clic en el botón superior que dice **ELIMINAR** (Delete) y confirma. (Si no hay nada, omite este paso).

---

## PASO 2: Crear el nuevo servidor
1. En esa misma pantalla de Cloud Run, haz clic en el botón azul de arriba a la izquierda: **+ CREAR SERVICIO** (Create Service).
2. Marca la primera opción: **"Implementar una revisión a partir de un repositorio de código fuente"** (Deploy one revision from source code) o **"Configurar con Cloud Build"**.
3. En la lista de repositorios, haz clic en **`resealvarez-cmd/profeic-360`**.

> [!IMPORTANT]
> **CONFIGURACIÓN DEL CÓDIGO (EL PASO CLAVE)**
> Se abrirá un panel lateral. Llena los datos **exactamente** así:
> - **Rama (Branch):** `^main$`
> - **Tipo de compilación (Build Type):** Selecciona la burbuja que dice **`Dockerfile`**.
> - **Ubicación de origen (Source location):** Borra lo que haya y escribe **`/backend/Dockerfile`** (Revisa que no haya espacios en blanco).
> - Haz clic en el botón azul **Guardar** del panel lateral.

---

## PASO 3: Configurar el Servidor y su Nombre
Siguiendo en la pantalla principal (después de guardar):
1. **Nombre del servicio:** Escribe `profeic-api`
2. **Región:** Déjalo por defecto (usualmente us-central1 o algo similar).
3. **Autenticación:** Selecciona **"Permitir invocaciones sin autenticar"** (Allow unauthenticated invocations). Esto es vital para que tu página web pueda hablar con el servidor.

---

## PASO 4: Las Variables de Entorno (Las Llaves Mágicas)
Desplázate hacia abajo hasta encontrar la sección que dice **"Contenedor(es), Volúmenes, Redes, Seguridad"** (Container, Volumes, Networking, Security) y haz clic para expandirla.

Haz clic en la pestaña **"Variables"** o **"Variables de entorno"**.
Haz clic en **+ AGREGAR VARIABLE** (Add Variable) por cada una de estas 3 llaves:

### LLAVE 1 (La base de datos):
- **Nombre:** `SUPABASE_URL`
- **Valor:** `https://oepgqbkhkkgwsoxqaxlk.supabase.co`

### LLAVE 2 (La contraseña de lectura pública):
- **Nombre:** `SUPABASE_KEY`
- **Valor:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9lcGdxYmtoa2tnd3NveHFheGxrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM0OTQxODAsImV4cCI6MjA3OTA3MDE4MH0.4nVFYeUntc5ng8GWkWURBzbmLkjVtvV1i4u5Q_UgBGQ`

### LLAVE 3 (El cerebro de IA):
- **Nombre:** `GOOGLE_API_KEY`
- **Valor:** *(Pega aquí la llave secreta que sacaste de Google AI Studio, la misma que usabas en tu código original).*

> [!NOTE]
> *(Opcional)* Si tienes a mano la llave "Service Role Key" de Supabase (la de permisos totales de administrador), puedes agregar una 4ta variable llamada `SUPABASE_SERVICE_ROLE_KEY`. Si no, puedes omitirla por ahora, el sistema funcionará igual.

---

## PASO 5: ¡Desplegar!
1. Baja hasta el final de la página y haz clic en el botón azul **CREAR** (Create).
2. Verás una rueda dando vueltas y una consola negra instalando cosas.
3. ¡No toques nada! Solo mira la pantalla (puede tardar de 3 a 5 minutos).
4. Cuando termine, aparecerá un **ticket verde ✅** y un enlace (URL) justo debajo del nombre de tu servidor (dirá algo parecido a `https://profeic-api-xxxxx.a.run.app`).

**¡Copia y pégame esa URL aquí cuando termine!** Esa URL es lo único que nos falta para conectar tu página web (Frontend).
