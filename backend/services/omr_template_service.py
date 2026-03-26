import os
import json
import qrcode
from reportlab.lib.pagesizes import LETTER
from reportlab.pdfgen import canvas
from reportlab.lib.units import mm
from reportlab.lib.colors import HexColor, black

class OMRTemplateGenerator:
    def __init__(self):
        # 1 mm = 2.83465 points
        self.width, self.height = LETTER
        self.fid_size = 10 * mm
        
        # Geometría Grilla de Respuestas (X, Y absoluto)
        self.q_col_x = [20 * mm, 85 * mm, 150 * mm]
        self.q_start_y = 170 * mm
        self.q_y_step = 8.5 * mm
        self.q_h_step = 5.5 * mm
        self.q_radius = 2.5 * mm
        
        # Geometría RUT
        self.rut_x_start = 70 * mm
        self.rut_y_start = 255 * mm
        self.rut_y_step = 5.5 * mm
        self.rut_x_step = 6 * mm
        self.rut_radius = 2.2 * mm

    def _draw_fiducials(self, c):
        """Dibuja los 4 marcadores fiduciales en coordenadas mm ABSOLUTAS."""
        c.setFillColor(black)
        fids = [
            (15, 264),  # Top-Left
            (200, 264), # Top-Right
            (15, 15),   # Bottom-Left
            (200, 15)   # Bottom-Right
        ]
        for (x_mm, y_mm) in fids:
            c.rect(x_mm * mm, y_mm * mm, self.fid_size, self.fid_size, fill=1)

    def _draw_header_branding(self, c, logo_path):
        """
        Dibuja Logo y Datos del Estudiante (X=15 a 60).
        Logo en Y=250mm. Líneas desde Y=240mm.
        """
        x = 15 * mm
        logo_y = 250 * mm
        
        # Logo Rendering
        if logo_path and os.path.exists(logo_path) and (logo_path.lower().endswith(".png") or logo_path.lower().endswith(".jpg")):
            c.drawImage(logo_path, x, logo_y, width=30*mm, height=10*mm, preserveAspectRatio=True)
        else:
            c.setFont("Helvetica-Bold", 14)
            c.setFillColor(HexColor("#333333"))
            c.drawString(x, logo_y + 2*mm, "ProfeIC")
            
        # Líneas de identificación (Y=240mm, step 7mm)
        y_lines_start = 240 * mm
        line_step = 7 * mm
        fields = ["Nombre:", "Curso:", "Fecha:"]
        
        c.setFont("Helvetica", 10)
        c.setFillColor(black)
        for i, field in enumerate(fields):
            curr_y = y_lines_start - (i * line_step)
            c.drawString(x, curr_y, field)
            c.line(x + 18*mm, curr_y - 1*mm, 65*mm, curr_y - 1*mm)

    def _draw_rut_grid(self, c):
        """Grilla RUT (X=70mm, Y=255mm). Título en Y=262mm."""
        c.setFont("Helvetica-Bold", 8)
        c.drawString(self.rut_x_start, 262 * mm, "RUT ESTUDIANTE")
        
        for col in range(9):
            x = self.rut_x_start + (col * self.rut_x_step)
            if col == 8: x += 4 * mm # Separación visual DV
            
            # Casillero manual superior
            c.setLineWidth(0.5)
            c.rect(x - 2.5*mm, self.rut_y_start + 1.5*mm, 5*mm, 5*mm, stroke=1, fill=0)
            
            # Guion antes del DV
            if col == 7:
                c.line(x + 4*mm, self.rut_y_start + 4*mm, x + 6*mm, self.rut_y_start + 4*mm)

            for row in range(11 if col == 8 else 10):
                y = self.rut_y_start - 3.5*mm - (row * self.rut_y_step)
                c.circle(x, y, self.rut_radius, stroke=1, fill=0)
                
                c.setFont("Helvetica", 6)
                label = str(row) if row < 10 else "K"
                c.drawCentredString(x, y - 1*mm, label)

    def _draw_qr(self, c, evaluation_id):
        """Código QR (25x25mm) en X=170, Y=235."""
        qr_size = 25 * mm
        x = 170 * mm
        y = 235 * mm
        
        qr_data = json.dumps({"id": str(evaluation_id)})
        qr = qrcode.QRCode(box_size=1, border=0)
        qr.add_data(qr_data)
        qr.make(fit=True)
        img = qr.make_image(fill_color="black", back_color="white")
        
        tmp_qr = f"qr_final_{evaluation_id}.png"
        img.save(tmp_qr)
        c.drawImage(tmp_qr, x, y, width=qr_size, height=qr_size)
        if os.path.exists(tmp_qr):
            os.remove(tmp_qr)

    def _draw_answer_grid(self, c, num_questions=45):
        """Grilla de 45 preguntas en 3 columnas (X=20, 85, 150)."""
        options = ["A", "B", "C", "D"]
        for i in range(num_questions):
            col_idx = i // 15
            row_idx = i % 15
            
            x_base = self.q_col_x[col_idx]
            y = self.q_start_y - (row_idx * self.q_y_step)
            
            # Número alineado a la derecha
            c.setFont("Helvetica-Bold", 10)
            c.drawRightString(x_base - 2*mm, y - 1.2*mm, f"{i+1}.")
            
            # Burbujas
            for j, opt in enumerate(options):
                bx = x_base + (j * self.q_h_step)
                c.setLineWidth(0.8)
                c.circle(bx, y, self.q_radius, stroke=1, fill=0)
                c.setFont("Helvetica", 7)
                c.drawCentredString(bx, y - 1.2*mm, opt)

    def generate_pdf(self, filename, evaluation_id, num_questions=45, logo_path=None):
        """Generado final con correcciones de layout y branding."""
        c = canvas.Canvas(filename, pagesize=LETTER)
        
        self._draw_fiducials(c)
        self._draw_header_branding(c, logo_path)
        self._draw_rut_grid(c)
        self._draw_qr(c, evaluation_id)
        self._draw_answer_grid(c, num_questions)
        
        # Pie de página
        c.setFont("Helvetica-Oblique", 8)
        c.setFillColor(HexColor("#444444"))
        c.drawCentredString(self.width/2, 12*mm, "ProfeIC: Sistema de Monitoreo - OMR v3.5 (Absolute)")
        
        c.showPage()
        c.save()
        print(f"PDF Final con Layout Corregido: {filename}")

if __name__ == '__main__':
    generator = OMRTemplateGenerator()
    generator.generate_pdf("ensayo_final_v3.pdf", "PROFEIC-SIMCE-2026", num_questions=45)
