"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function SearchBox() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/notes?q=${encodeURIComponent(query.trim())}`);
    }
  }

  return (
    <form onSubmit={handleSearch} className="relative">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="搜索知识点..."
        className="w-48 px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
      />
    </form>
  );
}
