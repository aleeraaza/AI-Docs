import { NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getDocumentAccess } from "@/lib/documents";

const updateSchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  content: z.string().optional(),
});

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const access = await getDocumentAccess(id, user.id);
  if (!access || !access.canRead) {
    return NextResponse.json({ error: "Document not found." }, { status: 404 });
  }

  const document = await prisma.document.findUnique({
    where: { id },
    include: {
      owner: { select: { id: true, name: true, email: true } },
      shares: {
        include: {
          user: { select: { id: true, name: true, email: true } },
        },
      },
    },
  });

  if (!document) {
    return NextResponse.json({ error: "Document not found." }, { status: 404 });
  }

  return NextResponse.json({
    document: {
      id: document.id,
      title: document.title,
      content: document.content,
      createdAt: document.createdAt,
      updatedAt: document.updatedAt,
      owner: document.owner,
      shares: access.isOwner
        ? document.shares.map((share) => ({
            id: share.id,
            permission: share.permission,
            user: share.user,
          }))
        : undefined,
    },
    access,
  });
}

export async function PATCH(request: Request, context: RouteContext) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const access = await getDocumentAccess(id, user.id);
  if (!access || !access.canEdit) {
    return NextResponse.json({ error: "You cannot edit this document." }, { status: 403 });
  }

  try {
    const body = await request.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid update payload." }, { status: 400 });
    }

    if (parsed.data.title !== undefined && !access.isOwner) {
      // Allow rename for editors too — product-friendly for collab
    }

    const document = await prisma.document.update({
      where: { id },
      data: {
        ...(parsed.data.title !== undefined
          ? { title: parsed.data.title.trim() }
          : {}),
        ...(parsed.data.content !== undefined
          ? { content: parsed.data.content }
          : {}),
      },
    });

    return NextResponse.json({ document });
  } catch (error) {
    console.error("Update document failed:", error);
    return NextResponse.json(
      { error: "Unable to save document." },
      { status: 500 },
    );
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const access = await getDocumentAccess(id, user.id);
  if (!access?.isOwner) {
    return NextResponse.json(
      { error: "Only the owner can delete this document." },
      { status: 403 },
    );
  }

  await prisma.document.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
