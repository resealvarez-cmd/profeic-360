import logging
import ctypes
import os
import cv2
import numpy as np
import json
from typing import List, Tuple, Dict, Any, Optional
from imutils.perspective import four_point_transform

logger = logging.getLogger(__name__)

# Ayuda para encontrar zbar en Apple Silicon / Homebrew
try:
    import ctypes
    import os
    brew_lib_path = "/opt/homebrew/lib"
    if os.path.exists(brew_lib_path):
        os.environ["PATH"] = f"{brew_lib_path}:{os.environ.get('PATH', '')}"
        # Intentar cargar para validar
        # ctypes.CDLL(os.path.join(brew_lib_path, "libzbar.dylib"))
    elif os.path.exists("/usr/local/lib/libzbar.dylib"):
        pass # Ya está en ruta estándar
except Exception as e:
    logger.warning(f"No se pudo pre-cargar libzbar: {e}")

try:
    from pyzbar import pyzbar
    PYZBAR_AVAILABLE = True
except ImportError:
    logger.error("La librería 'pyzbar' no está instalada.")
    PYZBAR_AVAILABLE = False
except Exception as e:
    logger.error(f"Error cargando pyzbar (posiblemente falta libzbar de sistema): {e}")
    PYZBAR_AVAILABLE = False

class OMRVisionService:
    @staticmethod
    def process_image(image_bytes: bytes) -> Dict[str, Any]:
        """
        Procesa una imagen OMR usando Grilla de Coordenadas Fijas (Coordinate-based OMR).
        Basado en el generador de PDF (omr_template_service.py).
        Resolución Objetivo: 1700 x 2200 (LETTER 200 DPI).
        """
        logger.info(f"--- NUEVO PROCESO OMR --- Bytes recibidos: {len(image_bytes)}")
        
        # --- 1. NORMALIZACIÓN DE ENTRADA (SOPORTE HEIC) ---
        nparr = np.frombuffer(image_bytes, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if image is None:
            # Si falla OpenCV, intentamos con Pillow (que con pillow-heif soporta HEIC)
            try:
                from PIL import Image
                import io
                try:
                    from pillow_heif import register_heif_opener
                    register_heif_opener()
                    logger.info("HEIF: Registrado correctamente.")
                except ImportError:
                    logger.error("HEIF: pillow-heif NO ENCONTRADO en el entorno virtual.")
                
                logger.info(f"PIL: Intentando Image.open sobre {len(image_bytes)} bytes...")
                pil_image = Image.open(io.BytesIO(image_bytes))
                # Convertir a RGB y luego a formato OpenCV (BGR)
                image = cv2.cvtColor(np.array(pil_image.convert("RGB")), cv2.COLOR_RGB2BGR)
                logger.info(f"Decodificación con Pillow exitosa. Tamaño: {image.shape}")
            except Exception as e:
                logger.error(f"Falla total de decodificación: {str(e)}")
                raise ValueError(f"ERROR_DECODIFICACION: {str(e)}. Asegúrate de ejecutar 'pip install pillow-heif' para soporte de iPhone.")

        if image is None:
            raise ValueError("ERROR_DECODIFICACION: No se pudo convertir el archivo en una imagen válida.")

        # --- 2. DETECCIÓN FIDUCIARIA Y ALINEACIÓN (WARP) ---
        # Reducción de escala temporal para detección rápida si es una foto enorme (iPhone)
        h, w = image.shape[:2]
        sh_scale = 1.0
        if w > 2000:
            sh_scale = 2000.0 / w
            sh_img = cv2.resize(image, (2000, int(h * sh_scale)))
        else:
            sh_img = image.copy()

        gray_sh = cv2.cvtColor(sh_img, cv2.COLOR_BGR2GRAY)
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY) # Full resolution for final warp
        blurred = cv2.GaussianBlur(gray_sh, (5, 5), 0)
        thresh = cv2.threshold(blurred, 0, 255, cv2.THRESH_BINARY_INV | cv2.THRESH_OTSU)[1]
        
        cnts = cv2.findContours(thresh.copy(), cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        cnts = cnts[0] if len(cnts) == 2 else cnts[1]
        
        fiducials = []
        for c in cnts:
            (x, y, w, h) = cv2.boundingRect(c)
            ar = w / float(h)
            # Más flexible: desde 20px hasta 250px, proporción 0.7 a 1.3
            if w >= 20 and h >= 20 and w < 300 and h < 300 and 0.7 <= ar <= 1.3:
                fiducials.append(c)
        
        used_fiducials = False
        if len(fiducials) < 4:
            # Fallback: intentar detectar el papel entero como un solo bloque si fallan los fiduciales
            cnts = sorted(cnts, key=cv2.contourArea, reverse=True)
            doc_cnt = None
            for c in cnts:
                peri = cv2.arcLength(c, True)
                approx = cv2.approxPolyDP(c, 0.02 * peri, True)
                if len(approx) == 4:
                    doc_cnt = approx
                    break
            if doc_cnt is None:
                raise ValueError("ERROR_DETECCION: No se detectaron los 4 marcadores de las esquinas ni el borde del papel. Asegúrate de que se vea toda la hoja.")
            
            # Escalar de vuelta si se usó reducción
            if sh_scale < 1.0:
                doc_cnt = (doc_cnt / sh_scale).astype(np.int32)
        else:
            used_fiducials = True
            # Encontrar los extremos de los fiduciales para el warp
            pts = []
            for f in fiducials:
                M = cv2.moments(f)
                if M["m00"] != 0:
                    cX = int(M["m10"] / M["m00"])
                    cY = int(M["m01"] / M["m00"])
                    # Aplicar escala inversa aquí mismo
                    if sh_scale < 1.0:
                        cX = int(cX / sh_scale)
                        cY = int(cY / sh_scale)
                    pts.append([cX, cY])
            
            # Ordenar puntos: TL, TR, BR, BL
            pts = np.array(pts, dtype="float32")
            rect = np.zeros((4, 2), dtype="float32")
            s = pts.sum(axis=1)
            rect[0] = pts[np.argmin(s)] # TL
            rect[2] = pts[np.argmax(s)] # BR
            diff = np.diff(pts, axis=1)
            rect[1] = pts[np.argmin(diff)] # TR
            rect[3] = pts[np.argmax(diff)] # BL
            doc_cnt = rect

        # Aplicar Transformación y Normalizar a tamaño LETTER 200 DPI
        TARGET_W, TARGET_H = 1700, 2200
        warped = four_point_transform(gray, doc_cnt.reshape(4, 2))
        warped = cv2.resize(warped, (TARGET_W, TARGET_H))
        
        # Binarización para lectura de burbujas
        thresh_warped = cv2.threshold(warped, 0, 255, cv2.THRESH_BINARY_INV | cv2.THRESH_OTSU)[1]

        # --- 3. CONSTANTES GEOMÉTRICAS Y DE CONVERSIÓN ---
        if used_fiducials:
            # Los limites de la imagen son los centroides de los fiduciales (X: 20 a 205, Y: 20 a 269)
            INTERNAL_W_MM = 205.0 - 20.0  # 185.0 mm
            INTERNAL_H_MM = 269.0 - 20.0  # 249.0 mm
            OFFSET_X_MM = 20.0
            OFFSET_Y_MM = 20.0
        else:
            # Los limites son el borde de la hoja tamaño Carta
            INTERNAL_W_MM = 215.9
            INTERNAL_H_MM = 279.4
            OFFSET_X_MM = 0.0
            OFFSET_Y_MM = 0.0
            
        PX_PER_MM_X = TARGET_W / INTERNAL_W_MM
        PX_PER_MM_Y = TARGET_H / INTERNAL_H_MM

        # Función para convertir mm (ReportLab) a Píxeles (OpenCV top-down en warped image)
        def to_px(x_mm, y_mm_rl):
            rel_x = x_mm - OFFSET_X_MM
            # ReportLab Y es desde abajo. CV_Y es desde arriba en el bbox interno:
            rel_y = INTERNAL_H_MM - (y_mm_rl - OFFSET_Y_MM)
            
            x_px = int(rel_x * PX_PER_MM_X)
            y_px = int(rel_y * PX_PER_MM_Y)
            
            return min(max(x_px, 0), TARGET_W - 1), min(max(y_px, 0), TARGET_H - 1)

        # Extraer regiones para ROI relativas a la escala correcta
        R_HALF_Q = int(2.5 * PX_PER_MM_X) # Radio de burbuja ~ 2.5mm
        R_HALF_RUT = int(2.2 * PX_PER_MM_X) # Radio de RUT ~ 2.2mm

        # --- 4. LECTURA DEL QR (ZONA SUPERIOR DERECHA) ---
        if not PYZBAR_AVAILABLE:
            logger.warning("QR saltado: pyzbar no disponible.")
            evaluation_id = "QR_NOT_READABLE_NO_ZBAR"
            qr_codes = []
        else:
            # Recorte regional para velocidad (esquina sup derecha)
            qr_roi = warped[0:800, 1000:TARGET_W]
            qr_codes = pyzbar.decode(qr_roi)
            # Fallback a imagen completa
            if not qr_codes: qr_codes = pyzbar.decode(warped)
        
        if PYZBAR_AVAILABLE and qr_codes:
            qr_data = qr_codes[0].data.decode("utf-8")
            try:
                evaluation_id = json.loads(qr_data).get("id", qr_data)
            except:
                evaluation_id = qr_data

        # --- 5. EXTRACCIÓN DE RESPUESTAS (45 Preguntas) ---
        q_col_x = [20, 85, 150]
        q_start_y = 170
        q_y_step = 8.5
        q_h_step = 5.5
        options = ["A", "B", "C", "D"]
        results = {}

        # --- MODO DEBUG VISUAL ---
        debug_warped = cv2.cvtColor(warped, cv2.COLOR_GRAY2BGR)
        
        for i in range(45):
            col_idx = i // 15
            row_idx = i % 15
            x_base = q_col_x[col_idx]
            y_rl = q_start_y - (row_idx * q_y_step)
            
            marked_opt = None
            max_density = 0
            
            r_half = R_HALF_Q
            
            for j, opt in enumerate(options):
                bx_mm = x_base + (j * q_h_step)
                px_x, px_y = to_px(bx_mm, y_rl)
                
                # Para evitar cortes del tensor numpy, calculamos limites seguros
                y_start = max(0, px_y - r_half)
                y_end = min(TARGET_H, px_y + r_half)
                x_start = max(0, px_x - r_half)
                x_end = min(TARGET_W, px_x + r_half)
                
                # Dibujar rectángulo ROJO para burbujas de respuesta
                cv2.rectangle(debug_warped, (x_start, y_start), (x_end, y_end), (0, 0, 255), 2)
                
                # Análisis de densidad
                roi = thresh_warped[y_start:y_end, x_start:x_end]
                if roi.size == 0: continue
                density = cv2.countNonZero(roi)
                if density > max_density:
                    max_density = density
                    marked_opt = opt
            
            roi_area = (2 * r_half) ** 2
            if max_density > (roi_area * 0.25):
                results[str(i + 1)] = marked_opt
            else:
                results[str(i + 1)] = None

        # --- RUT (9 Columnas) con DEBUG ---
        rut_x_start = 70
        rut_y_start_rl = 255
        rut_y_step = 5.5
        rut_x_step = 6
        rut_digits = []

        for col in range(9):
            x_mm = rut_x_start + (col * rut_x_step)
            if col == 8: x_mm += 4
            col_max_density = 0
            col_marked = None
            num_rows = 11 if col == 8 else 10
            
            for row in range(num_rows):
                y_mm = rut_y_start_rl - 3.5 - (row * rut_y_step)
                px_x, px_y = to_px(x_mm, y_mm)
                
                r_half = R_HALF_RUT
                
                y_start = max(0, px_y - r_half)
                y_end = min(TARGET_H, px_y + r_half)
                x_start = max(0, px_x - r_half)
                x_end = min(TARGET_W, px_x + r_half)
                
                # Dibujar rectángulo AZUL para grilla RUT
                cv2.rectangle(debug_warped, (x_start, y_start), (x_end, y_end), (255, 0, 0), 2)
                
                roi = thresh_warped[y_start:y_end, x_start:x_end]
                if roi.size == 0: continue
                density = cv2.countNonZero(roi)
                if density > col_max_density:
                    col_max_density = density
                    col_marked = str(row) if row < 10 else "K"
            
            roi_area = (2 * r_half) ** 2
            if col_max_density > (roi_area * 0.3):
                rut_digits.append(col_marked)
            else:
                rut_digits.append("?")

        # Guardar imagen de diagnóstico en la raíz del backend
        from pathlib import Path
        backend_dir = Path(__file__).resolve().parent.parent
        debug_path = backend_dir / "debug_omr_output.jpg"
        cv2.imwrite(str(debug_path), debug_warped)
        logger.info(f"Imagen de debug generada: {debug_path}")

        # Construir RUT final (formato XXXXXXXX-X)
        body = "".join(rut_digits[:8])
        dv = rut_digits[8] if len(rut_digits) > 8 else "?"
        full_rut = f"{body}-{dv}"

        return {
            "evaluation_instance_id": evaluation_id,
            "rut": full_rut,
            "answers": results,
            "status": "success",
            "debug": {
                "bytes": len(image_bytes),
                "pyzbar": PYZBAR_AVAILABLE,
                "sh_scale": sh_scale
            }
        }
