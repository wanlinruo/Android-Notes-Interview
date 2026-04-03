"use client";

import { useEffect, useState, useRef } from "react";
import { FavoriteButton } from "@/components/favorite-button";
import { ProgressButton } from "@/components/progress-button";

interface FloatingActionsProps {
  articleId: string;
  initialFavorited: boolean;
  favoriteCount: number;
  initialStatus: string;
}

export function FloatingActions({ articleId, initialFavorited, favoriteCount, initialStatus }: FloatingActionsProps) {
  const [visible, setVisible] = useState(true);
  const scrollTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    function handleScroll() {
      setVisible(false);
      if (scrollTimer.current) clearTimeout(scrollTimer.current);
      scrollTimer.current = setTimeout(() => {
        setVisible(true);
      }, 800);
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (scrollTimer.current) clearTimeout(scrollTimer.current);
    };
  }, []);

  return (
    <div
      className={`fixed right-4 bottom-24 z-40 flex flex-col gap-2 transition-all duration-300 lg:hidden ${
        visible ? "translate-x-0 opacity-100" : "translate-x-16 opacity-0"
      }`}
    >
      <FavoriteButton articleId={articleId} initialFavorited={initialFavorited} count={favoriteCount} />
      <ProgressButton articleId={articleId} initialStatus={initialStatus} />
    </div>
  );
}
