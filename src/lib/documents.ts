import { prisma } from "@/lib/db";

export type DocumentAccess = {
  canRead: boolean;
  canEdit: boolean;
  isOwner: boolean;
};

export async function getDocumentAccess(
  documentId: string,
  userId: string,
): Promise<DocumentAccess | null> {
  const document = await prisma.document.findUnique({
    where: { id: documentId },
    include: {
      shares: {
        where: { userId },
        take: 1,
      },
    },
  });

  if (!document) return null;

  const isOwner = document.ownerId === userId;
  const share = document.shares[0];

  if (!isOwner && !share) {
    return { canRead: false, canEdit: false, isOwner: false };
  }

  const canEdit = isOwner || share?.permission === "edit";

  return {
    canRead: true,
    canEdit,
    isOwner,
  };
}

export {
  emptyDocumentHtml,
  plainTextToHtml,
  markdownToHtml,
} from "@/lib/html-content";
