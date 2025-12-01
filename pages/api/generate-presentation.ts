import type { NextApiRequest, NextApiResponse } from "next";
import PptxGenJS from "pptxgenjs";
import PDFDocument from "pdfkit";
import { Document, Packer, Paragraph, HeadingLevel } from "docx";

// Template styles for PPTX, PDF, DOCX
const TEMPLATES = {
  default: {
    bg: "#7209b7",
    titleColor: "#FFFFFF",
    textColor: "#363636",
    headingFontSize: 24,
    textFontSize: 16,
  },
  modern: {
    bg: "#f72585",
    titleColor: "#FFFFFF",
    textColor: "#22223b",
    headingFontSize: 28,
    textFontSize: 17,
  },
  minimal: {
    bg: "#FFFFFF",
    titleColor: "#222",
    textColor: "#222",
    headingFontSize: 22,
    textFontSize: 15,
  },
  bold: {
    bg: "#3a0ca3",
    titleColor: "#FFD700",
    textColor: "#fff",
    headingFontSize: 30,
    textFontSize: 18,
  },
};

function getTemplateStyle(selectedTemplate: string, brandColors: string[]) {
  const tpl = TEMPLATES[selectedTemplate as keyof typeof TEMPLATES] || TEMPLATES.default;
  // Use brand color as background if available
  const bg = brandColors && brandColors.length > 0 ? rgbToHex(brandColors[0]) : tpl.bg;
  return { ...tpl, bg };
}

// Helper to convert rgb(x, x, x) to #RRGGBB
function rgbToHex(color: string) {
  const match = color.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
  if (!match) return color;
  return (
    "#" +
    [match[1], match[2], match[3]]
      .map((x) => ("0" + parseInt(x).toString(16)).slice(-2))
      .join("")
      .toUpperCase()
  );
}

// Helper to get a brand color (fallback to default)
function getBrandColor(colors: string[], idx = 0) {
  if (colors && colors.length > 0) {
    const hex = rgbToHex(colors[idx % colors.length]);
    // Validate hex color
    return /^#[0-9A-F]{6}$/i.test(hex) ? hex : "#7209b7";
  }
  return "#7209b7";
}

// PPTX generation
async function generatePPTX(data: any) {
  const style = getTemplateStyle(data.selectedTemplate, data.brandColors);
  const pptx = new PptxGenJS();

  function addSlide(title: string, content: string) {
    const slide = pptx.addSlide();
    slide.background = { fill: style.bg };
    slide.addText(title, { x: 0.5, y: 0.5, fontSize: style.headingFontSize, bold: true, color: style.titleColor });
    slide.addText(content, { x: 0.5, y: 1.2, fontSize: style.textFontSize, color: style.textColor, w: "90%" });
  }

  addSlide(data.companyName || "Business Deck", data.aboutUs || "");
  if (data.mission) addSlide("Mission", data.mission);
  if (data.headings && data.headings.length) addSlide("Website Headings", data.headings.join("\n"));
  if (data.products && data.products.length) addSlide("Products", data.products.join("\n"));
  if (data.mainContent) addSlide("Main Website Content", data.mainContent);
  if (data.brandColors && data.brandColors.length) addSlide("Brand Colors", data.brandColors.join("\n"));
  if (data.scrapedWebsiteData?.extraPages) {
    Object.entries(data.scrapedWebsiteData.extraPages).forEach(([page, d]: any) => {
      addSlide(page, d.content || "");
    });
  }
  return await pptx.write({ outputType: "nodebuffer" });
}

// PDF generation
function generatePDF(data: any) {
  const style = getTemplateStyle(data.selectedTemplate, data.brandColors);
  const doc = new PDFDocument();
  const buffers: Buffer[] = [];
  doc.on("data", buffers.push.bind(buffers));
  doc.on("end", () => {});

  doc.rect(0, 0, doc.page.width, doc.page.height).fill(style.bg);
  doc.fillColor(style.titleColor).fontSize(style.headingFontSize).text(data.companyName || "Business Deck", { align: "center" });
  doc.moveDown().fontSize(style.textFontSize).fillColor(style.textColor).text(data.aboutUs || "", { align: "left" });
  if (data.mission) doc.addPage().fillColor(style.bg).fontSize(style.headingFontSize).text("Mission", { align: "center" }).moveDown().fontSize(style.textFontSize).fillColor(style.textColor).text(data.mission);
  if (data.headings && data.headings.length) doc.addPage().fontSize(style.headingFontSize).text("Website Headings", { align: "center" }).moveDown().fontSize(style.textFontSize).text(data.headings.join("\n"));
  if (data.products && data.products.length) doc.addPage().fontSize(style.headingFontSize).text("Products", { align: "center" }).moveDown().fontSize(style.textFontSize).text(data.products.join("\n"));
  if (data.mainContent) doc.addPage().fontSize(style.headingFontSize).text("Main Website Content", { align: "center" }).moveDown().fontSize(style.textFontSize).text(data.mainContent);
  if (data.brandColors && data.brandColors.length) doc.addPage().fontSize(style.headingFontSize).text("Brand Colors", { align: "center" }).moveDown().fontSize(style.textFontSize).text(data.brandColors.join("\n"));
  doc.end();
  return new Promise<Buffer>((resolve) => {
    doc.on("end", () => {
      resolve(Buffer.concat(buffers));
    });
  });
}

// DOCX generation
async function generateDOCX(data: any) {
  const style = getTemplateStyle(data.selectedTemplate, data.brandColors);
  const doc = new Document({
    sections: [{
      properties: {},
      children: [
        new Paragraph({
          text: data.companyName || "Business Deck",
          heading: HeadingLevel.TITLE,
          thematicBreak: true,
        }),
        new Paragraph({
          text: data.aboutUs || "",
        }),
        ...(data.mission ? [new Paragraph({ text: "Mission", heading: HeadingLevel.HEADING_1 }), new Paragraph({ text: data.mission })] : []),
        ...(data.headings && data.headings.length ? [new Paragraph({ text: "Website Headings", heading: HeadingLevel.HEADING_1 }), ...data.headings.map((h: string) => new Paragraph(h))] : []),
        ...(data.products && data.products.length ? [new Paragraph({ text: "Products", heading: HeadingLevel.HEADING_1 }), ...data.products.map((p: string) => new Paragraph(p))] : []),
        ...(data.mainContent ? [new Paragraph({ text: "Main Website Content", heading: HeadingLevel.HEADING_1 }), new Paragraph({ text: data.mainContent })] : []),
        ...(data.brandColors && data.brandColors.length ? [new Paragraph({ text: "Brand Colors", heading: HeadingLevel.HEADING_1 }), ...data.brandColors.map((c: string) => new Paragraph(c))] : []),
      ],
    }],
  });
  return await Packer.toBuffer(doc);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).end("Method not allowed");
  }

  const { exportFormat = "ppt", ...data } = req.body;

  // Defensive: check required fields for PPTX/PDF/DOCX
  if (
    exportFormat === "ppt" ||
    exportFormat === "pdf" ||
    exportFormat === "docx"
  ) {
    // Check for at least one meaningful field
    if (
      !data.companyName &&
      !data.aboutUs &&
      !data.mainContent &&
      !data.mission &&
      !(data.headings && data.headings.length) &&
      !(data.products && data.products.length)
    ) {
      return res.status(400).json({
        error: "Missing required data for presentation generation",
      });
    }
  }

  try {
    if (exportFormat === "ppt") {
      const pptxBuf = await generatePPTX(data);
      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.presentationml.presentation");
      res.setHeader("Content-Disposition", "attachment; filename=presentation.pptx");
      res.status(200).send(pptxBuf);
    } else if (exportFormat === "pdf") {
      const pdfBuf = await generatePDF(data);
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", "attachment; filename=presentation.pdf");
      res.status(200).send(pdfBuf);
    } else if (exportFormat === "docx") {
      const docxBuf = await generateDOCX(data);
      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
      res.setHeader("Content-Disposition", "attachment; filename=presentation.docx");
      res.status(200).send(docxBuf);
    } else if (exportFormat === "gdoc" || exportFormat === "gslides") {
      res.status(200).json({
        message: "Google Docs/Slides export requires Google API integration. Download DOCX/PPTX and upload to Google Docs/Slides manually.",
        downloadType: exportFormat === "gdoc" ? "docx" : "pptx",
      });
    } else {
      res.status(400).json({ error: "Invalid export format" });
    }
  } catch (err: any) {
    res.status(500).json({ error: "Failed to generate file", details: err?.message || String(err) });
  }
}
