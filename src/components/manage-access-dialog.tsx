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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [permission, setPermission] = useState<"edit" | "view">("edit");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);

  const sharedIds = useMemo(
    () => new Set(shares.map((share) => share.user.id)),
    [shares],
  );

  // Other real users only — never the owner, never already-shared people
  const availableUsers = useMemo(
    () =>
      directory.filter(
        (u) =>
          u.email.toLowerCase() !== owner.email.toLowerCase() &&
          !sharedIds.has(u.id),
      ),
    [directory, owner.email, sharedIds],
  );

  const personItems = useMemo(
    () =>
      availableUsers.map((person) => ({
        value: person.id,
        label: `${person.name} (${person.email})`,
      })),
    [availableUsers],
  );

  const roleItems = useMemo(
    () => [
      { value: "edit", label: "Writer" },
      { value: "view", label: "Reader" },
    ],
    [],
  );

  useEffect(() => {
    if (!open) return;

    let cancelled = false;
    setError(null);
    setSelectedUserId(null);
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

  useEffect(() => {
    if (
      selectedUserId &&
      !availableUsers.some((u) => u.id === selectedUserId)
    ) {
      setSelectedUserId(null);
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
      setSelectedUserId(null);
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

  const personPlaceholder = loadingUsers
    ? "Loading people…"
    : availableUsers.length === 0
      ? "Everyone available already has access"
      : "Select a person";

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
              <Select
                value={selectedUserId}
                onValueChange={(value) => setSelectedUserId(value)}
                items={personItems}
                disabled={loadingUsers || availableUsers.length === 0}
              >
                <SelectTrigger
                  id="share-person"
                  className="h-10 w-full min-w-0"
                >
                  <SelectValue placeholder={personPlaceholder} />
                </SelectTrigger>
                <SelectContent alignItemWithTrigger={false} align="start">
                  {availableUsers.map((person) => (
                    <SelectItem key={person.id} value={person.id}>
                      <span className="flex min-w-0 flex-col gap-0.5 py-0.5">
                        <span className="truncate font-medium">
                          {person.name}
                        </span>
                        <span className="truncate text-xs text-muted-foreground">
                          {person.email}
                        </span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-full space-y-1.5 sm:w-40">
              <Label htmlFor="share-role">Role</Label>
              <Select
                value={permission}
                onValueChange={(value) => {
                  if (value === "edit" || value === "view") {
                    setPermission(value);
                  }
                }}
                items={roleItems}
              >
                <SelectTrigger id="share-role" className="h-10 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent alignItemWithTrigger={false}>
                  <SelectItem value="edit">Writer</SelectItem>
                  <SelectItem value="view">Reader</SelectItem>
                </SelectContent>
              </Select>
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
              disabled={
                loading ||
                loadingUsers ||
                availableUsers.length === 0 ||
                !selectedUserId
              }
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
