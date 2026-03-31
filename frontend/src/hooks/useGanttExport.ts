"use client";

import { StrategicGoal } from "@/types/mejora_continua";
import { saveAs } from "file-saver";

// ─── Types ────────────────────────────────────────────────────────────────────
interface ExportRow {
  objetivo: string;
  fase: string;
  lider: string;
  estado: string;
  inicio: string;
  fin: string;
  avance: number;
}

export interface ExportConfig {
  goals: StrategicGoal[];
  profiles: any[];
  filterGoal: string;
  filterLeader: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const STATUS_LABELS: Record<string, string> = {
  pending: "Pendiente",
  in_progress: "En Ejecución",
  completed: "Logrado",
};

const STATUS_COLORS: Record<string, [number, number, number]> = {
  pending: [241, 245, 249],
  in_progress: [59, 130, 246],
  completed: [16, 185, 129],
};

function buildRows(config: ExportConfig): ExportRow[] {
  const { goals, profiles, filterGoal, filterLeader } = config;
  const rows: ExportRow[] = [];

  const getProfile = (id?: string) => {
    if (!id) return "Sin asignar";
    const p = profiles.find((pr) => pr.id === id);
    return p ? p.full_name || p.email : "Sin asignar";
  };

  for (const goal of goals) {
    if (filterGoal !== "all" && goal.id !== filterGoal) continue;
    const phases = goal.implementation_phases || [];

    for (const phase of phases) {
      if (filterLeader !== "all" && phase.leader_id !== filterLeader) continue;
      // Compute average progress from indicators if available
      const indicators = (phase as any).indicators || [];
      const avgProgress = indicators.length > 0
        ? Math.round(indicators.reduce((acc: number, ind: any) => {
            const t = ind.target_value || 100;
            return acc + Math.min(100, ((ind.current_value || 0) / t) * 100);
          }, 0) / indicators.length)
        : (phase.status === 'completed' ? 100 : phase.status === 'in_progress' ? 50 : 0);

      rows.push({
        objetivo: goal.title,
        fase: phase.title,
        lider: getProfile(phase.leader_id),
        estado: STATUS_LABELS[phase.status] || phase.status,
        inicio: phase.start_date || "—",
        fin: phase.end_date || "—",
        avance: avgProgress,
      });
    }
  }

  return rows;
}

// ─── XLSX Export ─────────────────────────────────────────────────────────────
export async function exportGanttXLSX(config: ExportConfig): Promise<void> {
  const XLSX = await import("xlsx");
  const rows = buildRows(config);

  const wsData = [
    ["Objetivo Estratégico", "Fase / Acción", "Responsable", "Estado", "Inicio", "Fin", "Avance (%)"],
    ...rows.map((r) => [r.objetivo, r.fase, r.lider, r.estado, r.inicio, r.fin, r.avance]),
  ];

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // Column widths
  ws["!cols"] = [
    { wch: 45 }, { wch: 40 }, { wch: 25 }, { wch: 15 }, { wch: 14 }, { wch: 14 }, { wch: 12 },
  ];

  // Bold header row
  const headerRange = XLSX.utils.decode_range(ws["!ref"] || "A1:G1");
  for (let C = headerRange.s.c; C <= headerRange.e.c; C++) {
    const cellAddr = XLSX.utils.encode_cell({ r: 0, c: C });
    if (!ws[cellAddr]) continue;
    ws[cellAddr].s = {
      font: { bold: true, color: { rgb: "FFFFFF" } },
      fill: { fgColor: { rgb: "0F172A" } },
      alignment: { horizontal: "center" },
    };
  }

  XLSX.utils.book_append_sheet(wb, ws, "Mejorando Juntos");
  const buf = XLSX.write(wb, { type: "array", bookType: "xlsx" });
  saveAs(new Blob([buf], { type: "application/octet-stream" }), `MejorandoJuntos_${new Date().getFullYear()}.xlsx`);
}

// ─── PDF Export (jsPDF) ───────────────────────────────────────────────────────
export async function exportGanttPDF(config: ExportConfig): Promise<void> {
  const { default: jsPDF } = await import("jspdf");
  const rows = buildRows(config);

  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();   // 297
  const margin = 14;
  let y = margin;

  // ── Header ─────────────────────────────────────────────────────────────────
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pageW, 22, "F");

  // Attempt to load and embed ProfeIC logo
  try {
    const res = await fetch("/logo_profeic.png");
    if (res.ok) {
        const blob = await res.blob();
        const reader = new FileReader();
        const base64 = await new Promise<string>((resolve) => {
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(blob);
        });
        doc.addImage(base64, 'PNG', margin, 4, 14, 14);
    }
  } catch (e) {
    console.warn("No se pudo cargar el logo institucional para el PDF", e);
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  // Shift text slightly to right to accommodate logo
  doc.text("MEJORANDO JUNTOS — ROADMAP ESTRATÉGICO", margin + 18, 13);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  const date = new Date().toLocaleDateString("es-CL", { day: "2-digit", month: "long", year: "numeric" });
  doc.text(`Generado el ${date}  •  ProfeIC 360`, pageW - margin, 13, { align: "right" });

  doc.setTextColor(96, 165, 250);
  doc.setFontSize(7);
  doc.text(`${rows.length} fases activas`, margin, 20);

  y = 30;

  // ── Column headers ─────────────────────────────────────────────────────────
  const cols = [
    { label: "OBJETIVO ESTRATÉGICO", x: margin,         w: 70 },
    { label: "FASE / ACCIÓN",        x: margin + 72,    w: 60 },
    { label: "RESPONSABLE",          x: margin + 134,   w: 40 },
    { label: "ESTADO",               x: margin + 176,   w: 26 },
    { label: "INICIO",               x: margin + 204,   w: 22 },
    { label: "FIN",                  x: margin + 228,   w: 22 },
    { label: "AVANCE",               x: margin + 252,   w: 22 },
  ];

  doc.setFillColor(241, 245, 249);
  doc.rect(margin - 1, y - 4, pageW - margin * 2 + 2, 8, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(71, 85, 105);
  cols.forEach((c) => doc.text(c.label, c.x, y));
  y += 6;

  // ── Separator ──────────────────────────────────────────────────────────────
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.line(margin, y, pageW - margin, y);
  y += 4;

  // ── Rows ───────────────────────────────────────────────────────────────────
  doc.setFont("helvetica", "normal");

  rows.forEach((row, i) => {
    if (y > 185) {
      doc.addPage();
      y = margin + 10;
    }

    // Alternating row bg
    if (i % 2 === 0) {
      doc.setFillColor(248, 250, 252);
      doc.rect(margin - 1, y - 3.5, pageW - margin * 2 + 2, 7, "F");
    }

    // Status pill
    const [pr, pg, pb] = STATUS_COLORS[
      Object.keys(STATUS_LABELS).find((k) => STATUS_LABELS[k] === row.estado) || "pending"
    ];
    doc.setFillColor(pr, pg, pb);
    const pillW = 22;
    doc.roundedRect(cols[3].x - 1, y - 3, pillW, 5.5, 1.5, 1.5, "F");
    doc.setFontSize(6.5);
    doc.setTextColor(row.estado === "Pendiente" ? 71 : 255, row.estado === "Pendiente" ? 85 : 255, row.estado === "Pendiente" ? 105 : 255);
    doc.text(row.estado, cols[3].x + pillW / 2 - 1, y + 0.5, { align: "center" });

    // Progress bar
    const barX = cols[6].x;
    const barW = 18;
    const barH = 3;
    doc.setFillColor(226, 232, 240);
    doc.roundedRect(barX, y - 1.5, barW, barH, 1, 1, "F");
    if (row.avance > 0) {
      doc.setFillColor(59, 130, 246);
      doc.roundedRect(barX, y - 1.5, Math.max((row.avance / 100) * barW, 1), barH, 1, 1, "F");
    }
    doc.setFontSize(6);
    doc.setTextColor(71, 85, 105);
    doc.text(`${row.avance}%`, barX + barW + 1, y + 1);

    // Text cells
    doc.setFontSize(8);
    doc.setTextColor(30, 41, 59);
    const truncate = (s: string, max: number) => s.length > max ? s.substring(0, max - 1) + "…" : s;

    doc.text(truncate(row.objetivo, 38), cols[0].x, y);
    doc.setTextColor(71, 85, 105);
    doc.setFontSize(7.5);
    doc.text(truncate(row.fase, 33),     cols[1].x, y);
    doc.text(truncate(row.lider, 22),    cols[2].x, y);
    doc.text(row.inicio,                 cols[4].x, y);
    doc.text(row.fin,                    cols[5].x, y);

    y += 8;

    // Row separator
    doc.setDrawColor(241, 245, 249);
    doc.setLineWidth(0.2);
    doc.line(margin, y - 3, pageW - margin, y - 3);
  });

  // ── Footer ─────────────────────────────────────────────────────────────────
  const pageCount = (doc.internal as any).pages.length - 1;
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFillColor(248, 250, 252);
    doc.rect(0, doc.internal.pageSize.getHeight() - 8, pageW, 8, "F");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text("ProfeIC 360 • Mejorando Juntos", margin, doc.internal.pageSize.getHeight() - 3);
    doc.text(`Página ${i} de ${pageCount}`, pageW - margin, doc.internal.pageSize.getHeight() - 3, { align: "right" });
  }

  doc.save(`MejorandoJuntos_${new Date().getFullYear()}.pdf`);
}

// ─── Backend PDF Export (via reportlab) ──────────────────────────────────────
export async function exportGanttPDFBackend(config: ExportConfig): Promise<void> {
  const { goals, profiles, filterGoal, filterLeader } = config;
  const rows = buildRows(config);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
  const res = await fetch(`${API_URL}/api/v1/mejora-continua/exportar-gantt-pdf`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      rows,
      filter_goal_label: filterGoal === "all" ? "Todos los objetivos" : goals.find(g => g.id === filterGoal)?.title || "—",
      filter_leader_label: filterLeader === "all" ? "Todos los líderes" : (profiles.find(p => p.id === filterLeader)?.full_name || profiles.find(p => p.id === filterLeader)?.email || "—"),
    }),
  });

  if (!res.ok) throw new Error("Error generando PDF en el servidor");
  const blob = await res.blob();
  saveAs(blob, `MejorandoJuntos_Pro_${new Date().getFullYear()}.pdf`);
}
