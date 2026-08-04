"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useRef, useState, useTransition } from "react";
import {
  ExternalLink,
  FileUp,
  ListFilter,
  MoreVertical,
  Pencil,
  Share2,
  Trash2,
  Type,
  Upload,
} from "lucide-react";
import { AppHeader } from "@/components/app-header";
import { DeleteDocumentDialog } from "@/components/delete-document-dialog";
import {
  ManageAccessDialog,
  type ShareRow,
} from "@/components/manage-access-dialog";
import { RenameDialog } from "@/components/rename-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatOpenedDate } from "@/lib/format";
import { DOCUMENT_TEMPLATES } from "@/lib/templates";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";

export type DocItem = {
  id: string;
  title: string;
  content?: string;
  updatedAt: string;
  owner: { id: string; name: string; email: string };
  access: "owner" | "shared";
  shareCount?: number;
  permission?: string;
  shares?: ShareRow[];
};

type User = {
  id: string;
  name: string;
  email: string;
};

type Props = {
  user: User;
  owned: DocItem[];
  shared: DocItem[];
};

type FilterMode = "anyone" | "owned" | "shared";

export function DashboardClient({ user, owned, shared }: Props) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterMode>("anyone");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [pending, startTransition] = useTransition();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [renameDoc, setRenameDoc] = useState<DocItem | null>(null);
  const [deleteDoc, setDeleteDoc] = useState<DocItem | null>(null);
  const [shareDoc, setShareDoc] = useState<DocItem | null>(null);
  const [shareRows, setShareRows] = useState<ShareRow[]>([]);

  const allDocs = useMemo(() => {
    const merged = [...owned, ...shared].sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    );
    return merged.filter((doc) => {
      if (filter === "owned" && doc.access !== "owner") return false;
      if (filter === "shared" && doc.access !== "shared") return false;
      if (!search.trim()) return true;
      return doc.title.toLowerCase().includes(search.trim().toLowerCase());
    });
  }, [owned, shared, filter, search]);

  async function createDocument(payload?: {
    title?: string;
    content?: string;
  }) {
    setBusy(true);
    setError(null);
    try {
      const response = await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload ?? { title: "Untitled document" }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || "Could not create document");
        return;
      }
      router.push(`/documents/${data.document.id}`);
    } catch {
      setError("Network error while creating document.");
    } finally {
      setBusy(false);
    }
  }

  async function onImportFile(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch("/api/documents/import", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || "Import failed");
        return;
      }
      router.push(`/documents/${data.document.id}`);
    } catch {
      setError("Network error while importing file.");
    } finally {
      setBusy(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function renameDocument(id: string, title: string) {
    const response = await fetch(`/api/documents/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "Rename failed");
    }
    startTransition(() => router.refresh());
  }

  async function deleteDocument(doc: DocItem) {
    const response = await fetch(`/api/documents/${doc.id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || "Delete failed");
    }
    startTransition(() => router.refresh());
  }

  async function openShare(doc: DocItem) {
    if (doc.access !== "owner") {
      setError("Only the owner can manage access for this document.");
      return;
    }
    setError(null);
    const response = await fetch(`/api/documents/${doc.id}`);
    const data = await response.json();
    if (!response.ok) {
      setError(data.error || "Unable to load sharing details");
      return;
    }
    setShareRows(data.document.shares ?? []);
    setShareDoc({
      ...doc,
      owner: data.document.owner,
      shares: data.document.shares ?? [],
    });
  }

  return (
    <div className="min-h-screen bg-white">
      <AppHeader user={user} search={search} onSearchChange={setSearch} />

      <section className="border-b border-docs-border bg-[#edf2fa]">
        <div className="mx-auto max-w-[1200px] px-4 py-6 sm:px-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-base font-normal text-docs-title">
              Start a new document
            </h2>
            <div className="flex items-center gap-2">
              <Button
                variant="default"
                disabled={busy}
                onClick={() => fileInputRef.current?.click()}
                className="rounded-full px-4 py-4"
              >
              
                  <Upload className="size-4" />
                
                Upload file
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt,.md,.markdown,.docx,text/plain,text/markdown,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                className="hidden"
                onChange={(e) => onImportFile(e.target.files?.[0])}
              />
            </div>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-2">
            <TemplateCard
              title="Blank document"
              onClick={() => createDocument()}
              disabled={busy}
              blank
            />
            {DOCUMENT_TEMPLATES.map((template) => (
              <TemplateCard
                key={template.id}
                title={template.name}
                accent={template.accent}
                previewHtml={template.content}
                disabled={busy}
                onClick={() =>
                  createDocument({
                    title: template.title,
                    content: template.content,
                  })
                }
              />
            ))}
          </div>
          <p className="mt-3 text-xs text-docs-muted">
            Upload supports .txt, .md, and .docx (max 2MB).
          </p>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-[1200px] px-4 py-6 sm:px-6">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-base font-normal text-docs-title">
            Recent documents
          </h2>
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-1 rounded-full border border-docs-border bg-white px-1 py-0.5">
              {(
                [
                  ["anyone", "Owned by anyone"],
                  ["owned", "Owned by me"],
                  ["shared", "Shared with me"],
                ] as const
              ).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setFilter(value)}
                  className={cn(
                    "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                    filter === value
                      ? "bg-docs-blue-soft text-docs-blue"
                      : "text-docs-muted hover:bg-[#f1f3f4]",
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
            <span className="inline-flex size-8 items-center justify-center rounded-full text-docs-muted">
              <ListFilter className="size-4" />
            </span>
          </div>
        </div>

        {error && (
          <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        )}

        {allDocs.length === 0 ? (
          <div className="rounded-xl border border-dashed border-docs-border px-6 py-16 text-center">
            <p className="text-sm text-docs-muted">
              No documents yet. Create a blank doc or pick a template above.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {allDocs.map((doc) => (
              <article
                key={doc.id}
                className={cn(
                  "group relative overflow-hidden rounded-lg border bg-white transition-shadow hover:shadow-md",
                  selectedId === doc.id
                    ? "border-docs-blue ring-1 ring-docs-blue"
                    : "border-docs-border",
                )}
                onClick={() => setSelectedId(doc.id)}
              >
                <Link
                  href={`/documents/${doc.id}`}
                  className="block h-[180px] overflow-hidden bg-[#f8f9fa] px-4 pt-4"
                >
                  <p className="line-clamp-8 whitespace-pre-wrap text-[11px] leading-4 text-[#3c4043]">
                    {doc.content?.trim() || "Empty document"}
                  </p>
                </Link>
                <div className="flex items-start gap-2 border-t border-docs-border px-3 py-2.5">
                  <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded bg-docs-blue text-[11px] font-bold text-white">
                    W
                  </span>
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/documents/${doc.id}`}
                      className="block truncate text-sm font-medium text-docs-title hover:text-docs-blue"
                    >
                      {doc.title}
                    </Link>
                    <p className="truncate text-xs text-docs-muted">
                      Opened {formatOpenedDate(doc.updatedAt)}
                      {doc.access === "shared" ? ` · ${doc.owner.name}` : ""}
                    </p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      className="inline-flex size-8 shrink-0 items-center justify-center rounded-full text-docs-muted outline-none hover:bg-[#f1f3f4]"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreVertical className="size-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-52">
                      <DropdownMenuItem
                        className="gap-2"
                        onClick={() => router.push(`/documents/${doc.id}`)}
                      >
                        <Pencil className="size-4 text-docs-muted" />
                        Open
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="gap-2"
                        onClick={() =>
                          window.open(`/documents/${doc.id}`, "_blank")
                        }
                      >
                        <ExternalLink className="size-4 text-docs-muted" />
                        Open in new tab
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="gap-2"
                        onClick={() => setRenameDoc(doc)}
                      >
                        <Type className="size-4 text-docs-muted" />
                        Rename
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="gap-2"
                        onClick={() => openShare(doc)}
                      >
                        <Share2 className="size-4 text-docs-muted" />
                        Share / Manage access
                      </DropdownMenuItem>
                      {doc.access === "owner" && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            variant="destructive"
                            className="gap-2"
                            onClick={() => setDeleteDoc(doc)}
                          >
                            <Trash2 className="size-4" />
                            Remove
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </article>
            ))}
          </div>
        )}

        {(busy || pending) && (
          <p className="mt-4 text-center text-xs text-docs-muted">Updating…</p>
        )}
        </div>
      </section>

      <RenameDialog
        open={!!renameDoc}
        onOpenChange={(open) => !open && setRenameDoc(null)}
        initialTitle={renameDoc?.title ?? ""}
        onRename={async (title) => {
          if (!renameDoc) return;
          await renameDocument(renameDoc.id, title);
        }}
      />

      <DeleteDocumentDialog
        open={!!deleteDoc}
        onOpenChange={(open) => !open && setDeleteDoc(null)}
        documentTitle={deleteDoc?.title ?? ""}
        onConfirm={async () => {
          if (!deleteDoc) return;
          await deleteDocument(deleteDoc);
        }}
      />

      {shareDoc && (
        <ManageAccessDialog
          open={!!shareDoc}
          onOpenChange={(open) => !open && setShareDoc(null)}
          documentId={shareDoc.id}
          documentTitle={shareDoc.title}
          shares={shareRows}
          owner={shareDoc.owner}
          onChanged={async () => {
            const response = await fetch(`/api/documents/${shareDoc.id}`);
            const data = await response.json();
            if (response.ok) {
              setShareRows(data.document.shares ?? []);
            }
            startTransition(() => router.refresh());
          }}
        />
      )}
    </div>
  );
}

function MulticolorPlus() {
  return (
    <svg width="56" height="56" viewBox="0 0 56 56" aria-hidden>
      <rect x="24" y="8" width="8" height="18" rx="1.5" fill="#4285F4" />
      <rect x="24" y="30" width="8" height="18" rx="1.5" fill="#34A853" />
      <rect x="8" y="24" width="18" height="8" rx="1.5" fill="#EA4335" />
      <rect x="30" y="24" width="18" height="8" rx="1.5" fill="#FBBC04" />
    </svg>
  );
}

function TemplateCard({
  title,
  onClick,
  disabled,
  blank,
  accent,
  previewHtml,
}: {
  title: string;
  onClick: () => void;
  disabled?: boolean;
  blank?: boolean;
  accent?: string;
  previewHtml?: string;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="w-[148px] shrink-0 text-left disabled:opacity-60"
    >
      <div className="flex h-[186px] items-center justify-center overflow-hidden rounded border border-docs-border bg-white shadow-sm transition hover:border-docs-blue hover:shadow-md">
        {blank ? (
          <MulticolorPlus />
        ) : (
          <div className="h-full w-full overflow-hidden p-3">
            <div
              className="mb-2 h-1 w-10 rounded"
              style={{ background: accent }}
            />
            <div
              className="doc-preview-html prose max-w-none !scale-[0.36]"
              dangerouslySetInnerHTML={{ __html: previewHtml || "" }}
            />
          </div>
        )}
      </div>
      <p className="mt-2 truncate px-0.5 text-sm text-docs-title">{title}</p>
    </button>
  );
}
