"use client";

import {
  AlignmentType,
  Document,
  HeadingLevel,
  Packer,
  Paragraph,
  TextRun,
} from "docx";
import { jsPDF } from "jspdf";
import {
  downloadBlob,
  htmlToMarkdown,
  htmlToPlainText,
  safeFilename,
} from "@/lib/export";

export type ExportFormat = "txt" | "md" | "docx" | "pdf";

function parseBlocks(html: string) {
  const container = document.createElement("div");
  container.innerHTML = html;
  const blocks: Array<{
    type: "h1" | "h2" | "h3" | "p" | "li";
    text: string;
    bold?: boolean;
    italic?: boolean;
  }> = [];

  const walk = (node: Element) => {
    const tag = node.tagName.toLowerCase();
    if (["h1", "h2", "h3", "p", "li"].includes(tag)) {
      blocks.push({
        type: tag as "h1" | "h2" | "h3" | "p" | "li",
        text: node.textContent?.trim() || "",
      });
      return;
    }
    Array.from(node.children).forEach((child) => walk(child as Element));
  };

  Array.from(container.children).forEach((child) => walk(child as Element));
  if (blocks.length === 0) {
    const text = htmlToPlainText(html);
    if (text) blocks.push({ type: "p", text });
  }
  return blocks.filter((b) => b.text.length > 0);
}

async function exportDocx(title: string, html: string) {
  const blocks = parseBlocks(html);
  const children = blocks.map((block) => {
    if (block.type === "h1") {
      return new Paragraph({
        text: block.text,
        heading: HeadingLevel.HEADING_1,
        spacing: { after: 200 },
      });
    }
    if (block.type === "h2") {
      return new Paragraph({
        text: block.text,
        heading: HeadingLevel.HEADING_2,
        spacing: { after: 160 },
      });
    }
    if (block.type === "h3") {
      return new Paragraph({
        text: block.text,
        heading: HeadingLevel.HEADING_3,
        spacing: { after: 120 },
      });
    }
    if (block.type === "li") {
      return new Paragraph({
        children: [new TextRun(block.text)],
        bullet: { level: 0 },
        spacing: { after: 80 },
      });
    }
    return new Paragraph({
      children: [new TextRun(block.text)],
      spacing: { after: 120 },
      alignment: AlignmentType.LEFT,
    });
  });

  const doc = new Document({
    sections: [
      {
        properties: {},
        children:
          children.length > 0
            ? children
            : [new Paragraph({ children: [new TextRun("")] })],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  downloadBlob(blob, safeFilename(title, "docx"));
}

async function exportPdf(title: string, html: string) {
  const pdf = new jsPDF({ unit: "pt", format: "letter" });
  const margin = 56;
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const maxWidth = pageWidth - margin * 2;
  let y = margin;

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(16);
  const titleLines = pdf.splitTextToSize(title || "Untitled document", maxWidth);
  pdf.text(titleLines, margin, y);
  y += titleLines.length * 22 + 12;

  const blocks = parseBlocks(html);
  for (const block of blocks) {
    let size = 11;
    let style: "normal" | "bold" = "normal";
    if (block.type === "h1") {
      size = 18;
      style = "bold";
    } else if (block.type === "h2") {
      size = 14;
      style = "bold";
    } else if (block.type === "h3") {
      size = 12;
      style = "bold";
    }

    pdf.setFont("helvetica", style);
    pdf.setFontSize(size);
    const prefix = block.type === "li" ? "• " : "";
    const lines = pdf.splitTextToSize(prefix + block.text, maxWidth);
    const lineHeight = size + 4;
    const needed = lines.length * lineHeight + 8;

    if (y + needed > pageHeight - margin) {
      pdf.addPage();
      y = margin;
    }

    pdf.text(lines, margin, y);
    y += needed;
  }

  pdf.save(safeFilename(title, "pdf"));
}

export async function exportDocument(
  format: ExportFormat,
  title: string,
  html: string,
) {
  if (format === "txt") {
    downloadBlob(
      new Blob([htmlToPlainText(html)], { type: "text/plain;charset=utf-8" }),
      safeFilename(title, "txt"),
    );
    return;
  }

  if (format === "md") {
    downloadBlob(
      new Blob([htmlToMarkdown(html)], { type: "text/markdown;charset=utf-8" }),
      safeFilename(title, "md"),
    );
    return;
  }

  if (format === "docx") {
    await exportDocx(title, html);
    return;
  }

  await exportPdf(title, html);
}
