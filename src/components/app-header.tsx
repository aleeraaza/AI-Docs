"use client";

import Link from "next/link";
import { Search } from "lucide-react";
import { AliDocsLogo } from "@/components/ali-docs-logo";
import { ProfileMenu } from "@/components/profile-menu";
import { Input } from "@/components/ui/input";

type User = {
  id: string;
  name: string;
  email: string;
};

type Props = {
  user: User;
  search?: string;
  onSearchChange?: (value: string) => void;
  showSearch?: boolean;
};

export function AppHeader({
  user,
  search = "",
  onSearchChange,
  showSearch = true,
}: Props) {
  return (
    <header className="sticky top-0 z-40 border-b border-docs-border bg-white">
      <div className="mx-auto flex h-16 max-w-[1400px] items-center gap-3 px-3 sm:gap-4 sm:px-4">
        <Link href="/dashboard" className="flex shrink-0 items-center gap-2">
          <span className="flex size-10 items-center justify-center rounded-full bg-docs-blue-soft text-docs-blue">
            <AliDocsLogo className="size-5" />
          </span>
          <span className="text-[22px] font-normal tracking-tight text-docs-title">
            Ali Docs
          </span>
        </Link>

        {showSearch ? (
          <div className="relative mx-auto hidden min-w-0 max-w-[720px] flex-1 md:block">
            <Search className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-docs-muted" />
            <Input
              value={search}
              onChange={(e) => onSearchChange?.(e.target.value)}
              placeholder="Search"
              className="h-12 rounded-3xl border-0 bg-[#f1f3f4] pr-4 pl-12 text-[16px] shadow-none focus-visible:bg-white focus-visible:ring-2 focus-visible:ring-docs-blue/30"
            />
          </div>
        ) : (
          <div className="flex-1" />
        )}

        <div className="ml-auto flex items-center">
          <ProfileMenu user={user} />
        </div>
      </div>

      {showSearch && (
        <div className="px-3 pb-3 md:hidden">
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-docs-muted" />
            <Input
              value={search}
              onChange={(e) => onSearchChange?.(e.target.value)}
              placeholder="Search"
              className="h-10 rounded-3xl border-0 bg-[#f1f3f4] pl-10 shadow-none"
            />
          </div>
        </div>
      )}
    </header>
  );
}
