import jsPDF from "jspdf";
import type { Estimate, BusinessConfig } from "../types";
import { formatINR } from "./calculations";
import dayjs from "dayjs";

// ============================================================
// PDF GENERATOR — Professional estimate document
// ============================================================

// ============================================================
// PDF GENERATOR — Professional estimate document
// ============================================================

const COLORS = {
  primary: [20, 43, 74] as [number, number, number],
  gold: [184, 135, 59] as [number, number, number],
  goldSoft: [214, 176, 106] as [number, number, number],
  text: [23, 32, 51] as [number, number, number],
  secondary: [100, 116, 139] as [number, number, number],
  bg: [247, 245, 240] as [number, number, number],
  border: [232, 228, 220] as [number, number, number],
  white: [255, 255, 255] as [number, number, number],
  rowAlt: [252, 251, 248] as [number, number, number],
};

function setColor(doc: jsPDF, rgb: [number, number, number], type: "fill" | "draw" | "text" = "fill") {
  if (type === "fill") doc.setFillColor(rgb[0], rgb[1], rgb[2]);
  else if (type === "draw") doc.setDrawColor(rgb[0], rgb[1], rgb[2]);
  else doc.setTextColor(rgb[0], rgb[1], rgb[2]);
}

function addWatermark(doc: jsPDF, config: BusinessConfig, logoImg: HTMLImageElement | null): void {
  if (config.watermarkVisible === false) return;
  const opacity = config.watermarkOpacity ?? 0.15;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  doc.saveGraphicsState();
  // @ts-ignore
  doc.setGState(new doc.GState({ opacity }));

  if (logoImg) {
    try {
      const imgW = 120;
      const imgH = 120;
      const x = (pageWidth - imgW) / 2;
      const y = (pageHeight - imgH) / 2 + 20;
      doc.addImage(logoImg, "PNG", x, y, imgW, imgH);
    } catch {
      addTextWatermark(doc, config.name, pageWidth, pageHeight);
    }
  } else {
    addTextWatermark(doc, config.name, pageWidth, pageHeight);
  }

  doc.restoreGraphicsState();
}

function addTextWatermark(doc: jsPDF, text: string, pageWidth: number, pageHeight: number): void {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(60);
  doc.setTextColor(150, 150, 150);
  doc.text(text, pageWidth / 2, pageHeight / 2 + 20, {
    align: "center",
    angle: 30,
  });
}

function drawWavyBorder(doc: jsPDF, yPos: number, color: [number, number, number], pageWidth: number) {
  setColor(doc, color, "draw");
  doc.setLineWidth(0.5);
  let prevX = 0;
  let prevY = yPos;
  // Draw a continuous sine wave across the page width
  for (let x = 0; x <= pageWidth; x += 0.5) {
    const y = yPos + Math.sin(x * 0.8) * 1.2;
    if (x > 0) {
      doc.line(prevX, prevY, x, y);
    }
    prevX = x;
    prevY = y;
  }
}

const loadLogoImage = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = src;
  });
};

export async function generateEstimatePDF(
  estimate: Estimate,
  config: BusinessConfig,
  returnBlob = false
): Promise<Blob | void> {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const marginL = 15;
  const marginR = 15;
  const contentWidth = pageWidth - marginL - marginR;
  
  // Initialize first page borders
  drawWavyBorder(doc, 4, COLORS.gold, pageWidth);
  drawWavyBorder(doc, pageHeight - 4, COLORS.gold, pageWidth);

  let y = 15;
  let logoImg: HTMLImageElement | null = null;

  if (config.logo) {
    try {
      logoImg = await loadLogoImage(config.logo);
    } catch (e) {
      console.warn("Failed to load logo for PDF", e);
    }
  }

  const drawHeader = () => {
    // Top Left: Logo & Brand
    let logoWidth = 0;
    if (logoImg) {
      try {
        doc.addImage(logoImg, "PNG", marginL, y, 22, 22);
        logoWidth = 26;
      } catch {}
    }

    const brandX = marginL + logoWidth;
    setColor(doc, COLORS.primary, "text");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    // Right side box starts at boxX. Left area has max width to prevent overlap.
    const maxBrandWidth = pageWidth - marginR - 65 - logoWidth - marginL - 10;
    const nameLines = doc.splitTextToSize(config.name.toUpperCase(), maxBrandWidth);
    doc.text(nameLines, brandX, y + 10);
    
    setColor(doc, COLORS.secondary, "text");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    const nameHeightOffset = (nameLines.length - 1) * 8.5;
    doc.text(config.tagline || "Electrical Materials & Services", brandX, y + 16 + nameHeightOffset, { maxWidth: maxBrandWidth });


    // Top Right: Estimate Box
    const boxW = 65;
    const boxH = 22;
    const boxX = pageWidth - marginR - boxW;
    setColor(doc, COLORS.bg, "fill");
    setColor(doc, COLORS.border, "draw");
    doc.setLineWidth(0.3);
    doc.roundedRect(boxX, y, boxW, boxH, 2, 2, "FD");

    setColor(doc, COLORS.primary, "text");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("MATERIAL ESTIMATE", boxX + boxW / 2, y + 7, { align: "center" });
    
    setColor(doc, COLORS.border, "draw");
    doc.line(boxX + 5, y + 10, boxX + boxW - 5, y + 10);

    setColor(doc, COLORS.secondary, "text");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.text("Estimate No:", boxX + 8, y + 15.5);
    doc.text("Date:", boxX + 8, y + 20);

    setColor(doc, COLORS.text, "text");
    doc.setFont("helvetica", "bold");
    doc.text(estimate.estimateNumber, boxX + 32, y + 15.5);
    doc.text(dayjs(estimate.date).format("DD MMM YYYY"), boxX + 32, y + 20);

    y += Math.max(28, 22 + nameHeightOffset);

    // Contact & Address Line
    setColor(doc, COLORS.border, "draw");
    doc.line(marginL, y, pageWidth - marginR, y);
    
    y += 5;
    setColor(doc, COLORS.secondary, "text");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    
    const contactParts = [];
    if (config.phone) contactParts.push(`Phone: ${config.phone}`);
    if (config.address) contactParts.push(`Location: ${config.address}`);
    
    if (contactParts.length > 0) {
      doc.text(contactParts.join("    |    "), marginL + 2, y);
      y += 6;
    }
    
    setColor(doc, COLORS.gold, "draw");
    doc.setLineWidth(0.5);
    doc.line(marginL, y, pageWidth - marginR, y);
    y += 8;
  };

  drawHeader();

  // ── Customer Details ──────────────────────────────────────
  let custLines = 1;
  if (estimate.customer.phone) custLines++;
  if (estimate.customer.address) custLines++;

  const custBoxH = 12 + (custLines * 6);
  setColor(doc, COLORS.bg, "fill");
  setColor(doc, COLORS.border, "draw");
  doc.setLineWidth(0.3);
  doc.rect(marginL, y, contentWidth, custBoxH, "FD");

  setColor(doc, COLORS.primary, "text");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("CUSTOMER DETAILS", marginL + 4, y + 6);

  setColor(doc, COLORS.secondary, "text");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  
  let cy = y + 14;
  const labelX = marginL + 4;
  const colonX = marginL + 30;
  const valX = marginL + 34;

  // Name
  doc.text("Customer Name", labelX, cy);
  doc.text(":", colonX, cy);
  setColor(doc, COLORS.text, "text");
  doc.setFont("helvetica", "bold");
  doc.text(estimate.customer.name, valX, cy);
  cy += 6;

  // Phone
  if (estimate.customer.phone) {
    setColor(doc, COLORS.secondary, "text");
    doc.setFont("helvetica", "normal");
    doc.text("Mobile No", labelX, cy);
    doc.text(":", colonX, cy);
    setColor(doc, COLORS.text, "text");
    doc.text(estimate.customer.phone, valX, cy);
    cy += 6;
  }

  // Address
  if (estimate.customer.address) {
    setColor(doc, COLORS.secondary, "text");
    doc.setFont("helvetica", "normal");
    doc.text("Address", labelX, cy);
    doc.text(":", colonX, cy);
    setColor(doc, COLORS.text, "text");
    doc.text(estimate.customer.address, valX, cy);
  }

  y += custBoxH + 8;

  // ── Watermark ────────────────────────────────────────────
  addWatermark(doc, config, logoImg);

  // ── Items Table ───────────────────────────────────────────
  setColor(doc, COLORS.primary, "fill");
  doc.rect(marginL, y, contentWidth, 8, "F");

  setColor(doc, COLORS.white, "text");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);

  const cols = {
    num: marginL + 4,
    desc: marginL + 16,
    qty: marginL + contentWidth - 65,
    rate: marginL + contentWidth - 40,
    amount: marginL + contentWidth - 4,
  };

  doc.text("#", cols.num, y + 5.5);
  doc.text("DESCRIPTION", cols.desc, y + 5.5);
  doc.text("QTY", cols.qty, y + 5.5, { align: "center" });
  doc.text("RATE (Rs)", cols.rate, y + 5.5, { align: "right" });
  doc.text("AMOUNT (Rs)", cols.amount, y + 5.5, { align: "right" });

  y += 8;
  const rowH = 8;

  estimate.items.forEach((item, idx) => {
    if (y + rowH > pageHeight - 50) {
      doc.addPage();
      y = 15;
      addWatermark(doc, config, logoImg);
      
      // Repeat Header
      drawWavyBorder(doc, 4, COLORS.gold, pageWidth);
      drawWavyBorder(doc, pageHeight - 4, COLORS.gold, pageWidth);

      setColor(doc, COLORS.primary, "fill");
      doc.rect(marginL, y, contentWidth, 8, "F");
      setColor(doc, COLORS.white, "text");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.text("#", cols.num, y + 5.5);
      doc.text("DESCRIPTION", cols.desc, y + 5.5);
      doc.text("QTY", cols.qty, y + 5.5, { align: "center" });
      doc.text("RATE (Rs)", cols.rate, y + 5.5, { align: "right" });
      doc.text("AMOUNT (Rs)", cols.amount, y + 5.5, { align: "right" });
      y += 8;
    }

    if (idx % 2 === 0) {
      setColor(doc, COLORS.rowAlt, "fill");
      doc.rect(marginL, y, contentWidth, rowH, "F");
    }

    setColor(doc, COLORS.secondary, "text");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.text(String(idx + 1), cols.num, y + 5.5);

    setColor(doc, COLORS.text, "text");
    doc.setFont("helvetica", "bold");
    const desc = item.variantNameSnapshot
      ? `${item.materialNameSnapshot} — ${item.variantNameSnapshot}`
      : item.materialNameSnapshot;
    
    // truncate if too long
    const maxDescLen = 50;
    const finalDesc = desc.length > maxDescLen ? desc.substring(0, maxDescLen) + "..." : desc;
    doc.text(finalDesc, cols.desc, y + 5.5);

    setColor(doc, COLORS.secondary, "text");
    doc.setFont("helvetica", "normal");
    doc.text(String(item.quantity), cols.qty, y + 5.5, { align: "center" });
    doc.text(item.rate.toLocaleString("en-IN"), cols.rate, y + 5.5, { align: "right" });

    setColor(doc, COLORS.primary, "text");
    doc.setFont("helvetica", "bold");
    doc.text(item.amount.toLocaleString("en-IN"), cols.amount, y + 5.5, { align: "right" });

    y += rowH;
  });

  // Table bottom border
  setColor(doc, COLORS.primary, "draw");
  doc.setLineWidth(0.5);
  doc.line(marginL, y, pageWidth - marginR, y);

  y += 6;

  // ── Bottom Section (Notes & Totals) ───────────────────────
  if (y + 40 > pageHeight - 30) {
    doc.addPage();
    drawWavyBorder(doc, 4, COLORS.gold, pageWidth);
    drawWavyBorder(doc, pageHeight - 4, COLORS.gold, pageWidth);
    addWatermark(doc, config, logoImg);
    y = 20;
  }

  // NOTE Box
  const noteW = 100;
  setColor(doc, COLORS.bg, "fill");
  doc.rect(marginL, y, noteW, 30, "F");
  
  setColor(doc, COLORS.primary, "text");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.text("NOTE:", marginL + 4, y + 6);
  
  setColor(doc, COLORS.secondary, "text");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text("• This is an estimated list. Prices may change as per market price.", marginL + 4, y + 11);
  doc.text("• Installation charges are not included (unless mentioned).", marginL + 4, y + 16);
  doc.text("• Availability of materials is subject to stock.", marginL + 4, y + 21);
  doc.text("• This estimate is valid for discussion/purchase purpose only.", marginL + 4, y + 26);

  // Totals Box
  const summaryW = 75;
  const summaryX = marginL + contentWidth - summaryW;
  
  setColor(doc, COLORS.bg, "fill");
  doc.rect(summaryX, y, summaryW, 30, "F");

  setColor(doc, COLORS.secondary, "text");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text("Total Items", summaryX + 4, y + 7);
  doc.text("Total Qty", summaryX + 4, y + 13);
  
  setColor(doc, COLORS.text, "text");
  doc.setFont("helvetica", "bold");
  doc.text("Subtotal", summaryX + 4, y + 21);

  // Colons
  setColor(doc, COLORS.secondary, "text");
  doc.setFont("helvetica", "normal");
  const tColX = summaryX + 25;
  doc.text(":", tColX, y + 7);
  doc.text(":", tColX, y + 13);
  doc.text(":", tColX, y + 21);

  // Values
  setColor(doc, COLORS.text, "text");
  doc.setFont("helvetica", "bold");
  doc.text(String(estimate.totalItems), summaryX + summaryW - 4, y + 7, { align: "right" });
  doc.text(String(estimate.totalQuantity), summaryX + summaryW - 4, y + 13, { align: "right" });
  doc.text(`Rs. ${estimate.grandTotal.toLocaleString("en-IN")}`, summaryX + summaryW - 4, y + 21, { align: "right" });

  y += 32;

  // GRAND TOTAL Block
  setColor(doc, COLORS.primary, "fill");
  doc.rect(summaryX, y, summaryW, 10, "F");

  setColor(doc, COLORS.white, "text");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("APPROX TOTAL", summaryX + 4, y + 6.5);
  
  doc.setFontSize(11);
  doc.text(`Rs. ${estimate.grandTotal.toLocaleString("en-IN")}`, summaryX + summaryW - 4, y + 6.8, { align: "right" });

  // ── Footer ────────────────────────────────────────────────
  const footerY = pageHeight - 15;

  setColor(doc, COLORS.gold, "draw");
  doc.setLineWidth(0.5);
  doc.line(marginL, footerY - 5, pageWidth - marginR, footerY - 5);

  const primaryFooterText = config.footerText || `Thank you for choosing ${config.name}.`;

  setColor(doc, COLORS.text, "text");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text(primaryFooterText, pageWidth / 2, footerY, { align: "center" });
  
  setColor(doc, COLORS.secondary, "text");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text("Computer-generated estimate — no physical signature required.", pageWidth / 2, footerY + 5, { align: "center" });

  // ── Output ────────────────────────────────────────────────
  if (returnBlob) {
    return doc.output("blob");
  } else {
    const fileName = `${config.name.replace(/\s+/g, "_")}_${estimate.estimateNumber}.pdf`;
    doc.save(fileName);
  }
}

// ============================================================
// WHATSAPP SHARING
// ============================================================

export async function shareOnWhatsApp(
  estimate: Estimate,
  config: BusinessConfig
): Promise<void> {
  try {
    const blob = await generateEstimatePDF(estimate, config, true) as Blob;
    const fileName = `${config.name.replace(/\s+/g, "_")}_${estimate.estimateNumber}.pdf`;
    const file = new File([blob], fileName, { type: "application/pdf" });

    // Try native Web Share API with files
    if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({
        files: [file],
        title: `Estimate ${estimate.estimateNumber} — ${config.name}`,
        text: `Please find attached the material estimate from ${config.name}.`,
      });
      return;
    }

    // Fallback: download PDF + open WhatsApp with message
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);

    // Open WhatsApp with pre-filled message
    const phone = estimate.customer.phone?.replace(/\D/g, "") || "";
    const text = encodeURIComponent(
      `Dear ${estimate.customer.name},\n\nPlease find your material estimate (${estimate.estimateNumber}) from ${config.name}.\n\nTotal Amount: ${formatINR(estimate.grandTotal)}\n\nThank you for choosing ${config.name}.`
    );
    const waUrl = phone
      ? `https://wa.me/91${phone}?text=${text}`
      : `https://wa.me/?text=${text}`;

    setTimeout(() => window.open(waUrl, "_blank"), 500);
  } catch (err) {
    // If share was cancelled, don't throw
    if (err instanceof Error && err.name === "AbortError") return;
    throw err;
  }
}
