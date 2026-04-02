"use client";

import { useState, useRef, useEffect } from "react";
import dynamic from "next/dynamic";

const Picker = dynamic(() => import("@emoji-mart/react"), { ssr: false });

interface EmojiPickerProps {
  value: string;
  onChange: (emoji: string) => void;
}

export function EmojiPicker({ value, onChange }: EmojiPickerProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-16 h-9 px-3 py-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md text-center hover:border-blue-500 transition-colors"
      >
        {value || "选择"}
      </button>
      {open && (
        <div className="absolute top-10 left-0 z-50">
          <Picker
            onEmojiSelect={(emoji: { native: string }) => {
              onChange(emoji.native);
              setOpen(false);
            }}
            theme="auto"
            locale="zh"
            previewPosition="none"
            skinTonePosition="none"
          />
        </div>
      )}
    </div>
  );
}
