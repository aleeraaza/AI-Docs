import { redirect } from "next/navigation";
import { DocumentEditor } from "@/components/document-editor";
import { getSessionUser } from "@/lib/auth";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function DocumentPage({ params }: Props) {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  const { id } = await params;

  return <DocumentEditor documentId={id} user={user} />;
}
