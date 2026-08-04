import { redirect } from "next/navigation";
import { DashboardClient } from "@/components/dashboard-client";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export default async function DashboardPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

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
      where: { shares: { some: { userId: user.id } } },
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

  return (
    <DashboardClient
      user={user}
      owned={owned.map((doc) => ({
        id: doc.id,
        title: doc.title,
        content: doc.content,
        updatedAt: doc.updatedAt.toISOString(),
        owner: doc.owner,
        shareCount: doc._count.shares,
        access: "owner" as const,
      }))}
      shared={shared.map((doc) => ({
        id: doc.id,
        title: doc.title,
        content: doc.content,
        updatedAt: doc.updatedAt.toISOString(),
        owner: doc.owner,
        permission: doc.shares[0]?.permission ?? "edit",
        access: "shared" as const,
      }))}
    />
  );
}
