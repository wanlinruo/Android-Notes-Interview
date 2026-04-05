import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ArticleCardProps {
  article: {
    slug: string;
    title: string;
    summary?: string | null;
    coverImage?: string | null;
    type: string;
    viewCount: number;
    _count?: { favorites: number };
    category: { name: string };
    tags: { tag: { name: string; type: string } }[];
  };
}

export function ArticleCard({ article }: ArticleCardProps) {
  const difficultyTag = article.tags.find((t) => t.tag.type === "DIFFICULTY");

  return (
    <Link href={`/articles/${article.slug}`}>
      <Card className="group transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-primary/50">
        <CardContent className="flex items-start justify-between gap-4 p-4">
          {article.coverImage && (
            <div className="hidden sm:block h-20 w-28 shrink-0 overflow-hidden rounded-md">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={article.coverImage}
                alt=""
                className="h-full w-full object-cover"
              />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h3 className="font-medium leading-snug group-hover:text-primary transition-colors">
              {article.title}
            </h3>
            {article.summary && (
              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                {article.summary}
              </p>
            )}
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Badge variant={article.type === "NOTE" ? "default" : "secondary"} className="text-xs">
                {article.type === "NOTE" ? "NOTE" : "INTERVIEW"}
              </Badge>
              {difficultyTag && (
                <Badge variant="outline" className="text-xs">
                  {difficultyTag.tag.name}
                </Badge>
              )}
              <span className="text-xs text-muted-foreground">{article.category.name}</span>
              <span className="text-xs text-muted-foreground">
                👁 {article.viewCount} · ⭐ {article._count?.favorites || 0}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
