"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const menuItems = [
  { href: "/admin", label: "Dashboard", icon: "📊" },
  { href: "/admin/articles", label: "Articles", icon: "📝" },
  { href: "/admin/categories", label: "Categories", icon: "📁" },
  { href: "/admin/tags", label: "Tags", icon: "🏷️" },
  { href: "/admin/comments", label: "Comments", icon: "💬" },
  { href: "/admin/users", label: "Users", icon: "👥" },
  { href: "/admin/import", label: "Import", icon: "📥" },
];

function SidebarTooltip({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Tooltip>
      <TooltipTrigger render={<span className="block" />}>
        {children}
      </TooltipTrigger>
      <TooltipContent side="right" sideOffset={8}>
        {label}
      </TooltipContent>
    </Tooltip>
  );
}

function MenuItem({
  href,
  icon,
  label,
  isActive,
  collapsed,
}: {
  href: string;
  icon: string;
  label: string;
  isActive: boolean;
  collapsed: boolean;
}) {
  const link = (
    <Link
      href={href}
      className={`flex items-center rounded-md px-2.5 py-2 text-sm transition-colors ${
        collapsed ? "justify-center" : "gap-2.5"
      } ${
        isActive
          ? "bg-primary/10 font-medium text-primary"
          : "text-muted-foreground hover:bg-accent hover:text-foreground"
      }`}
    >
      <span className="text-base flex-shrink-0">{icon}</span>
      {!collapsed && <span className="whitespace-nowrap overflow-hidden">{label}</span>}
    </Link>
  );

  if (collapsed) {
    return <SidebarTooltip label={label}>{link}</SidebarTooltip>;
  }
  return link;
}

export function AdminSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <TooltipProvider delay={200}>
      <aside
        className={`flex h-full flex-col border-r border-border bg-card transition-all duration-300 ${
          collapsed ? "w-[60px]" : "w-52"
        }`}
      >
        {/* Header */}
        <div className="flex h-14 items-center border-b border-border px-3">
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-[image:var(--brand-gradient)] text-sm text-white font-bold">
            C
          </div>
          {!collapsed && (
            <span className="ml-2.5 text-sm font-semibold whitespace-nowrap overflow-hidden">
              Console
            </span>
          )}
        </div>

        {/* Menu */}
        <nav className="flex-1 space-y-0.5 p-2">
          {menuItems.map((item) => {
            const isActive = item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);
            return (
              <MenuItem
                key={item.href}
                href={item.href}
                icon={item.icon}
                label={item.label}
                isActive={isActive}
                collapsed={collapsed}
              />
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-border p-2 space-y-0.5">
          {collapsed ? (
            <>
              <SidebarTooltip label="Back to site">
                <Link
                  href="/"
                  className="flex items-center justify-center rounded-md px-2.5 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                  <span className="text-base">🏠</span>
                </Link>
              </SidebarTooltip>
              <SidebarTooltip label="Expand sidebar">
                <button
                  onClick={() => setCollapsed(false)}
                  className="flex w-full items-center justify-center rounded-md px-2.5 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                  <span className="text-base">»</span>
                </button>
              </SidebarTooltip>
            </>
          ) : (
            <>
              <Link
                href="/"
                className="flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                <span className="text-base">🏠</span>
                <span className="whitespace-nowrap overflow-hidden">Back to site</span>
              </Link>
              <button
                onClick={() => setCollapsed(true)}
                className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                <span className="text-base">«</span>
                <span className="whitespace-nowrap overflow-hidden">Collapse</span>
              </button>
            </>
          )}
        </div>
      </aside>
    </TooltipProvider>
  );
}
