"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const menuItems = [
  { href: "/admin", label: "仪表盘", icon: "📊" },
  { href: "/admin/articles", label: "文章管理", icon: "📝" },
  { href: "/admin/categories", label: "分类管理", icon: "📁" },
  { href: "/admin/tags", label: "标签管理", icon: "🏷️" },
  { href: "/admin/comments", label: "评论管理", icon: "💬" },
  { href: "/admin/users", label: "用户管理", icon: "👥" },
  { href: "/admin/import", label: "内容采集", icon: "📥" },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-52 flex-shrink-0 border-r border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 min-h-[calc(100vh-3.5rem)]">
      <div className="p-4">
        <h2 className="text-sm font-semibold text-gray-500 uppercase mb-4">
          管理后台
        </h2>
        <nav className="space-y-1">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors ${
                pathname === item.href
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800"
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </aside>
  );
}
