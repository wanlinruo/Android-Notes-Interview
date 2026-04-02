"use client";

import { useEffect, useState } from "react";

interface TocItem {
  id: string;
  text: string;
  level: number;
}

export function Toc({ content }: { content: string }) {
  const [activeId, setActiveId] = useState("");

  const headings: TocItem[] = content
    .split("\n")
    .filter((line) => /^#{2,4}\s/.test(line))
    .map((line) => {
      const match = line.match(/^(#{2,4})\s+(.+)/);
      if (!match) return null;
      const text = match[2].trim();
      const id = text
        .toLowerCase()
        .replace(/[^a-z0-9\u4e00-\u9fff]+/g, "-")
        .replace(/^-|-$/g, "");
      return { id, text, level: match[1].length };
    })
    .filter(Boolean) as TocItem[];

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((e) => e.isIntersecting);
        if (visible) setActiveId(visible.target.id);
      },
      { rootMargin: "-80px 0px -80% 0px" }
    );

    headings.forEach((h) => {
      const el = document.getElementById(h.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [headings]);

  if (headings.length === 0) return null;

  return (
    <nav className="space-y-1">
      <p className="text-xs font-medium text-gray-500 uppercase mb-2">目录</p>
      {headings.map((h) => (
        <a
          key={h.id}
          href={`#${h.id}`}
          className={`block text-xs py-0.5 transition-colors ${
            h.level === 3 ? "pl-3" : h.level === 4 ? "pl-6" : ""
          } ${
            activeId === h.id
              ? "text-blue-600 dark:text-blue-400"
              : "text-gray-500 hover:text-gray-900 dark:hover:text-gray-300"
          }`}
        >
          {h.text}
        </a>
      ))}
    </nav>
  );
}
