import { NextResponse } from "next/server";
import mammoth from "mammoth";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  emptyDocumentHtml,
  markdownToHtml,
  plainTextToHtml,
} from "@/lib/documents";

const MAX_BYTES = 2 * 1024 * 1024;

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "Choose a .txt, .md, or .docx file to import." },
        { status: 400 },
      );
    }

    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { error: "File is too large. Maximum size is 2MB." },
        { status: 400 },
      );
    }

    const lowerName = file.name.toLowerCase();
    let content = emptyDocumentHtml();
    let baseTitle = file.name.replace(/\.(txt|md|markdown|docx)$/i, "").trim();

    if (lowerName.endsWith(".docx")) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const result = await mammoth.convertToHtml({ buffer });
      content = result.value?.trim() || emptyDocumentHtml();
    } else if (
      lowerName.endsWith(".md") ||
      lowerName.endsWith(".markdown")
    ) {
      content = markdownToHtml(await file.text());
    } else if (lowerName.endsWith(".txt")) {
      content = plainTextToHtml(await file.text());
    } else {
      return NextResponse.json(
        {
          error: "Unsupported file type. Supported: .txt, .md, .docx",
        },
        { status: 400 },
      );
    }

    const document = await prisma.document.create({
      data: {
        title: baseTitle || "Imported document",
        content,
        ownerId: user.id,
      },
    });

    return NextResponse.json({ document }, { status: 201 });
  } catch (error) {
    console.error("Import failed:", error);
    return NextResponse.json(
      { error: "Unable to import file." },
      { status: 500 },
    );
  }
}
