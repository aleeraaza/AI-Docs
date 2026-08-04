import { NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { emptyDocumentHtml } from "@/lib/documents";

const createSchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  content: z.string().optional(),
});

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [owned, shared] = await Promise.all([
    prisma.document.findMany({
      where: { ownerId: user.id },
      orderBy: { updatedAt: "desc" },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        _count: { select: { shares: true } },
      },
    }),
    prisma.document.findMany({
      where: {
        shares: { some: { userId: user.id } },
      },
      orderBy: { updatedAt: "desc" },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        shares: {
          where: { userId: user.id },
          select: { permission: true },
        },
      },
    }),
  ]);

  return NextResponse.json({
    owned: owned.map((doc) => ({
      id: doc.id,
      title: doc.title,
      updatedAt: doc.updatedAt,
      createdAt: doc.createdAt,
      owner: doc.owner,
      shareCount: doc._count.shares,
      access: "owner" as const,
    })),
    shared: shared.map((doc) => ({
      id: doc.id,
      title: doc.title,
      updatedAt: doc.updatedAt,
      createdAt: doc.createdAt,
      owner: doc.owner,
      permission: doc.shares[0]?.permission ?? "edit",
      access: "shared" as const,
    })),
  });
}

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid document data." }, { status: 400 });
    }

    const document = await prisma.document.create({
      data: {
        title: parsed.data.title?.trim() || "Untitled document",
        content: parsed.data.content ?? emptyDocumentHtml(),
        ownerId: user.id,
      },
    });

    return NextResponse.json({ document }, { status: 201 });
  } catch (error) {
    console.error("Create document failed:", error);
    return NextResponse.json(
      { error: "Unable to create document." },
      { status: 500 },
    );
  }
}
