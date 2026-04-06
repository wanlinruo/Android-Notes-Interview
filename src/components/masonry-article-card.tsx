import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface MasonryArticleCardProps {
  article: {
    slug: string;
    title: string;
    summary?: string | null;
    coverImage?: string | null;
    type: string;
    viewCount: number;
    _count?: { favorites: number; comments?: number };
    category: { name: string; icon?: string | null };
    tags: { tag: { name: string; type: string } }[];
  };
  variant?: "default" | "compact" | "featured";
}

export function MasonryArticleCard({ article, variant = "default" }: MasonryArticleCardProps) {
  const difficultyTag = article.tags.find((t) => t.tag.type === "DIFFICULTY");
  const topicTags = article.tags.filter((t) => t.tag.type === "TOPIC").slice(0, 3);
  const showSummary = variant !== "compact";
  const showTags = variant !== "compact";
  const coverAspect = variant === "featured" ? "aspect-[16/12]" : variant === "compact" ? "aspect-[3/1]" : "aspect-[16/10]";

  return (
    <Link href={`/articles/${article.slug}`} className="block break-inside-avoid">
      <Card className="group overflow-hidden transition-all duration-250 hover:-translate-y-1 hover:shadow-lg hover:border-primary/50">
        {/* Cover image or placeholder */}
        {article.coverImage ? (
          <div className={`overflow-hidden ${coverAspect}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={article.coverImage}
              alt={article.title}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
        ) : (
          <div className={`flex items-center justify-center bg-gradient-to-br from-primary/8 via-primary/4 to-transparent ${coverAspect}`}>
            <span className={`opacity-60 group-hover:scale-110 transition-transform duration-300 ${variant === "compact" ? "text-2xl" : "text-4xl"}`}>
              {article.category.icon || "📄"}
            </span>
          </div>
        )}

        <CardContent className={variant === "compact" ? "p-3" : "p-4"}>
          {/* Category label */}
          <div className="text-[11px] font-semibold uppercase tracking-wider text-primary mb-1.5">
            {article.category.name}
          </div>

          {/* Title */}
          <h3 className={`font-semibold leading-snug group-hover:text-primary transition-colors mb-2 ${variant === "compact" ? "text-sm line-clamp-2" : "text-[15px] line-clamp-2"}`}>
            {article.title}
          </h3>

          {/* Summary */}
          {showSummary && article.summary && (
            <p className="text-[13px] text-muted-foreground leading-relaxed line-clamp-3 mb-3">
              {article.summary}
            </p>
          )}

          {/* Tags */}
          {showTags && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {topicTags.map((t) => (
                <Badge key={t.tag.name} variant="secondary" className="text-[11px] px-2 py-0 font-normal">
                  {t.tag.name}
                </Badge>
              ))}
              {difficultyTag && (
                <Badge variant="outline" className="text-[11px] px-2 py-0 font-normal border-amber-500/40 text-amber-600 dark:text-amber-400">
                  {difficultyTag.tag.name}
                </Badge>
              )}
            </div>
          )}

          {/* Meta */}
          {variant !== "compact" && (
            <div className="flex items-center gap-3 text-xs text-muted-foreground pt-3 border-t border-border">
              <span>👁 {article.viewCount}</span>
              <span>⭐ {article._count?.favorites || 0}</span>
              {article._count?.comments !== undefined && (
                <span>💬 {article._count.comments}</span>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
