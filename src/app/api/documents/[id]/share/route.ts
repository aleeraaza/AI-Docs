import { NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getDocumentAccess } from "@/lib/documents";

const shareSchema = z.object({
  email: z.string().email(),
  permission: z.enum(["view", "edit"]).default("edit"),
});

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const access = await getDocumentAccess(id, user.id);
  if (!access?.isOwner) {
    return NextResponse.json(
      { error: "Only the owner can share this document." },
      { status: 403 },
    );
  }

  try {
    const body = await request.json();
    const parsed = shareSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Provide a valid teammate email." },
        { status: 400 },
      );
    }

    const email = parsed.data.email.toLowerCase().trim();
    const target = await prisma.user.findUnique({ where: { email } });
    if (!target) {
      return NextResponse.json(
        {
          error:
            "No user found with that email. Try ali@alidocs.dev, bob@alidocs.dev, or carol@alidocs.dev",
        },
        { status: 404 },
      );
    }

    if (target.id === user.id) {
      return NextResponse.json(
        { error: "You already own this document." },
        { status: 400 },
      );
    }

    const share = await prisma.documentShare.upsert({
      where: {
        documentId_userId: {
          documentId: id,
          userId: target.id,
        },
      },
      update: { permission: parsed.data.permission },
      create: {
        documentId: id,
        userId: target.id,
        permission: parsed.data.permission,
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });

    return NextResponse.json({ share }, { status: 201 });
  } catch (error) {
    console.error("Share failed:", error);
    return NextResponse.json(
      { error: "Unable to share document." },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const access = await getDocumentAccess(id, user.id);
  if (!access?.isOwner) {
    return NextResponse.json(
      { error: "Only the owner can manage sharing." },
      { status: 403 },
    );
  }

  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");
  if (!userId) {
    return NextResponse.json({ error: "userId is required." }, { status: 400 });
  }

  await prisma.documentShare.deleteMany({
    where: { documentId: id, userId },
  });

  return NextResponse.json({ ok: true });
}
