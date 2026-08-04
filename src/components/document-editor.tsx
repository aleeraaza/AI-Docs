"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { Editor } from "@tiptap/react";
import {
  Check,
  Cloud,
  CloudOff,
  Download,
  Loader2,
  MoreVertical,
  Share2,
} from "lucide-react";
import { AliDocsLogo } from "@/components/ali-docs-logo";
import {
  ManageAccessDialog,
  type ShareRow,
} from "@/components/manage-access-dialog";
import { ProfileMenu } from "@/components/profile-menu";
import {
  EditorToolbar,
  RichTextEditor,
} from "@/components/rich-text-editor";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  exportDocument,
  type ExportFormat,
} from "@/lib/client-export";

type DocumentPayload = {
  id: string;
  title: string;
  content: string;
  updatedAt: string;
  owner: { id: string; name: string; email: string };
  shares?: ShareRow[];
};

type Access = {
  canRead: boolean;
  canEdit: boolean;
  isOwner: boolean;
};

type User = {
  id: string;
  name: string;
  email: string;
};

type Props = {
  documentId: string;
  user: User;
};

export function DocumentEditor({ documentId, user }: Props) {
  const router = useRouter();
  const [document, setDocument] = useState<DocumentPayload | null>(null);
  const [access, setAccess] = useState<Access | null>(null);
  const [title, setTitle] = useState("");
  const [saveState, setSaveState] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");
  const [error, setError] = useState<string | null>(null);
  const [shareOpen, setShareOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [editor, setEditor] = useState<Editor | null>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestRef = useRef({ title: "", content: "" });
  const accessRef = useRef<Access | null>(null);

  const refreshMeta = useCallback(async () => {
    const response = await fetch(`/api/documents/${documentId}`);
    const data = await response.json();
    if (!response.ok) return;
    setDocument((prev) =>
      prev
        ? {
            ...prev,
            title: data.document.title,
            updatedAt: data.document.updatedAt,
            owner: data.document.owner,
            shares: data.document.shares,
          }
        : data.document,
    );
    setAccess(data.access);
    accessRef.current = data.access;
  }, [documentId]);

  const loadDocument = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/documents/${documentId}`);
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || "Unable to load document");
        setDocument(null);
        return;
      }
      setDocument(data.document);
      setAccess(data.access);
      accessRef.current = data.access;
      setTitle(data.document.title);
      latestRef.current = {
        title: data.document.title,
        content: data.document.content,
      };
    } catch {
      setError("Network error while loading document.");
    } finally {
      setLoading(false);
    }
  }, [documentId]);

  useEffect(() => {
    loadDocument();
  }, [loadDocument]);

  const persist = useCallback(
    async (nextTitle: string, nextContent: string) => {
      if (!accessRef.current?.canEdit) return;
      setSaveState("saving");
      try {
        const response = await fetch(`/api/documents/${documentId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: nextTitle, content: nextContent }),
        });
        const data = await response.json();
        if (!response.ok) {
          setSaveState("error");
          setError(data.error || "Save failed");
          return;
        }
        setDocument((prev) =>
          prev
            ? {
                ...prev,
                title: data.document.title,
                updatedAt: data.document.updatedAt,
              }
            : prev,
        );
        setSaveState("saved");
        setError(null);
      } catch {
        setSaveState("error");
        setError("Network error while saving.");
      }
    },
    [documentId],
  );

  function scheduleSave(nextTitle: string, nextContent: string) {
    latestRef.current = { title: nextTitle, content: nextContent };
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      void persist(nextTitle, nextContent);
    }, 800);
  }

  useEffect(() => {
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, []);

  async function handleExport(format: ExportFormat) {
    setExporting(true);
    setError(null);
    try {
      await exportDocument(
        format,
        latestRef.current.title || title || "Untitled document",
        latestRef.current.content || document?.content || "",
      );
    } catch (err) {
      console.error(err);
      setError("Download failed. Please try again.");
    } finally {
      setExporting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center gap-2 bg-[#f9fbfd] text-docs-muted">
        <Loader2 className="size-4 animate-spin" />
        Opening document…
      </div>
    );
  }

  if (!document || !access) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <p className="text-docs-title">{error || "Document not found."}</p>
        <Link
          href="/dashboard"
          className="mt-4 inline-block text-sm font-medium text-docs-blue hover:underline"
        >
          Back to Ali Docs home
        </Link>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#f9fbfd]">
      <div className="sticky top-0 z-30 border-b border-docs-border bg-white shadow-[0_1px_2px_rgba(60,64,67,0.12)]">
        <div className="mx-auto flex max-w-[1400px] items-center gap-2 px-3 py-1.5 sm:gap-3 sm:px-4">
          <Link
            href="/dashboard"
            className="flex size-10 shrink-0 items-center justify-center rounded-full text-docs-blue hover:bg-[#f1f3f4]"
            title="Ali Docs home"
          >
            <AliDocsLogo className="size-6" />
          </Link>

          <div className="min-w-0 flex-1">
            <input
              value={title}
              disabled={!access.canEdit}
              onChange={(e) => {
                const next = e.target.value;
                setTitle(next);
                scheduleSave(next, latestRef.current.content);
              }}
              className="w-full max-w-xl truncate rounded px-1 py-0.5 text-[18px] text-docs-title outline-none hover:bg-[#f1f3f4] focus:bg-[#f1f3f4] disabled:opacity-70"
              placeholder="Untitled document"
            />
            <div className="mt-0.5 flex h-4 items-center gap-1.5 px-1 text-[11px] text-docs-muted">
              {saveState === "saving" && (
                <>
                  <Loader2 className="size-3 animate-spin" />
                  Saving…
                </>
              )}
              {saveState === "saved" && (
                <>
                  <Check className="size-3 text-[#188038]" />
                  Saved to Ali Docs
                </>
              )}
              {saveState === "error" && (
                <>
                  <CloudOff className="size-3 text-red-600" />
                  Save failed
                </>
              )}
              {saveState === "idle" && (
                <>
                  <Cloud className="size-3" />
                  {access.isOwner ? "Owner" : `Shared · ${document.owner.name}`}
                </>
              )}
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger
                type="button"
                disabled={exporting}
                className="inline-flex h-9 items-center gap-1.5 rounded-full bg-docs-blue-soft px-4 text-sm font-medium text-docs-blue outline-none hover:bg-[#d2e3fc] focus-visible:ring-2 focus-visible:ring-docs-blue/30 disabled:opacity-60"
              >
                {exporting ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Download className="size-4" />
                )}
                Download
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuItem onClick={() => handleExport("docx")}>
                  Microsoft Word (.docx)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport("pdf")}>
                  PDF Document (.pdf)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport("md")}>
                  Markdown (.md)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport("txt")}>
                  Plain Text (.txt)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {access.isOwner && (
              <Button
                type="button"
                size="sm"
                className="h-9 gap-1.5 rounded-full px-4"
                onClick={() => setShareOpen(true)}
              >
                <Share2 className="size-4" />
                Share
              </Button>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger className="inline-flex size-9 items-center justify-center rounded-full text-docs-muted outline-none hover:bg-[#f1f3f4]">
                <MoreVertical className="size-5" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                {access.isOwner && (
                  <DropdownMenuItem
                    className="gap-2"
                    onClick={() => setShareOpen(true)}
                  >
                    <Share2 className="size-4 text-docs-muted" />
                    Manage access
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  className="gap-2"
                  onClick={() => router.push("/dashboard")}
                >
                  Back to home
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <ProfileMenu
              user={user}
              avatarClassName="size-8"
              fallbackClassName="text-xs"
            />
          </div>
        </div>

        {access.canEdit && (
          <div className="border-t border-[#dce3ef] bg-[#edf2fa]">
            <div className="mx-auto max-w-[1400px] px-3 sm:px-4">
              <div className="mx-auto max-w-[850px]">
                {editor ? (
                  <EditorToolbar editor={editor} />
                ) : (
                  <div className="h-10" aria-hidden />
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {!access.canEdit && (
        <p className="mx-auto mt-3 w-full max-w-[1400px] px-3 text-sm sm:px-4">
          <span className="mx-auto block max-w-[850px] rounded-lg bg-[#fef7e0] px-3 py-2 text-[#5f3b00]">
            View only — ask the owner for Writer access to edit.
          </span>
        </p>
      )}

      {error && (
        <p className="mx-auto mt-3 w-full max-w-[1400px] px-3 text-sm sm:px-4">
          <span className="mx-auto block max-w-[850px] rounded-lg bg-red-50 px-3 py-2 text-red-700">
            {error}
          </span>
        </p>
      )}

      <div className="mx-auto w-full max-w-[1400px] flex-1 px-3 py-6 sm:px-4">
        <div className="mx-auto min-h-[842px] w-full max-w-[850px] bg-white px-8 py-10 shadow-[0_0_0_1px_rgba(60,64,67,0.08),0_2px_6px_rgba(60,64,67,0.12)] sm:px-14 sm:py-12">
          <RichTextEditor
            key={document.id}
            initialContent={document.content}
            editable={access.canEdit}
            onEditorReady={setEditor}
            onChange={(html) => {
              latestRef.current.content = html;
              scheduleSave(latestRef.current.title, html);
            }}
          />
        </div>
      </div>

      <ManageAccessDialog
        open={shareOpen}
        onOpenChange={setShareOpen}
        documentId={documentId}
        documentTitle={title || document.title}
        shares={document.shares ?? []}
        owner={document.owner}
        onChanged={refreshMeta}
      />
    </div>
  );
}
