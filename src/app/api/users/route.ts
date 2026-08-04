import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { DEMO_USER_EMAILS } from "@/lib/demo-users";
import { prisma } from "@/lib/db";

/**
 * People you can share with: real demo accounts from the DB,
 * excluding the signed-in user (document owner when managing access).
 */
export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const users = await prisma.user.findMany({
    where: {
      id: { not: user.id },
      email: { in: [...DEMO_USER_EMAILS] },
    },
    orderBy: { name: "asc" },
    select: { id: true, name: true, email: true },
  });

  return NextResponse.json({ users });
}
