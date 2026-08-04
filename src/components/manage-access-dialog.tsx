"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { Loader2, UserPlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

export type ShareRow = {
  id: string;
  permission: string;
  user: { id: string; name: string; email: string };
};

type DirectoryUser = {
  id: string;
  name: string;
  email: string;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  documentId: string;
  documentTitle: string;
  shares: ShareRow[];
  owner: { name: string; email: string };
  onChanged: () => void | Promise<void>;
};

export function ManageAccessDialog({
  open,
  onOpenChange,
  documentId,
  documentTitle,
  shares,
  owner,
  onChanged,
}: Props) {
  const [directory, setDirectory] = useState<DirectoryUser[]>([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [permission, setPermission] = useState<"edit" | "view">("edit");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);

  const sharedIds = useMemo(
    () => new Set(shares.map((share) => share.user.id)),
    [shares],
  );

  // People who can still be added (not already on the document)
  const availableUsers = useMemo(
    () => directory.filter((u) => !sharedIds.has(u.id)),
    [directory, sharedIds],
  );

  useEffect(() => {
    if (!open) return;

    let cancelled = false;
    setError(null);
    setSelectedUserId("");
    setPermission("edit");
    setLoadingUsers(true);

    fetch("/api/users")
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || "Could not load people");
        }
        if (!cancelled) {
          setDirectory(data.users ?? []);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Could not load people",
          );
          setDirectory([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingUsers(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open]);

  // Keep selection valid when the available list changes after a share
  useEffect(() => {
    if (
      selectedUserId &&
      !availableUsers.some((u) => u.id === selectedUserId)
    ) {
      setSelectedUserId("");
    }
  }, [availableUsers, selectedUserId]);

  async function handleShare(event: FormEvent) {
    event.preventDefault();
    setError(null);

    const selected = availableUsers.find((u) => u.id === selectedUserId);
    if (!selected) {
      setError("Choose someone from the list to share with.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/documents/${documentId}/share`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: selected.email, permission }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || "Could not share document");
        return;
      }
      setSelectedUserId("");
      await onChanged();
    } catch {
      setError("Network error while sharing.");
    } finally {
      setLoading(false);
    }
  }

  async function revoke(userId: string) {
    setError(null);
    const response = await fetch(
      `/api/documents/${documentId}/share?userId=${encodeURIComponent(userId)}`,
      { method: "DELETE" },
    );
    if (!response.ok) {
      const data = await response.json();
      setError(data.error || "Could not remove access");
      return;
    }
    await onChanged();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-0 p-0 sm:max-w-lg">
        <DialogHeader className="space-y-1 border-b border-docs-border px-6 py-5 text-left">
          <DialogTitle className="text-xl font-normal text-docs-title">
            Share “{documentTitle}”
          </DialogTitle>
          <DialogDescription className="text-docs-muted">
            Manage who can open this document. Choose Reader or Writer access.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleShare} className="space-y-3 px-6 py-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="min-w-0 flex-1 space-y-1.5">
              <Label htmlFor="share-person">Add people</Label>
              <select
                id="share-person"
                required
                value={selectedUserId}
                disabled={loadingUsers || availableUsers.length === 0}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="flex h-10 w-full rounded-lg border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <option value="">
                  {loadingUsers
                    ? "Loading people…"
                    : availableUsers.length === 0
                      ? "Everyone available already has access"
                      : "Select a person"}
                </option>
                {availableUsers.map((person) => (
                  <option key={person.id} value={person.id}>
                    {person.name} ({person.email})
                  </option>
                ))}
              </select>
            </div>
            <div className="w-full space-y-1.5 sm:w-40">
              <Label htmlFor="share-role">Role</Label>
              <select
                id="share-role"
                value={permission}
                onChange={(e) =>
                  setPermission(e.target.value as "edit" | "view")
                }
                className="flex h-10 w-full rounded-lg border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <option value="edit">Writer</option>
                <option value="view">Reader</option>
              </select>
            </div>
          </div>

          {error && (
            <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}

          <DialogFooter className="gap-2 sm:justify-end">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || loadingUsers || availableUsers.length === 0}
              className="gap-2"
            >
              {loading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <UserPlus className="size-4" />
              )}
              Share
            </Button>
          </DialogFooter>
        </form>

        <div className="border-t border-docs-border px-6 py-4">
          <p className="mb-3 text-sm font-medium text-docs-title">
            People with access
          </p>
          <ul className="space-y-1">
            <li className="flex items-center justify-between gap-3 rounded-lg px-1 py-2">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-docs-title">
                  {owner.name}
                </p>
                <p className="truncate text-xs text-docs-muted">{owner.email}</p>
              </div>
              <span className="shrink-0 text-xs font-medium text-docs-muted">
                Owner
              </span>
            </li>
            {shares.map((share) => (
              <li
                key={share.id}
                className="flex items-center justify-between gap-3 rounded-lg px-1 py-2"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-docs-title">
                    {share.user.name}
                  </p>
                  <p className="truncate text-xs text-docs-muted">
                    {share.user.email}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <span className="text-xs font-medium text-docs-muted">
                    {share.permission === "edit" ? "Writer" : "Reader"}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => revoke(share.user.id)}
                    aria-label={`Remove ${share.user.name}`}
                  >
                    <X className="size-4" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </DialogContent>
    </Dialog>
  );
}
