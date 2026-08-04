"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { initials } from "@/lib/format";
import { cn } from "@/lib/utils";

type User = {
  id: string;
  name: string;
  email: string;
};

type Props = {
  user: User;
  avatarClassName?: string;
  fallbackClassName?: string;
};

export function ProfileMenu({
  user,
  avatarClassName,
  fallbackClassName,
}: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  async function logout() {
    setOpen(false);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger
        type="button"
        className="inline-flex items-center justify-center rounded-full outline-none hover:bg-[#f1f3f4] focus-visible:ring-2 focus-visible:ring-docs-blue/40"
        aria-label="Account menu"
      >
        <Avatar className={cn("size-9", avatarClassName)}>
          <AvatarFallback
            className={cn(
              "bg-docs-blue text-sm font-medium text-white",
              fallbackClassName,
            )}
          >
            {initials(user.name)}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="z-50 w-72 rounded-xl p-0 shadow-lg">
        <DropdownMenuGroup className="px-3 py-3">
          <div className="flex items-center gap-3">
            <Avatar className="size-11 shrink-0">
              <AvatarFallback className="bg-docs-blue text-base font-medium text-white">
                {initials(user.name)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold text-docs-title">
                {user.name}
              </div>
              <div className="truncate text-xs text-docs-muted">{user.email}</div>
            </div>
          </div>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <div className="p-1.5">
          <DropdownMenuItem
            onClick={logout}
            className="cursor-pointer gap-2 rounded-lg px-3 py-2.5 text-[#d93025] focus:bg-red-50 focus:text-[#d93025]"
          >
            <LogOut className="size-4" />
            Sign out
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
