"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { ThemeToggle } from "@/components/theme-toggle";
import { SearchBox } from "@/components/search-box";
import { MobileMenu } from "@/components/mobile-menu";
import { buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/notes", label: "Knowledge Notes" },
  { href: "/interviews", label: "Interview Prep" },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-lg supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-7xl items-center px-4 md:px-8">
        {/* Logo */}
        <Link href="/" className="mr-6 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[image:var(--brand-gradient)] text-sm text-white">
            A
          </div>
          <span className="hidden bg-[image:var(--brand-gradient)] bg-clip-text text-lg font-bold text-transparent sm:inline">
            Android Hub
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`relative text-sm transition-colors after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-0 after:rounded-full after:bg-primary after:transition-all after:duration-200 hover:text-foreground hover:after:w-full ${
                pathname === link.href
                  ? "text-foreground after:w-full"
                  : "text-muted-foreground"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex flex-1 items-center justify-end gap-2">
          {/* Search (desktop) */}
          <SearchBox className="hidden md:block" />

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* User Menu or Login */}
          {session?.user ? (
            <DropdownMenu>
              <DropdownMenuTrigger className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "rounded-full")}>
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary/10 text-xs text-primary">
                    {session.user.name?.[0] || session.user.email?.[0] || "U"}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <div className="px-2 py-1.5 text-sm font-medium">{session.user.name || session.user.email}</div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push("/profile")}>Profile</DropdownMenuItem>
                {session.user.role === "ADMIN" && (
                  <DropdownMenuItem onClick={() => router.push("/admin")}>Admin</DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut()}>Sign out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link
              href="/login"
              className={cn(buttonVariants({ size: "sm" }), "hidden md:inline-flex")}
            >
              Login
            </Link>
          )}

          {/* Mobile Menu Button */}
          <MobileMenu session={session} pathname={pathname} />
        </div>
      </div>
    </header>
  );
}
