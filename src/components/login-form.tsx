"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { AliDocsLogo } from "@/components/ali-docs-logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const DEMO_USERS = [
  { email: "ali@alidocs.dev", label: "Ali Raza — owns sample doc" },
  { email: "bob@alidocs.dev", label: "Bob — shared access" },
  { email: "carol@alidocs.dev", label: "Carol — clean account" },
];

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("ali@alidocs.dev");
  const [password, setPassword] = useState("password123");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || "Sign in failed");
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Network error. Is the server running?");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md rounded-2xl border border-docs-border bg-white p-8 shadow-sm">
      <div className="mb-6 flex flex-col items-center text-center">
        <span className="mb-3 flex size-12 items-center justify-center rounded-full bg-docs-blue-soft text-docs-blue">
          <AliDocsLogo className="size-6" />
        </span>
        <h1 className="text-2xl font-normal text-docs-title">Sign in</h1>
        <p className="mt-1 text-sm text-docs-muted">to continue to Ali Docs</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-10"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-10"
          />
        </div>

        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        <Button type="submit" disabled={loading} className="h-10 w-full gap-2">
          {loading && <Loader2 className="size-4 animate-spin" />}
          Next
        </Button>
      </form>

      <div className="mt-6 border-t border-docs-border pt-5">
        <p className="text-xs font-medium tracking-wide text-docs-muted uppercase">
          Demo accounts · password123
        </p>
        <div className="mt-3 flex flex-col gap-2">
          {DEMO_USERS.map((demo) => (
            <button
              key={demo.email}
              type="button"
              onClick={() => {
                setEmail(demo.email);
                setPassword("password123");
              }}
              className="rounded-lg border border-docs-border px-3 py-2 text-left text-sm transition hover:border-docs-blue hover:bg-docs-blue-soft/40"
            >
              <span className="font-medium text-docs-title">{demo.email}</span>
              <span className="mt-0.5 block text-xs text-docs-muted">
                {demo.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
