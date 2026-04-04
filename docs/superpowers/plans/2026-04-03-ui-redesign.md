# Android Knowledge Hub UI Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the entire Android Knowledge Hub website with a modern card-style UI (purple/indigo brand colors), shadcn/ui components, Light/Dark dual-mode support, and mobile-optimized experience.

**Architecture:** Replace all hand-written Tailwind components with shadcn/ui equivalents. Customize the shadcn/ui theme with indigo-violet brand colors via CSS variables. Frontend pages redesigned first, then admin pages. All API routes and backend logic remain unchanged.

**Tech Stack:** Next.js 16, React 19, Tailwind CSS v4, shadcn/ui (Radix UI), CSS transitions for animations

---

## File Structure

```
src/
  app/
    globals.css                    # Modified: shadcn/ui theme CSS variables + brand colors
    layout.tsx                     # Modified: add mobile bottom nav, update providers
    page.tsx                       # Modified: redesigned homepage
    login/page.tsx                 # Modified: redesigned login
    register/page.tsx              # Modified: redesigned register
    notes/page.tsx                 # Modified: redesigned with shadcn/ui
    interviews/page.tsx            # Modified: redesigned with shadcn/ui
    articles/[slug]/page.tsx       # Modified: redesigned 3-column layout
    categories/[slug]/page.tsx     # Modified: redesigned
    profile/page.tsx               # Modified: redesigned with tabs
    admin/
      layout.tsx                   # Modified: redesigned sidebar
      page.tsx                     # Modified: redesigned dashboard
      articles/page.tsx            # Modified: shadcn/ui Table
      articles/[id]/page.tsx       # Modified: shadcn/ui form
      categories/page.tsx          # Modified: shadcn/ui Table + Dialog
      tags/page.tsx                # Modified: shadcn/ui Table + Dialog
      users/page.tsx               # Modified: shadcn/ui Table
      comments/page.tsx            # Modified: shadcn/ui Table + AlertDialog
      import/page.tsx              # Modified: shadcn/ui form
  components/
    ui/                            # Created: shadcn/ui components (auto-generated)
    navbar.tsx                     # Modified: redesigned with glassmorphism + mobile
    mobile-nav.tsx                 # Created: mobile bottom navigation bar
    mobile-menu.tsx                # Created: mobile slide-out menu (Sheet)
    theme-toggle.tsx               # Modified: DropdownMenu with Light/Dark/System
    search-box.tsx                 # Modified: redesigned with shadcn/ui Input
    article-card.tsx               # Modified: redesigned with Card + Badge + hover effects
    article-filters.tsx            # Modified: redesigned with Select components
    pagination.tsx                 # Replaced: use shadcn/ui Pagination
    category-nav.tsx               # Modified: redesigned with brand colors
    comment-section.tsx            # Modified: redesigned with Card + Button
    favorite-button.tsx            # Modified: redesigned with animation
    progress-button.tsx            # Modified: redesigned with Button variants
    markdown-renderer.tsx          # Modified: updated prose theme
    toc.tsx                        # Modified: redesigned with brand colors
    admin/
      sidebar.tsx                  # Modified: redesigned with brand colors
      stats-card.tsx               # Modified: redesigned with Card component
      article-form.tsx             # Modified: shadcn/ui form components
      import-form.tsx              # Modified: shadcn/ui form components
      emoji-picker.tsx             # Unchanged
  lib/
    utils.ts                       # Created: cn() utility for shadcn/ui
```

---

## Phase 1: Foundation

### Task 1: Install and Configure shadcn/ui

**Files:**
- Create: `src/lib/utils.ts`
- Modify: `src/app/globals.css`
- Modify: `package.json`

- [ ] **Step 1: Install shadcn/ui CLI and initialize**

```bash
cd /Users/wanlinruo/repository/my-project/project-002
npx shadcn@latest init
```

When prompted:
- Style: **New York**
- Base color: **Neutral**
- CSS variables: **Yes**

This creates `src/lib/utils.ts` (with `cn()` helper), updates `globals.css` with CSS variables, and creates `components.json`.

- [ ] **Step 2: Customize CSS variables for brand colors**

Replace the theme CSS variables in `src/app/globals.css` with the indigo-violet brand colors. Keep the `@import "tailwindcss"` and `@plugin` lines that shadcn init added, and replace the `:root` and `.dark` blocks:

```css
@import "tailwindcss";
@plugin "@tailwindcss/typography";

@custom-variant dark (&:where(.dark, .dark *));

@layer base {
  :root {
    --background: 270 50% 99%;
    --foreground: 243 75% 15%;
    --card: 0 0% 100%;
    --card-foreground: 243 75% 15%;
    --popover: 0 0% 100%;
    --popover-foreground: 243 75% 15%;
    --primary: 239 84% 67%;
    --primary-foreground: 0 0% 100%;
    --secondary: 270 40% 96%;
    --secondary-foreground: 243 75% 15%;
    --muted: 270 30% 96%;
    --muted-foreground: 220 9% 46%;
    --accent: 270 40% 96%;
    --accent-foreground: 243 75% 15%;
    --destructive: 0 84% 60%;
    --destructive-foreground: 0 0% 100%;
    --border: 270 20% 92%;
    --input: 270 20% 92%;
    --ring: 239 84% 67%;
    --radius: 0.75rem;

    --brand-gradient: linear-gradient(135deg, #6366f1, #8b5cf6);
    --brand-text-gradient: linear-gradient(135deg, #6366f1, #8b5cf6);
  }

  .dark {
    --background: 260 60% 7%;
    --foreground: 263 70% 94%;
    --card: 258 50% 18%;
    --card-foreground: 263 70% 94%;
    --popover: 258 50% 18%;
    --popover-foreground: 263 70% 94%;
    --primary: 263 70% 75%;
    --primary-foreground: 260 60% 7%;
    --secondary: 258 40% 22%;
    --secondary-foreground: 263 70% 94%;
    --muted: 258 30% 22%;
    --muted-foreground: 258 25% 55%;
    --accent: 258 40% 22%;
    --accent-foreground: 263 70% 94%;
    --destructive: 0 84% 60%;
    --destructive-foreground: 0 0% 100%;
    --border: 258 35% 25%;
    --input: 258 35% 25%;
    --ring: 263 70% 75%;

    --brand-gradient: linear-gradient(135deg, #a78bfa, #c4b5fd);
    --brand-text-gradient: linear-gradient(135deg, #a78bfa, #c4b5fd);
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground antialiased;
  }
}
```

- [ ] **Step 3: Verify the app still runs**

```bash
docker compose -f docker-compose.dev.yml exec app npx tsc --noEmit
```

Expected: 0 errors.

Open `http://localhost:3000` — the page should render (colors will look different now, that's expected).

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: initialize shadcn/ui with indigo-violet brand theme"
```

---

### Task 2: Install Required shadcn/ui Components

**Files:**
- Create: `src/components/ui/*.tsx` (auto-generated by shadcn CLI)

- [ ] **Step 1: Install all needed components**

```bash
npx shadcn@latest add button input card badge table tabs select dropdown-menu dialog alert-dialog sheet separator skeleton avatar tooltip pagination
```

This creates individual component files in `src/components/ui/`.

- [ ] **Step 2: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: 0 errors.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: install shadcn/ui components"
```

---

## Phase 2: Shared Components

### Task 3: Redesign Navbar (Desktop)

**Files:**
- Modify: `src/components/navbar.tsx`
- Modify: `src/components/theme-toggle.tsx`
- Modify: `src/components/search-box.tsx`

- [ ] **Step 1: Rewrite theme-toggle.tsx**

Replace `src/components/theme-toggle.tsx` with a DropdownMenu supporting Light/Dark/System:

```tsx
"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ThemeToggle() {
  const { setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setMounted(true); }, []);

  if (!mounted) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9">
          <svg className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>
          <svg className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>Light</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>Dark</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>System</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

- [ ] **Step 2: Rewrite search-box.tsx**

Replace `src/components/search-box.tsx`:

```tsx
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Input } from "@/components/ui/input";

export function SearchBox({ className }: { className?: string }) {
  const [query, setQuery] = useState("");
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/notes?q=${encodeURIComponent(query.trim())}`);
    }
  }

  return (
    <form onSubmit={handleSubmit} className={className}>
      <Input
        type="text"
        placeholder="Search articles..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="h-9 w-48 text-sm"
      />
    </form>
  );
}
```

- [ ] **Step 3: Rewrite navbar.tsx**

Replace `src/components/navbar.tsx` with glassmorphism navbar:

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { ThemeToggle } from "@/components/theme-toggle";
import { SearchBox } from "@/components/search-box";
import { MobileMenu } from "@/components/mobile-menu";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const navLinks = [
  { href: "/notes", label: "Knowledge Notes" },
  { href: "/interviews", label: "Interview Prep" },
];

export function Navbar() {
  const pathname = usePathname();
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
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary/10 text-xs text-primary">
                      {session.user.nickname?.[0] || session.user.email?.[0] || "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <div className="px-2 py-1.5 text-sm font-medium">{session.user.nickname || session.user.email}</div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile">Profile</Link>
                </DropdownMenuItem>
                {session.user.role === "ADMIN" && (
                  <DropdownMenuItem asChild>
                    <Link href="/admin">Admin</Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut()}>Sign out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild size="sm" className="hidden md:inline-flex">
              <Link href="/login">Login</Link>
            </Button>
          )}

          {/* Mobile Menu Button */}
          <MobileMenu session={session} pathname={pathname} />
        </div>
      </div>
    </header>
  );
}
```

- [ ] **Step 4: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Will fail because `MobileMenu` doesn't exist yet — that's expected, we'll create it in the next task.

- [ ] **Step 5: Commit**

```bash
git add src/components/navbar.tsx src/components/theme-toggle.tsx src/components/search-box.tsx
git commit -m "feat: redesign navbar with glassmorphism and shadcn/ui"
```

---

### Task 4: Add Mobile Navigation Components

**Files:**
- Create: `src/components/mobile-menu.tsx`
- Create: `src/components/mobile-nav.tsx`
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Create mobile-menu.tsx (slide-out Sheet)**

Create `src/components/mobile-menu.tsx`:

```tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { SearchBox } from "@/components/search-box";
import { ThemeToggle } from "@/components/theme-toggle";
import { Separator } from "@/components/ui/separator";
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
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9 md:hidden">
          <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
          <span className="sr-only">Menu</span>
        </Button>
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
              <div className="px-3 py-1 text-sm font-medium">{session.user.nickname || session.user.email}</div>
              <Link href="/profile" onClick={() => setOpen(false)} className="rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground">Profile</Link>
              {session.user.role === "ADMIN" && (
                <Link href="/admin" onClick={() => setOpen(false)} className="rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground">Admin</Link>
              )}
              <button onClick={() => { signOut(); setOpen(false); }} className="rounded-md px-3 py-2 text-left text-sm text-muted-foreground hover:bg-accent hover:text-foreground">Sign out</button>
            </div>
          ) : (
            <Button asChild className="w-full">
              <Link href="/login" onClick={() => setOpen(false)}>Login</Link>
            </Button>
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
```

- [ ] **Step 2: Create mobile-nav.tsx (bottom tab bar)**

Create `src/components/mobile-nav.tsx`:

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  {
    href: "/",
    label: "Home",
    icon: (
      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
    ),
  },
  {
    href: "/notes",
    label: "Notes",
    icon: (
      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>
    ),
  },
  {
    href: "/interviews",
    label: "Interview",
    icon: (
      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg>
    ),
  },
  {
    href: "/profile",
    label: "Profile",
    icon: (
      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
    ),
  },
];

export function MobileNav() {
  const pathname = usePathname();

  // Hide on admin pages
  if (pathname.startsWith("/admin")) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur-lg pb-[env(safe-area-inset-bottom)] md:hidden">
      <div className="flex h-14 items-center justify-around">
        {tabs.map((tab) => {
          const isActive = tab.href === "/" ? pathname === "/" : pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center gap-0.5 text-xs transition-colors ${
                isActive ? "text-primary" : "text-muted-foreground"
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
```

- [ ] **Step 3: Update root layout to include MobileNav**

Modify `src/app/layout.tsx`:

```tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import { Navbar } from "@/components/navbar";
import { MobileNav } from "@/components/mobile-nav";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Android Hub - Android Knowledge Base",
  description: "Structured knowledge notes and interview prep for Android developers",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className={inter.className}>
        <SessionProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <div className="relative min-h-screen">
              <Navbar />
              <main className="pb-16 md:pb-0">{children}</main>
              <MobileNav />
            </div>
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 4: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: 0 errors.

- [ ] **Step 5: Verify in browser**

Open `http://localhost:3000`. Expected:
- Desktop: glassmorphism navbar with brand gradient logo, nav links with underline hover, theme dropdown, user menu
- Mobile (resize window < 768px): hamburger menu on top, bottom tab bar with 4 icons

- [ ] **Step 6: Commit**

```bash
git add src/components/mobile-menu.tsx src/components/mobile-nav.tsx src/app/layout.tsx
git commit -m "feat: add mobile navigation with bottom tabs and slide-out menu"
```

---

### Task 5: Redesign Shared UI Components

**Files:**
- Modify: `src/components/article-card.tsx`
- Modify: `src/components/article-filters.tsx`
- Modify: `src/components/pagination.tsx`
- Modify: `src/components/favorite-button.tsx`
- Modify: `src/components/progress-button.tsx`

- [ ] **Step 1: Rewrite article-card.tsx**

Replace `src/components/article-card.tsx`:

```tsx
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ArticleCardProps {
  article: {
    slug: string;
    title: string;
    summary?: string | null;
    type: string;
    viewCount: number;
    _count?: { favorites: number };
    category: { name: string };
    tags: { tag: { name: string; type: string } }[];
  };
}

export function ArticleCard({ article }: ArticleCardProps) {
  const difficultyTag = article.tags.find((t) => t.tag.type === "DIFFICULTY");

  return (
    <Link href={`/articles/${article.slug}`}>
      <Card className="group transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-primary/50">
        <CardContent className="flex items-start justify-between gap-4 p-4">
          <div className="min-w-0 flex-1">
            <h3 className="font-medium leading-snug group-hover:text-primary transition-colors">
              {article.title}
            </h3>
            {article.summary && (
              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                {article.summary}
              </p>
            )}
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Badge variant={article.type === "NOTE" ? "default" : "secondary"} className="text-xs">
                {article.type === "NOTE" ? "NOTE" : "INTERVIEW"}
              </Badge>
              {difficultyTag && (
                <Badge variant="outline" className="text-xs">
                  {difficultyTag.tag.name}
                </Badge>
              )}
              <span className="text-xs text-muted-foreground">{article.category.name}</span>
              <span className="text-xs text-muted-foreground">
                👁 {article.viewCount} · ⭐ {article._count?.favorites || 0}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
```

- [ ] **Step 2: Rewrite article-filters.tsx**

Replace `src/components/article-filters.tsx`:

```tsx
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FilterProps {
  categories: { id: string; name: string; slug: string; children?: { id: string; name: string; slug: string }[] }[];
  tags: { id: string; name: string; type: string }[];
}

export function ArticleFilters({ categories, tags }: FilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get("category") || "";
  const currentDifficulty = searchParams.get("difficulty") || "";
  const currentQuery = searchParams.get("q") || "";

  function updateFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "all") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete("page");
    router.push(`?${params.toString()}`);
  }

  const difficultyTags = tags.filter((t) => t.type === "DIFFICULTY");

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Search */}
      <Input
        type="text"
        placeholder="Search..."
        defaultValue={currentQuery}
        className="h-9 w-full sm:w-48"
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            updateFilter("q", (e.target as HTMLInputElement).value);
          }
        }}
      />

      {/* Category */}
      <Select value={currentCategory || "all"} onValueChange={(v) => updateFilter("category", v)}>
        <SelectTrigger className="h-9 w-full sm:w-40">
          <SelectValue placeholder="All Categories" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Categories</SelectItem>
          {categories.map((cat) => (
            <SelectItem key={cat.id} value={cat.slug}>{cat.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Difficulty */}
      <Select value={currentDifficulty || "all"} onValueChange={(v) => updateFilter("difficulty", v)}>
        <SelectTrigger className="h-9 w-full sm:w-36">
          <SelectValue placeholder="All Levels" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Levels</SelectItem>
          {difficultyTags.map((tag) => (
            <SelectItem key={tag.id} value={tag.name}>{tag.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
```

- [ ] **Step 3: Rewrite pagination.tsx**

Replace `src/components/pagination.tsx`:

```tsx
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
}

export function Pagination({ currentPage, totalPages }: PaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;

  function goToPage(page: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    router.push(`?${params.toString()}`);
  }

  return (
    <div className="flex items-center justify-center gap-2 pt-6">
      <Button
        variant="outline"
        size="sm"
        disabled={currentPage <= 1}
        onClick={() => goToPage(currentPage - 1)}
      >
        Previous
      </Button>
      <span className="px-3 text-sm text-muted-foreground">
        {currentPage} / {totalPages}
      </span>
      <Button
        variant="outline"
        size="sm"
        disabled={currentPage >= totalPages}
        onClick={() => goToPage(currentPage + 1)}
      >
        Next
      </Button>
    </div>
  );
}
```

- [ ] **Step 4: Rewrite favorite-button.tsx**

Replace `src/components/favorite-button.tsx`:

```tsx
"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";

interface FavoriteButtonProps {
  articleId: string;
  initialFavorited: boolean;
  initialCount: number;
}

export function FavoriteButton({ articleId, initialFavorited, initialCount }: FavoriteButtonProps) {
  const { data: session } = useSession();
  const [favorited, setFavorited] = useState(initialFavorited);
  const [count, setCount] = useState(initialCount);

  async function toggle() {
    if (!session) return;
    const res = await fetch("/api/favorites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ articleId }),
    });
    const data = await res.json();
    setFavorited(data.favorited);
    setCount(data.count);
  }

  return (
    <Button
      variant={favorited ? "default" : "outline"}
      size="sm"
      onClick={toggle}
      disabled={!session}
      className={`gap-1.5 transition-all ${favorited ? "active:scale-95" : ""}`}
    >
      <svg
        className={`h-4 w-4 transition-transform ${favorited ? "scale-110 fill-current" : ""}`}
        xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      >
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
      </svg>
      {count}
    </Button>
  );
}
```

- [ ] **Step 5: Rewrite progress-button.tsx**

Replace `src/components/progress-button.tsx`:

```tsx
"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";

const statusConfig = {
  UNREAD: { label: "Unread", variant: "outline" as const },
  READING: { label: "Reading", variant: "secondary" as const },
  DONE: { label: "Done", variant: "default" as const },
};

const statusCycle = ["UNREAD", "READING", "DONE"] as const;

interface ProgressButtonProps {
  articleId: string;
  initialStatus: string;
}

export function ProgressButton({ articleId, initialStatus }: ProgressButtonProps) {
  const { data: session } = useSession();
  const [status, setStatus] = useState(initialStatus || "UNREAD");

  async function cycle() {
    if (!session) return;
    const currentIndex = statusCycle.indexOf(status as typeof statusCycle[number]);
    const nextStatus = statusCycle[(currentIndex + 1) % statusCycle.length];
    await fetch("/api/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ articleId, status: nextStatus }),
    });
    setStatus(nextStatus);
  }

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.UNREAD;

  return (
    <Button
      variant={config.variant}
      size="sm"
      onClick={cycle}
      disabled={!session}
      className="gap-1.5 active:scale-95 transition-all"
    >
      {config.label}
    </Button>
  );
}
```

- [ ] **Step 6: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: 0 errors.

- [ ] **Step 7: Commit**

```bash
git add src/components/article-card.tsx src/components/article-filters.tsx src/components/pagination.tsx src/components/favorite-button.tsx src/components/progress-button.tsx
git commit -m "feat: redesign shared components with shadcn/ui Card, Badge, Select, Button"
```

---

## Phase 3: Frontend Pages

### Task 6: Redesign Homepage

**Files:**
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Rewrite page.tsx**

Replace `src/app/page.tsx`:

```tsx
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [categories, latestArticles, hotArticles, articleCount, userCount] = await Promise.all([
    prisma.category.findMany({
      where: { parentId: null },
      orderBy: { sortOrder: "asc" },
      include: { _count: { select: { articles: true } } },
    }),
    prisma.article.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        category: true,
        tags: { include: { tag: true } },
        _count: { select: { favorites: true } },
      },
    }),
    prisma.article.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { favorites: { _count: "desc" } },
      take: 5,
      include: {
        category: true,
        _count: { select: { favorites: true } },
      },
    }),
    prisma.article.count({ where: { status: "PUBLISHED" } }),
    prisma.user.count(),
  ]);

  const categoryCount = categories.length;

  return (
    <div className="mx-auto max-w-7xl px-4 md:px-8">
      {/* Hero */}
      <section className="py-12 md:py-16">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
          Android Knowledge Hub
        </h1>
        <p className="mt-2 text-muted-foreground">
          Structured notes & interview prep for Android developers
        </p>
        <form action="/notes" className="mt-6 max-w-md">
          <Input
            type="text"
            name="q"
            placeholder="Search articles..."
            className="h-11 text-base ring-offset-background focus-visible:ring-2 focus-visible:ring-primary"
          />
        </form>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-3 gap-3 pb-10 md:gap-4">
        {[
          { label: "Articles", value: articleCount },
          { label: "Categories", value: categoryCount },
          { label: "Learners", value: userCount },
        ].map((stat) => (
          <Card key={stat.label} className="transition-all duration-200 hover:-translate-y-0.5">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold bg-[image:var(--brand-gradient)] bg-clip-text text-transparent">
                {stat.value}
              </div>
              <div className="text-xs text-muted-foreground">{stat.label}</div>
            </CardContent>
          </Card>
        ))}
      </section>

      {/* Knowledge Modules */}
      <section className="pb-10">
        <h2 className="mb-4 text-xl font-semibold">Knowledge Modules</h2>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {categories.map((cat) => (
            <Link key={cat.id} href={`/categories/${cat.slug}`}>
              <Card className="group transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-md">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl">{cat.icon || "📁"}</div>
                  <div className="mt-1 text-sm font-medium group-hover:text-primary transition-colors">{cat.name}</div>
                  <div className="text-xs text-muted-foreground">{cat._count.articles} articles</div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Hot & Latest Articles */}
      <section className="grid gap-8 pb-16 md:grid-cols-2">
        {/* Hot */}
        <div>
          <h2 className="mb-4 text-xl font-semibold">🔥 Hot Articles</h2>
          <div className="space-y-2">
            {hotArticles.map((article) => (
              <Link key={article.id} href={`/articles/${article.slug}`}>
                <Card className="group transition-all duration-200 hover:border-primary/50">
                  <CardContent className="flex items-center justify-between p-3">
                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate group-hover:text-primary transition-colors">{article.title}</div>
                      <div className="text-xs text-muted-foreground">{article.category.name}</div>
                    </div>
                    <span className="ml-2 flex-shrink-0 text-xs text-muted-foreground">⭐ {article._count.favorites}</span>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Latest */}
        <div>
          <h2 className="mb-4 text-xl font-semibold">📄 Latest Articles</h2>
          <div className="space-y-2">
            {latestArticles.map((article) => {
              const difficulty = article.tags.find((t) => t.tag.type === "DIFFICULTY");
              return (
                <Link key={article.id} href={`/articles/${article.slug}`}>
                  <Card className="group transition-all duration-200 hover:border-primary/50">
                    <CardContent className="flex items-center justify-between p-3">
                      <div className="min-w-0">
                        <div className="text-sm font-medium truncate group-hover:text-primary transition-colors">{article.title}</div>
                        <div className="mt-0.5 flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">{article.category.name}</span>
                          {difficulty && <Badge variant="outline" className="text-[10px] px-1.5 py-0">{difficulty.tag.name}</Badge>}
                        </div>
                      </div>
                      <Badge variant={article.type === "NOTE" ? "default" : "secondary"} className="ml-2 flex-shrink-0 text-xs">
                        {article.type}
                      </Badge>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript and browser**

```bash
npx tsc --noEmit
```

Open `http://localhost:3000` — verify the new homepage layout with stats bar, category grid, and dual-column articles.

- [ ] **Step 3: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat: redesign homepage with stats, category grid, hot/latest articles"
```

---

### Task 7: Redesign Login & Register Pages

**Files:**
- Modify: `src/app/login/page.tsx`
- Modify: `src/app/register/page.tsx`

- [ ] **Step 1: Rewrite login/page.tsx**

Replace `src/app/login/page.tsx`:

```tsx
"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Invalid email or password");
    } else {
      router.push("/");
      router.refresh();
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-[image:var(--brand-gradient)] text-lg text-white font-bold">
            A
          </div>
          <CardTitle className="text-xl">Welcome back</CardTitle>
          <CardDescription>Sign in to your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Password</label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in..." : "Sign in"}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-primary hover:underline">
              Sign up
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
```

- [ ] **Step 2: Rewrite register/page.tsx**

Replace `src/app/register/page.tsx`:

```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, nickname }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Registration failed");
    } else {
      router.push("/login");
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-[image:var(--brand-gradient)] text-lg text-white font-bold">
            A
          </div>
          <CardTitle className="text-xl">Create an account</CardTitle>
          <CardDescription>Start your Android learning journey</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <label className="text-sm font-medium">Nickname</label>
              <Input
                type="text"
                placeholder="Your name"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Password</label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating account..." : "Sign up"}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
```

- [ ] **Step 3: Verify in browser**

Open `http://localhost:3000/login` and `http://localhost:3000/register` — verify centered card layout with brand gradient logo.

- [ ] **Step 4: Commit**

```bash
git add src/app/login/page.tsx src/app/register/page.tsx
git commit -m "feat: redesign login and register pages with shadcn/ui Card"
```

---

### Task 8: Redesign Article List Pages (Notes & Interviews)

**Files:**
- Modify: `src/app/notes/page.tsx`
- Modify: `src/app/interviews/page.tsx`

- [ ] **Step 1: Rewrite notes/page.tsx**

Replace `src/app/notes/page.tsx`:

```tsx
import { prisma } from "@/lib/prisma";
import { ArticleCard } from "@/components/article-card";
import { ArticleFilters } from "@/components/article-filters";
import { Pagination } from "@/components/pagination";

export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}

export default async function NotesPage({ searchParams }: Props) {
  const params = await searchParams;
  const page = parseInt(params.page || "1");
  const pageSize = 12;

  const where: Record<string, unknown> = { type: "NOTE", status: "PUBLISHED" };
  if (params.category) {
    const cat = await prisma.category.findUnique({ where: { slug: params.category } });
    if (cat) where.categoryId = cat.id;
  }
  if (params.difficulty) {
    where.tags = { some: { tag: { name: params.difficulty, type: "DIFFICULTY" } } };
  }
  if (params.q) {
    where.OR = [
      { title: { contains: params.q, mode: "insensitive" } },
      { content: { contains: params.q, mode: "insensitive" } },
    ];
  }

  const [articles, total, categories, tags] = await Promise.all([
    prisma.article.findMany({
      where,
      include: { category: true, tags: { include: { tag: true } }, _count: { select: { favorites: true } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.article.count({ where }),
    prisma.category.findMany({ where: { parentId: null }, orderBy: { sortOrder: "asc" }, include: { children: true } }),
    prisma.tag.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Knowledge Notes</h1>
        <p className="mt-1 text-muted-foreground">Structured Android development knowledge</p>
      </div>

      <div className="mb-6">
        <ArticleFilters categories={categories} tags={tags} />
      </div>

      <div className="space-y-3">
        {articles.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
        {articles.length === 0 && (
          <p className="py-12 text-center text-muted-foreground">No articles found</p>
        )}
      </div>

      <Pagination currentPage={page} totalPages={Math.ceil(total / pageSize)} />
    </div>
  );
}
```

- [ ] **Step 2: Rewrite interviews/page.tsx**

Replace `src/app/interviews/page.tsx` — same as notes but with `type: "INTERVIEW"`:

```tsx
import { prisma } from "@/lib/prisma";
import { ArticleCard } from "@/components/article-card";
import { ArticleFilters } from "@/components/article-filters";
import { Pagination } from "@/components/pagination";

export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}

export default async function InterviewsPage({ searchParams }: Props) {
  const params = await searchParams;
  const page = parseInt(params.page || "1");
  const pageSize = 12;

  const where: Record<string, unknown> = { type: "INTERVIEW", status: "PUBLISHED" };
  if (params.category) {
    const cat = await prisma.category.findUnique({ where: { slug: params.category } });
    if (cat) where.categoryId = cat.id;
  }
  if (params.difficulty) {
    where.tags = { some: { tag: { name: params.difficulty, type: "DIFFICULTY" } } };
  }
  if (params.q) {
    where.OR = [
      { title: { contains: params.q, mode: "insensitive" } },
      { content: { contains: params.q, mode: "insensitive" } },
    ];
  }

  const [articles, total, categories, tags] = await Promise.all([
    prisma.article.findMany({
      where,
      include: { category: true, tags: { include: { tag: true } }, _count: { select: { favorites: true } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.article.count({ where }),
    prisma.category.findMany({ where: { parentId: null }, orderBy: { sortOrder: "asc" }, include: { children: true } }),
    prisma.tag.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Interview Questions</h1>
        <p className="mt-1 text-muted-foreground">Prepare for your Android interviews</p>
      </div>

      <div className="mb-6">
        <ArticleFilters categories={categories} tags={tags} />
      </div>

      <div className="space-y-3">
        {articles.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
        {articles.length === 0 && (
          <p className="py-12 text-center text-muted-foreground">No articles found</p>
        )}
      </div>

      <Pagination currentPage={page} totalPages={Math.ceil(total / pageSize)} />
    </div>
  );
}
```

- [ ] **Step 3: Verify in browser**

Open `http://localhost:3000/notes` and `/interviews` — verify filters with Select dropdowns, article cards with hover effects, pagination.

- [ ] **Step 4: Commit**

```bash
git add src/app/notes/page.tsx src/app/interviews/page.tsx
git commit -m "feat: redesign article list pages with shadcn/ui filters and cards"
```

---

### Task 9: Redesign Article Detail Page

**Files:**
- Modify: `src/app/articles/[slug]/page.tsx`
- Modify: `src/components/category-nav.tsx`
- Modify: `src/components/toc.tsx`
- Modify: `src/components/comment-section.tsx`
- Modify: `src/components/markdown-renderer.tsx`

- [ ] **Step 1: Rewrite category-nav.tsx**

Replace `src/components/category-nav.tsx`:

```tsx
import Link from "next/link";

interface CategoryNavProps {
  articles: { slug: string; title: string }[];
  currentSlug: string;
  categoryName: string;
}

export function CategoryNav({ articles, currentSlug, categoryName }: CategoryNavProps) {
  return (
    <div>
      <h3 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
        {categoryName}
      </h3>
      <nav className="space-y-0.5">
        {articles.map((article) => (
          <Link
            key={article.slug}
            href={`/articles/${article.slug}`}
            className={`block rounded-md px-3 py-1.5 text-sm transition-colors ${
              article.slug === currentSlug
                ? "border-l-2 border-primary bg-primary/5 font-medium text-primary"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            }`}
          >
            {article.title}
          </Link>
        ))}
      </nav>
    </div>
  );
}
```

- [ ] **Step 2: Rewrite toc.tsx**

Replace `src/components/toc.tsx`:

```tsx
"use client";

import { useEffect, useState } from "react";

interface TocItem {
  id: string;
  text: string;
  level: number;
}

function extractHeadings(content: string): TocItem[] {
  const headings: TocItem[] = [];
  const regex = /^(#{2,4})\s+(.+)$/gm;
  let match;
  while ((match = regex.exec(content)) !== null) {
    const text = match[2];
    const id = text
      .toLowerCase()
      .replace(/[^a-z0-9\u4e00-\u9fff]+/g, "-")
      .replace(/^-|-$/g, "");
    headings.push({ id, text, level: match[1].length });
  }
  return headings;
}

export function Toc({ content }: { content: string }) {
  const headings = extractHeadings(content);
  const [activeId, setActiveId] = useState("");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((e) => e.isIntersecting);
        if (visible) setActiveId(visible.target.id);
      },
      { rootMargin: "-80px 0px -60% 0px" }
    );

    headings.forEach((h) => {
      const el = document.getElementById(h.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [headings]);

  if (headings.length === 0) return null;

  return (
    <div>
      <h3 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
        On this page
      </h3>
      <nav className="space-y-0.5">
        {headings.map((heading) => (
          <a
            key={heading.id}
            href={`#${heading.id}`}
            onClick={(e) => {
              e.preventDefault();
              document.getElementById(heading.id)?.scrollIntoView({ behavior: "smooth" });
            }}
            className={`block rounded-md py-1 text-sm transition-colors ${
              heading.level === 3 ? "pl-4" : heading.level === 4 ? "pl-8" : "pl-2"
            } ${
              activeId === heading.id
                ? "font-medium text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {heading.text}
          </a>
        ))}
      </nav>
    </div>
  );
}
```

- [ ] **Step 3: Rewrite comment-section.tsx**

Replace `src/components/comment-section.tsx`:

```tsx
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  user: { nickname: string };
}

export function CommentSection({ articleId }: { articleId: string }) {
  const { data: session } = useSession();
  const [comments, setComments] = useState<Comment[]>([]);
  const [text, setText] = useState("");

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => {
    void fetch(`/api/comments?articleId=${articleId}`)
      .then((r) => r.json())
      .then(setComments);
  }, [articleId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    const res = await fetch("/api/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ articleId, content: text }),
    });
    if (res.ok) {
      const comment = await res.json();
      setComments([...comments, comment]);
      setText("");
    }
  }

  return (
    <div>
      <h3 className="mb-4 text-lg font-semibold">Comments</h3>

      {comments.length > 0 ? (
        <div className="space-y-3 mb-6">
          {comments.map((c) => (
            <Card key={c.id}>
              <CardContent className="p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">{c.user.nickname}</span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(c.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{c.content}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <p className="mb-6 text-sm text-muted-foreground">No comments yet</p>
      )}

      <Separator className="my-4" />

      {session ? (
        <form onSubmit={handleSubmit} className="space-y-3">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Leave a comment or correction..."
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring min-h-[80px] resize-none"
          />
          <Button type="submit" size="sm">Post Comment</Button>
        </form>
      ) : (
        <p className="text-sm text-muted-foreground">Sign in to leave a comment</p>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Update markdown-renderer.tsx prose theme**

In `src/components/markdown-renderer.tsx`, update the wrapper div className only:

```tsx
<div className="prose prose-sm dark:prose-invert max-w-none prose-headings:scroll-mt-20 prose-headings:text-foreground prose-p:text-foreground/80 prose-a:text-primary prose-pre:bg-card prose-pre:border prose-pre:border-border prose-code:text-primary">
```

- [ ] **Step 5: Rewrite articles/[slug]/page.tsx**

Replace `src/app/articles/[slug]/page.tsx`. This is a large file — the three-column layout with mobile floating bar:

```tsx
import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { Toc } from "@/components/toc";
import { CategoryNav } from "@/components/category-nav";
import { FavoriteButton } from "@/components/favorite-button";
import { ProgressButton } from "@/components/progress-button";
import { CommentSection } from "@/components/comment-section";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function ArticleDetailPage({ params }: Props) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);

  const article = await prisma.article.update({
    where: { slug: decodedSlug },
    data: { viewCount: { increment: 1 } },
    include: {
      category: true,
      tags: { include: { tag: true } },
      _count: { select: { favorites: true } },
    },
  }).catch(() => null);

  if (!article) notFound();

  const session = await auth();

  const [categoryArticles, favorite, progress] = await Promise.all([
    prisma.article.findMany({
      where: { categoryId: article.categoryId, status: "PUBLISHED" },
      select: { slug: true, title: true },
      orderBy: { createdAt: "asc" },
    }),
    session?.user
      ? prisma.favorite.findFirst({ where: { userId: session.user.id, articleId: article.id } })
      : null,
    session?.user
      ? prisma.progress.findFirst({ where: { userId: session.user.id, articleId: article.id } })
      : null,
  ]);

  const difficultyTag = article.tags.find((t) => t.tag.type === "DIFFICULTY");

  return (
    <div className="mx-auto max-w-7xl">
      {/* Breadcrumb */}
      <div className="border-b border-border px-4 py-2 text-xs text-muted-foreground md:px-8">
        <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
        {" / "}
        <Link href={`/categories/${article.category.slug}`} className="hover:text-foreground transition-colors">
          {article.category.name}
        </Link>
        {" / "}
        <span className="text-foreground">{article.title}</span>
      </div>

      <div className="flex min-h-[calc(100vh-8rem)]">
        {/* Left: Category Nav */}
        <aside className="hidden w-56 flex-shrink-0 overflow-y-auto border-r border-border p-4 lg:block">
          <CategoryNav articles={categoryArticles} currentSlug={decodedSlug} categoryName={article.category.name} />
        </aside>

        {/* Center: Article Content */}
        <article className="min-w-0 flex-1 px-4 py-6 md:px-8">
          <h1 className="text-2xl font-bold">{article.title}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Badge variant={article.type === "NOTE" ? "default" : "secondary"}>
              {article.type}
            </Badge>
            {difficultyTag && <Badge variant="outline">{difficultyTag.tag.name}</Badge>}
            <span className="text-xs text-muted-foreground">
              👁 {article.viewCount} · ⭐ {article._count.favorites} · {new Date(article.updatedAt).toLocaleDateString()}
            </span>
          </div>

          <Separator className="my-6" />

          <MarkdownRenderer content={article.content} />

          <Separator className="my-8" />

          <CommentSection articleId={article.id} />
        </article>

        {/* Right: TOC + Actions */}
        <aside className="hidden w-48 flex-shrink-0 overflow-y-auto border-l border-border p-4 xl:block">
          <div className="sticky top-20 space-y-6">
            <div className="flex flex-col gap-2">
              <FavoriteButton articleId={article.id} initialFavorited={!!favorite} initialCount={article._count.favorites} />
              <ProgressButton articleId={article.id} initialStatus={progress?.status || "UNREAD"} />
            </div>
            <Separator />
            <Toc content={article.content} />
          </div>
        </aside>
      </div>

      {/* Mobile floating bar */}
      <div className="fixed bottom-16 left-0 right-0 z-40 border-t border-border bg-background/95 backdrop-blur-lg p-2 md:bottom-0 lg:hidden">
        <div className="flex items-center justify-center gap-3">
          <FavoriteButton articleId={article.id} initialFavorited={!!favorite} initialCount={article._count.favorites} />
          <ProgressButton articleId={article.id} initialStatus={progress?.status || "UNREAD"} />
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 6: Verify TypeScript and browser**

```bash
npx tsc --noEmit
```

Open `http://localhost:3000/articles/<any-slug>` — verify three-column layout, mobile floating bar (resize to small screen).

- [ ] **Step 7: Commit**

```bash
git add src/app/articles/\[slug\]/page.tsx src/components/category-nav.tsx src/components/toc.tsx src/components/comment-section.tsx src/components/markdown-renderer.tsx
git commit -m "feat: redesign article detail with 3-column layout and mobile floating bar"
```

---

### Task 10: Redesign Category Page & Profile Page

**Files:**
- Modify: `src/app/categories/[slug]/page.tsx`
- Modify: `src/app/profile/page.tsx`

- [ ] **Step 1: Rewrite categories/[slug]/page.tsx**

Replace `src/app/categories/[slug]/page.tsx`:

```tsx
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ArticleCard } from "@/components/article-card";
import { Pagination } from "@/components/pagination";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | undefined }>;
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const sp = await searchParams;
  const page = parseInt(sp.page || "1");
  const pageSize = 12;

  const category = await prisma.category.findUnique({
    where: { slug },
    include: { children: true },
  });

  if (!category) notFound();

  const where = { categoryId: category.id, status: "PUBLISHED" as const };

  const [articles, total] = await Promise.all([
    prisma.article.findMany({
      where,
      include: { category: true, tags: { include: { tag: true } }, _count: { select: { favorites: true } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.article.count({ where }),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{category.icon || "📁"}</span>
          <div>
            <h1 className="text-2xl font-bold">{category.name}</h1>
            {category.description && (
              <p className="mt-1 text-muted-foreground">{category.description}</p>
            )}
          </div>
        </div>
        <Badge variant="secondary" className="mt-3">{total} articles</Badge>
      </div>

      <div className="space-y-3">
        {articles.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
        {articles.length === 0 && (
          <p className="py-12 text-center text-muted-foreground">No articles in this category yet</p>
        )}
      </div>

      <Pagination currentPage={page} totalPages={Math.ceil(total / pageSize)} />
    </div>
  );
}
```

- [ ] **Step 2: Rewrite profile/page.tsx**

Replace `src/app/profile/page.tsx`:

```tsx
import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const [favorites, progress] = await Promise.all([
    prisma.favorite.findMany({
      where: { userId: session.user.id },
      include: { article: { include: { category: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.progress.findMany({
      where: { userId: session.user.id },
      include: { article: { include: { category: true } } },
    }),
  ]);

  // Group progress by category
  const categoryProgress = new Map<string, { total: number; done: number; name: string }>();
  progress.forEach((p) => {
    const catName = p.article.category.name;
    const entry = categoryProgress.get(catName) || { total: 0, done: 0, name: catName };
    entry.total++;
    if (p.status === "DONE") entry.done++;
    categoryProgress.set(catName, entry);
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 md:px-8">
      {/* User Info */}
      <div className="flex items-center gap-4 mb-8">
        <Avatar className="h-16 w-16">
          <AvatarFallback className="bg-primary/10 text-xl text-primary">
            {session.user.nickname?.[0] || session.user.email?.[0] || "U"}
          </AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-xl font-bold">{session.user.nickname || "User"}</h1>
          <p className="text-sm text-muted-foreground">{session.user.email}</p>
        </div>
      </div>

      {/* Learning Progress */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-lg">Learning Progress</CardTitle>
        </CardHeader>
        <CardContent>
          {categoryProgress.size > 0 ? (
            <div className="space-y-4">
              {Array.from(categoryProgress.values()).map((cat) => {
                const pct = cat.total > 0 ? Math.round((cat.done / cat.total) * 100) : 0;
                return (
                  <div key={cat.name}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">{cat.name}</span>
                      <span className="text-xs text-muted-foreground">{cat.done}/{cat.total} ({pct}%)</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-secondary">
                      <div
                        className="h-full rounded-full bg-[image:var(--brand-gradient)] transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No progress tracked yet. Start reading articles!</p>
          )}
        </CardContent>
      </Card>

      {/* Favorites */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Favorites ({favorites.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {favorites.length > 0 ? (
            <div className="space-y-2">
              {favorites.map((fav) => (
                <Link key={fav.id} href={`/articles/${fav.article.slug}`} className="block">
                  <div className="flex items-center justify-between rounded-md p-2 transition-colors hover:bg-accent">
                    <span className="text-sm font-medium">{fav.article.title}</span>
                    <Badge variant="outline" className="text-xs">{fav.article.category.name}</Badge>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No favorites yet. Star articles you want to revisit!</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
```

- [ ] **Step 3: Verify in browser**

Open `http://localhost:3000/categories/<slug>` and `http://localhost:3000/profile` (logged in).

- [ ] **Step 4: Commit**

```bash
git add src/app/categories/\[slug\]/page.tsx src/app/profile/page.tsx
git commit -m "feat: redesign category and profile pages with shadcn/ui"
```

---

## Phase 4: Admin Pages

### Task 11: Redesign Admin Layout & Sidebar

**Files:**
- Modify: `src/app/admin/layout.tsx`
- Modify: `src/components/admin/sidebar.tsx`

- [ ] **Step 1: Rewrite admin sidebar.tsx**

Replace `src/components/admin/sidebar.tsx`:

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const menuItems = [
  { href: "/admin", label: "Dashboard", icon: "📊" },
  { href: "/admin/articles", label: "Articles", icon: "📝" },
  { href: "/admin/categories", label: "Categories", icon: "📁" },
  { href: "/admin/tags", label: "Tags", icon: "🏷️" },
  { href: "/admin/comments", label: "Comments", icon: "💬" },
  { href: "/admin/users", label: "Users", icon: "👥" },
  { href: "/admin/import", label: "Import", icon: "📥" },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-52 flex-col border-r border-border bg-card">
      <div className="flex h-14 items-center gap-2 border-b border-border px-4">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[image:var(--brand-gradient)] text-xs text-white font-bold">
          A
        </div>
        <span className="text-sm font-semibold">Admin</span>
      </div>
      <nav className="flex-1 space-y-0.5 p-2">
        {menuItems.map((item) => {
          const isActive = item.href === "/admin"
            ? pathname === "/admin"
            : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors ${
                isActive
                  ? "bg-primary/10 font-medium text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              }`}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-border p-2">
        <Link
          href="/"
          className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          ← Back to site
        </Link>
      </div>
    </aside>
  );
}
```

- [ ] **Step 2: Rewrite admin layout.tsx**

Replace `src/app/admin/layout.tsx`:

```tsx
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AdminSidebar } from "@/components/admin/sidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") redirect("/login");

  return (
    <div className="flex h-[calc(100vh-3.5rem)]">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto p-6">{children}</main>
    </div>
  );
}
```

- [ ] **Step 3: Verify in browser**

Open `http://localhost:3000/admin` (as admin) — verify sidebar with brand colors.

- [ ] **Step 4: Commit**

```bash
git add src/app/admin/layout.tsx src/components/admin/sidebar.tsx
git commit -m "feat: redesign admin layout and sidebar with brand theme"
```

---

### Task 12: Redesign Admin Dashboard & Stats

**Files:**
- Modify: `src/app/admin/page.tsx`
- Modify: `src/components/admin/stats-card.tsx`

- [x] **Step 1: Rewrite stats-card.tsx**

Replace `src/components/admin/stats-card.tsx`:

```tsx
import { Card, CardContent } from "@/components/ui/card";

interface StatsCardProps {
  label: string;
  value: number | string;
  icon: string;
}

export function StatsCard({ label, value, icon }: StatsCardProps) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-lg">
          {icon}
        </div>
        <div>
          <div className="text-2xl font-bold">{value}</div>
          <div className="text-xs text-muted-foreground">{label}</div>
        </div>
      </CardContent>
    </Card>
  );
}
```

- [x] **Step 2: Rewrite admin/page.tsx**

Replace `src/app/admin/page.tsx`:

```tsx
import { prisma } from "@/lib/prisma";
import { StatsCard } from "@/components/admin/stats-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [noteCount, interviewCount, userCount, totalViews, totalFavorites, topArticles] =
    await Promise.all([
      prisma.article.count({ where: { type: "NOTE", status: "PUBLISHED" } }),
      prisma.article.count({ where: { type: "INTERVIEW", status: "PUBLISHED" } }),
      prisma.user.count(),
      prisma.article.aggregate({ _sum: { viewCount: true } }),
      prisma.favorite.count(),
      prisma.article.findMany({
        where: { status: "PUBLISHED" },
        orderBy: { favorites: { _count: "desc" } },
        take: 10,
        include: { _count: { select: { favorites: true } }, category: true },
      }),
    ]);

  return (
    <div>
      <h1 className="mb-6 text-xl font-bold">Dashboard</h1>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard label="Notes" value={noteCount} icon="📝" />
        <StatsCard label="Interviews" value={interviewCount} icon="❓" />
        <StatsCard label="Users" value={userCount} icon="👥" />
        <StatsCard label="Total Views" value={totalViews._sum.viewCount || 0} icon="👁" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Top Favorited Articles</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {topArticles.map((article, i) => (
              <Link key={article.id} href={`/admin/articles/${article.id}`} className="block">
                <div className="flex items-center justify-between rounded-md p-2 transition-colors hover:bg-accent">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-muted-foreground w-5">{i + 1}</span>
                    <span className="text-sm">{article.title}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">⭐ {article._count.favorites}</span>
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

- [x] **Step 3: Verify in browser**

Open `http://localhost:3000/admin` — verify stats cards and top articles.

- [x] **Step 4: Commit**

```bash
git add src/app/admin/page.tsx src/components/admin/stats-card.tsx
git commit -m "feat: redesign admin dashboard with shadcn/ui Cards"
```

---

### Task 13: Redesign Admin Article Management

**Files:**
- Modify: `src/app/admin/articles/page.tsx`
- Modify: `src/app/admin/articles/[id]/page.tsx`
- Modify: `src/components/admin/article-form.tsx`

- [x] **Step 1: Rewrite admin/articles/page.tsx**

Replace `src/app/admin/articles/page.tsx`:

```tsx
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Pagination } from "@/components/pagination";

export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}

export default async function AdminArticlesPage({ searchParams }: Props) {
  const params = await searchParams;
  const page = parseInt(params.page || "1");
  const status = params.status;
  const pageSize = 20;

  const where: Record<string, unknown> = {};
  if (status) where.status = status;

  const [articles, total] = await Promise.all([
    prisma.article.findMany({
      where,
      include: { category: true },
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.article.count({ where }),
  ]);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-bold">Articles</h1>
        <Button asChild>
          <Link href="/admin/articles/new">New Article</Link>
        </Button>
      </div>

      <div className="mb-4 flex gap-2">
        {[
          { label: "All", value: undefined },
          { label: "Draft", value: "DRAFT" },
          { label: "Published", value: "PUBLISHED" },
        ].map((filter) => (
          <Button
            key={filter.label}
            variant={status === filter.value || (!status && !filter.value) ? "default" : "outline"}
            size="sm"
            asChild
          >
            <Link href={filter.value ? `/admin/articles?status=${filter.value}` : "/admin/articles"}>
              {filter.label}
            </Link>
          </Button>
        ))}
      </div>

      <Card>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead className="border-b border-border">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Title</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden md:table-cell">Category</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden md:table-cell">Updated</th>
              </tr>
            </thead>
            <tbody>
              {articles.map((article) => (
                <tr key={article.id} className="border-b border-border last:border-0 hover:bg-accent/50 transition-colors">
                  <td className="px-4 py-3">
                    <Link href={`/admin/articles/${article.id}`} className="font-medium hover:text-primary transition-colors">
                      {article.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">{article.category.name}</td>
                  <td className="px-4 py-3">
                    <Badge variant={article.status === "PUBLISHED" ? "default" : "secondary"}>
                      {article.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">
                    {new Date(article.updatedAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Pagination currentPage={page} totalPages={Math.ceil(total / pageSize)} />
    </div>
  );
}
```

- [x] **Step 2: Rewrite admin/articles/[id]/page.tsx**

Replace `src/app/admin/articles/[id]/page.tsx`:

```tsx
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ArticleForm } from "@/components/admin/article-form";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function AdminArticleEditPage({ params }: Props) {
  const { id } = await params;

  const [categories, tags] = await Promise.all([
    prisma.category.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.tag.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (id === "new") {
    return (
      <div>
        <h1 className="mb-6 text-xl font-bold">New Article</h1>
        <ArticleForm categories={categories} tags={tags} />
      </div>
    );
  }

  const article = await prisma.article.findUnique({
    where: { id },
    include: { tags: { include: { tag: true } } },
  });

  if (!article) notFound();

  return (
    <div>
      <h1 className="mb-6 text-xl font-bold">Edit Article</h1>
      <ArticleForm article={article} categories={categories} tags={tags} />
    </div>
  );
}
```

- [x] **Step 3: Rewrite admin article-form.tsx**

Replace `src/components/admin/article-form.tsx`:

```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface ArticleFormProps {
  article?: {
    id: string;
    title: string;
    content: string;
    summary: string | null;
    type: string;
    status: string;
    categoryId: string;
    tags: { tag: { id: string } }[];
  };
  categories: { id: string; name: string }[];
  tags: { id: string; name: string; type: string }[];
}

export function ArticleForm({ article, categories, tags }: ArticleFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState(article?.title || "");
  const [content, setContent] = useState(article?.content || "");
  const [summary, setSummary] = useState(article?.summary || "");
  const [type, setType] = useState(article?.type || "NOTE");
  const [status, setStatus] = useState(article?.status || "DRAFT");
  const [categoryId, setCategoryId] = useState(article?.categoryId || "");
  const [tagIds, setTagIds] = useState<string[]>(article?.tags.map((t) => t.tag.id) || []);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const body = { title, content, summary, type, status, categoryId, tagIds };
    const url = article ? `/api/articles/${article.id}` : "/api/articles";
    const method = article ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    setSaving(false);

    if (res.ok) {
      router.push("/admin/articles");
      router.refresh();
    }
  }

  async function handleDelete() {
    await fetch(`/api/articles/${article!.id}`, { method: "DELETE" });
    router.push("/admin/articles");
    router.refresh();
  }

  function toggleTag(tagId: string) {
    setTagIds((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Title</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Summary</label>
            <Input value={summary} onChange={(e) => setSummary(e.target.value)} />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Type</label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="NOTE">Note</SelectItem>
                  <SelectItem value="INTERVIEW">Interview</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="DRAFT">Draft</SelectItem>
                  <SelectItem value="PUBLISHED">Published</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Tags</label>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Button
                  key={tag.id}
                  type="button"
                  variant={tagIds.includes(tag.id) ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleTag(tag.id)}
                >
                  {tag.name}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Content (Markdown)</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={20}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring font-mono resize-y"
            />
          </div>

          <div className="flex items-center gap-3">
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : article ? "Update" : "Create"}
            </Button>
            {article && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button type="button" variant="destructive">Delete</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete article?</AlertDialogTitle>
                    <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
```

- [x] **Step 4: Verify in browser**

Open `http://localhost:3000/admin/articles` — verify table layout, status filters, and article edit form with shadcn/ui.

- [x] **Step 5: Commit**

```bash
git add src/app/admin/articles/ src/components/admin/article-form.tsx
git commit -m "feat: redesign admin article management with shadcn/ui Table and form"
```

---

### Task 14: Redesign Admin Category, Tag, User, Comment Pages

**Files:**
- Modify: `src/app/admin/categories/page.tsx`
- Modify: `src/app/admin/tags/page.tsx`
- Modify: `src/app/admin/users/page.tsx`
- Modify: `src/app/admin/comments/page.tsx`

- [ ] **Step 1: Rewrite admin/categories/page.tsx**

Replace `src/app/admin/categories/page.tsx`:

```tsx
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EmojiPicker } from "@/components/admin/emoji-picker";
import { Category } from "@/generated/prisma/client";

type CategoryWithChildren = Category & { children: Category[] };

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<CategoryWithChildren[]>([]);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [icon, setIcon] = useState("");
  const [parentId, setParentId] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  async function loadCategories() {
    const res = await fetch("/api/categories");
    setCategories(await res.json());
  }

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { void loadCategories(); }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const body = { name, slug, icon, parentId: parentId || null, ...(editingId ? { id: editingId } : {}) };
    await fetch("/api/categories", {
      method: editingId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setName(""); setSlug(""); setIcon(""); setParentId(""); setEditingId(null);
    setDialogOpen(false);
    loadCategories();
  }

  function startEdit(cat: Category) {
    setName(cat.name); setSlug(cat.slug); setIcon(cat.icon || ""); setParentId(cat.parentId || "");
    setEditingId(cat.id); setDialogOpen(true);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this category?")) return;
    await fetch("/api/categories", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    loadCategories();
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-bold">Categories</h1>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) { setEditingId(null); setName(""); setSlug(""); setIcon(""); setParentId(""); } }}>
          <DialogTrigger asChild>
            <Button>Add Category</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Category" : "New Category"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Name</label>
                <Input value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Slug</label>
                <Input value={slug} onChange={(e) => setSlug(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Icon</label>
                <div className="flex items-center gap-2">
                  <Input value={icon} onChange={(e) => setIcon(e.target.value)} className="flex-1" />
                  <EmojiPicker onSelect={setIcon} />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Parent Category</label>
                <Select value={parentId || "none"} onValueChange={(v) => setParentId(v === "none" ? "" : v)}>
                  <SelectTrigger><SelectValue placeholder="None (top level)" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None (top level)</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full">{editingId ? "Update" : "Create"}</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead className="border-b border-border">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Icon</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Name</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Slug</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Children</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr key={cat.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 text-lg">{cat.icon || "📁"}</td>
                  <td className="px-4 py-3 font-medium">{cat.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{cat.slug}</td>
                  <td className="px-4 py-3">
                    {cat.children.length > 0 && <Badge variant="secondary">{cat.children.length}</Badge>}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button variant="ghost" size="sm" onClick={() => startEdit(cat)}>Edit</Button>
                    <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleDelete(cat.id)}>Delete</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
```

- [ ] **Step 2: Rewrite admin/tags/page.tsx**

Replace `src/app/admin/tags/page.tsx`:

```tsx
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tag } from "@/generated/prisma/client";

export default function AdminTagsPage() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [type, setType] = useState<"DIFFICULTY" | "TOPIC">("TOPIC");
  const [dialogOpen, setDialogOpen] = useState(false);

  async function loadTags() {
    const res = await fetch("/api/tags");
    setTags(await res.json());
  }

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { void loadTags(); }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/tags", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, slug, type }),
    });
    setName(""); setSlug(""); setType("TOPIC");
    setDialogOpen(false);
    loadTags();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this tag?")) return;
    await fetch("/api/tags", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    loadTags();
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-bold">Tags</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>Add Tag</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New Tag</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Name</label>
                <Input value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Slug</label>
                <Input value={slug} onChange={(e) => setSlug(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Type</label>
                <Select value={type} onValueChange={(v) => setType(v as "DIFFICULTY" | "TOPIC")}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DIFFICULTY">Difficulty</SelectItem>
                    <SelectItem value="TOPIC">Topic</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full">Create</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead className="border-b border-border">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Name</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Slug</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Type</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {tags.map((tag) => (
                <tr key={tag.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 font-medium">{tag.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{tag.slug}</td>
                  <td className="px-4 py-3"><Badge variant="outline">{tag.type}</Badge></td>
                  <td className="px-4 py-3 text-right">
                    <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleDelete(tag.id)}>Delete</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
```

- [ ] **Step 3: Rewrite admin/users/page.tsx**

Replace `src/app/admin/users/page.tsx`:

```tsx
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    select: { id: true, email: true, nickname: true, role: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="mb-6 text-xl font-bold">Users ({users.length})</h1>
      <Card>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead className="border-b border-border">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Nickname</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Email</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Role</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Joined</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 font-medium">{user.nickname}</td>
                  <td className="px-4 py-3 text-muted-foreground">{user.email}</td>
                  <td className="px-4 py-3"><Badge variant={user.role === "ADMIN" ? "default" : "outline"}>{user.role}</Badge></td>
                  <td className="px-4 py-3 text-muted-foreground">{new Date(user.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
```

- [ ] **Step 4: Rewrite admin/comments/page.tsx**

Replace `src/app/admin/comments/page.tsx`:

```tsx
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface AdminComment {
  id: string;
  content: string;
  createdAt: string;
  user: { nickname: string };
  article: { title: string };
}

export default function AdminCommentsPage() {
  const [comments, setComments] = useState<AdminComment[]>([]);

  async function loadComments() {
    const res = await fetch("/api/comments?all=true");
    setComments(await res.json());
  }

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { void loadComments(); }, []);

  async function handleDelete(id: string) {
    await fetch(`/api/comments/${id}`, { method: "DELETE" });
    setComments(comments.filter((c) => c.id !== id));
  }

  return (
    <div>
      <h1 className="mb-6 text-xl font-bold">Comments ({comments.length})</h1>
      <Card>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead className="border-b border-border">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">User</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Comment</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden md:table-cell">Article</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden md:table-cell">Date</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {comments.map((c) => (
                <tr key={c.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 font-medium">{c.user.nickname}</td>
                  <td className="px-4 py-3 text-muted-foreground max-w-xs truncate">{c.content}</td>
                  <td className="px-4 py-3 text-muted-foreground hidden md:table-cell max-w-xs truncate">{c.article.title}</td>
                  <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{new Date(c.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-right">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="text-destructive">Delete</Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete comment?</AlertDialogTitle>
                          <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(c.id)}>Delete</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
```

- [ ] **Step 5: Verify in browser**

Open each admin page — `/admin/categories`, `/admin/tags`, `/admin/users`, `/admin/comments`.

- [ ] **Step 6: Commit**

```bash
git add src/app/admin/categories/page.tsx src/app/admin/tags/page.tsx src/app/admin/users/page.tsx src/app/admin/comments/page.tsx
git commit -m "feat: redesign admin category, tag, user, comment pages with shadcn/ui"
```

---

### Task 15: Redesign Admin Import Page

**Files:**
- Modify: `src/app/admin/import/page.tsx`
- Modify: `src/components/admin/import-form.tsx`

- [ ] **Step 1: Rewrite admin/import/page.tsx**

Replace `src/app/admin/import/page.tsx`:

```tsx
import { prisma } from "@/lib/prisma";
import { ImportForm } from "@/components/admin/import-form";

export const dynamic = "force-dynamic";

export default async function AdminImportPage() {
  const [categories, tags] = await Promise.all([
    prisma.category.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.tag.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div>
      <h1 className="mb-6 text-xl font-bold">Content Import</h1>
      <ImportForm categories={categories} tags={tags} />
    </div>
  );
}
```

- [ ] **Step 2: Rewrite import-form.tsx**

Replace `src/components/admin/import-form.tsx`:

```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ImportFormProps {
  categories: { id: string; name: string }[];
  tags: { id: string; name: string; type: string }[];
}

interface PreviewData {
  title: string;
  content: string;
  suggestedCategoryId?: string;
  suggestedTagIds?: string[];
}

export function ImportForm({ categories, tags }: ImportFormProps) {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<PreviewData | null>(null);
  const [title, setTitle] = useState("");
  const [type, setType] = useState("NOTE");
  const [categoryId, setCategoryId] = useState("");
  const [tagIds, setTagIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  async function handlePreview(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "preview", url }),
    });
    const data = await res.json();
    setLoading(false);
    if (res.ok) {
      setPreview(data);
      setTitle(data.title || "");
      setCategoryId(data.suggestedCategoryId || "");
      setTagIds(data.suggestedTagIds || []);
    }
  }

  async function handleSave() {
    setSaving(true);
    const res = await fetch("/api/import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "save",
        title,
        content: preview!.content,
        type,
        categoryId,
        tagIds,
        sourceUrl: url,
      }),
    });
    setSaving(false);
    if (res.ok) {
      router.push("/admin/articles");
      router.refresh();
    }
  }

  function toggleTag(tagId: string) {
    setTagIds((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  }

  return (
    <div className="space-y-6">
      {/* URL Input */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Extract from URL</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePreview} className="flex gap-3">
            <Input
              type="url"
              placeholder="https://example.com/article"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
              className="flex-1"
            />
            <Button type="submit" disabled={loading}>
              {loading ? "Extracting..." : "Preview"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Preview & Edit */}
      {preview && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Preview & Edit</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Title</label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Type</label>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NOTE">Note</SelectItem>
                    <SelectItem value="INTERVIEW">Interview</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <Select value={categoryId} onValueChange={setCategoryId}>
                  <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Tags</label>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Button
                    key={tag.id}
                    type="button"
                    variant={tagIds.includes(tag.id) ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleTag(tag.id)}
                  >
                    {tag.name}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Content Preview</label>
              <div className="max-h-64 overflow-y-auto rounded-md border border-border bg-muted/50 p-3 text-sm font-mono whitespace-pre-wrap">
                {preview.content.substring(0, 2000)}
                {preview.content.length > 2000 && "..."}
              </div>
            </div>

            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Save as Draft"}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Verify in browser**

Open `http://localhost:3000/admin/import` — verify URL input and preview flow.

- [ ] **Step 4: Commit**

```bash
git add src/app/admin/import/page.tsx src/components/admin/import-form.tsx
git commit -m "feat: redesign admin import page with shadcn/ui"
```

---

## Phase 5: Enhancement (插入需求)

### Task 17: Add Article Cover Image Support

**Background:** 分类页瀑布流卡片目前使用分类图标渐变占位，需要支持真实文章封面图。

**Files:**
- Modify: `prisma/schema.prisma`
- Modify: `src/components/masonry-article-card.tsx`
- Modify: `src/components/article-card.tsx`
- Modify: `src/components/admin/article-form.tsx`
- Modify: `src/app/admin/articles/[id]/page.tsx`

- [ ] **Step 1: Add coverImage field to Article model**

在 `prisma/schema.prisma` 的 Article model 中添加：

```prisma
coverImage  String?
```

- [ ] **Step 2: Generate and run migration**

```bash
npx prisma migrate dev --name add-article-cover-image
npx prisma generate
```

- [ ] **Step 3: Update MasonryArticleCard to display real cover image**

修改 `src/components/masonry-article-card.tsx`：当 `article.coverImage` 存在时用 `<img>` 显示封面，否则保留分类图标渐变占位。

- [ ] **Step 4: Update ArticleCard to optionally display cover image**

修改 `src/components/article-card.tsx`：可选显示封面缩略图。

- [ ] **Step 5: Update Admin article form to support cover image URL input**

修改 `src/components/admin/article-form.tsx`：增加封面图 URL 输入框。

- [ ] **Step 6: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

- [ ] **Step 7: Verify in browser**

- 分类页瀑布流卡片显示封面图
- Admin 文章编辑页可输入封面图 URL
- 无封面图时仍然显示分类图标占位

- [ ] **Step 8: Commit**

```bash
git add prisma/ src/components/masonry-article-card.tsx src/components/article-card.tsx src/components/admin/article-form.tsx
git commit -m "feat: add article cover image support for masonry cards"
```

---

## Phase 6: Final Verification

### Task 18: Build, Lint, Test, and Browser Verification

- [ ] **Step 1: Run TypeScript check**

```bash
npx tsc --noEmit
```

Expected: 0 errors.

- [ ] **Step 2: Run lint**

```bash
npm run lint
```

Expected: 0 errors.

- [ ] **Step 3: Run tests**

```bash
npm test
```

Expected: All tests pass.

- [ ] **Step 4: Run production build**

```bash
npm run build
```

Expected: Build succeeds.

- [ ] **Step 5: Fix any issues found in steps 1-4**

Address any errors and commit fixes.

- [ ] **Step 6: Browser verification**

Verify in browser at `http://localhost:3000`:
- Homepage: stats bar, category grid, hot/latest articles
- Notes/Interviews: filters with Select dropdowns, cards with hover effects
- Article detail: three-column layout, mobile floating bar
- Login/Register: centered card layout
- Profile: avatar, learning progress bars, favorites
- Admin: sidebar, dashboard, article table, category/tag dialogs
- Light/Dark mode toggle works on all pages
- Mobile: bottom tab bar, hamburger menu, responsive layouts

- [ ] **Step 7: Commit if there were fixes**

```bash
git add -A
git commit -m "fix: resolve build and lint issues from UI redesign"
```
