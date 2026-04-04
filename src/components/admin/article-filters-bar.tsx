"use client";

import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ArticleFiltersProps {
  currentStatus?: string;
  currentType?: string;
}

const statusFilters = [
  { label: "All", value: undefined },
  { label: "Draft", value: "DRAFT" },
  { label: "Published", value: "PUBLISHED" },
];

const typeFilters = [
  { label: "All Types", value: undefined },
  { label: "Note", value: "NOTE" },
  { label: "Interview", value: "INTERVIEW" },
];

function buildFilterUrl(status?: string, type?: string) {
  const p = new URLSearchParams();
  if (status) p.set("status", status);
  if (type) p.set("type", type);
  const qs = p.toString();
  return `/admin/articles${qs ? `?${qs}` : ""}`;
}

export function ArticleFilters({ currentStatus, currentType }: ArticleFiltersProps) {
  return (
    <div className="mb-4 flex flex-wrap items-center gap-4">
      <div className="flex gap-1.5">
        {statusFilters.map((filter) => (
          <Link
            key={filter.label}
            href={buildFilterUrl(filter.value, currentType)}
            className={cn(buttonVariants({
              variant: currentStatus === filter.value || (!currentStatus && !filter.value) ? "default" : "outline",
              size: "sm",
            }))}
          >
            {filter.label}
          </Link>
        ))}
      </div>
      <div className="h-4 w-px bg-border" />
      <div className="flex gap-1.5">
        {typeFilters.map((filter) => (
          <Link
            key={filter.label}
            href={buildFilterUrl(currentStatus, filter.value)}
            className={cn(buttonVariants({
              variant: currentType === filter.value || (!currentType && !filter.value) ? "secondary" : "outline",
              size: "sm",
            }))}
          >
            {filter.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
