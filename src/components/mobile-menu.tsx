"use client";

import { useState } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { buttonVariants } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { SearchBox } from "@/components/search-box";
import { ThemeToggle } from "@/components/theme-toggle";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type { Session } from "next-auth";

const menuLinks = [
  { href: "/", label: "Home" },
  { href: "/notes", label: "Knowledge Notes" },
  { href: "/interviews", label: "Interview Prep" },
];

interface MobileMenuProps {
  session: Session | null;
  pathname: string;
}

export function MobileMenu({ session, pathname }: MobileMenuProps) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "md:hidden")}>
        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
        <span className="sr-only">Menu</span>
      </SheetTrigger>
      <SheetContent side="left" className="w-72">
        <div className="flex flex-col gap-6 pt-6">
          {/* Logo */}
          <Link href="/" onClick={() => setOpen(false)} className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[image:var(--brand-gradient)] text-sm text-white">A</div>
            <span className="bg-[image:var(--brand-gradient)] bg-clip-text text-lg font-bold text-transparent">Android Hub</span>
          </Link>

          {/* Search */}
          <SearchBox className="w-full" />

          <Separator />

          {/* Nav Links */}
          <nav className="flex flex-col gap-1">
            {menuLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={`rounded-md px-3 py-2 text-sm transition-colors ${
                  pathname === link.href
                    ? "bg-primary/10 font-medium text-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <Separator />

          {/* Auth */}
          {session?.user ? (
            <div className="flex flex-col gap-1">
              <div className="px-3 py-1 text-sm font-medium">{session.user.name || session.user.email}</div>
              <Link href="/profile" onClick={() => setOpen(false)} className="rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground">Profile</Link>
              {session.user.role === "ADMIN" && (
                <Link href="/admin" onClick={() => setOpen(false)} className="rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground">Console</Link>
              )}
              <button onClick={() => { signOut(); setOpen(false); }} className="rounded-md px-3 py-2 text-left text-sm text-muted-foreground hover:bg-accent hover:text-foreground">Sign out</button>
            </div>
          ) : (
            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className={cn(buttonVariants(), "w-full")}
            >
              Login
            </Link>
          )}

          <div className="flex items-center gap-2 px-3">
            <span className="text-sm text-muted-foreground">Theme</span>
            <ThemeToggle />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
