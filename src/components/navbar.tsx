"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { ThemeToggle } from "./theme-toggle";
import { SearchBox } from "./search-box";

export function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="font-bold text-lg text-gray-900 dark:text-white"
          >
            AndroidHub
          </Link>
          <Link
            href="/notes"
            className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            知识笔记
          </Link>
          <Link
            href="/interviews"
            className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            面试题
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <SearchBox />
          <ThemeToggle />
          {session?.user ? (
            <div className="flex items-center gap-3">
              {session.user.role === "ADMIN" && (
                <Link
                  href="/admin"
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                >
                  管理后台
                </Link>
              )}
              <Link
                href="/profile"
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                {session.user.name}
              </Link>
              <button
                onClick={() => signOut()}
                className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                退出
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="text-sm px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              登录
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
