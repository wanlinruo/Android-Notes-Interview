"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface FavoriteButtonProps {
  articleId: string;
  initialFavorited: boolean;
  count: number;
}

export function FavoriteButton({ articleId, initialFavorited, count }: FavoriteButtonProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [favorited, setFavorited] = useState(initialFavorited);
  const [favCount, setFavCount] = useState(count);

  async function toggle() {
    if (!session) {
      router.push("/login");
      return;
    }
    const res = await fetch("/api/favorites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ articleId }),
    });
    if (!res.ok) return;
    const data = await res.json();
    setFavorited(data.favorited);
    setFavCount((c) => (data.favorited ? c + 1 : c - 1));
  }

  return (
    <Button
      variant={favorited ? "default" : "outline"}
      size="sm"
      onClick={toggle}
      className={`w-full gap-1.5 transition-all ${favorited ? "active:scale-95" : ""}`}
    >
      <svg
        className={`h-4 w-4 transition-transform ${favorited ? "scale-110 fill-current" : ""}`}
        xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      >
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
      </svg>
      {favCount}
    </Button>
  );
}
