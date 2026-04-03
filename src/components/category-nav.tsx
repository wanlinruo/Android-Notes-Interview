import Link from "next/link";

interface CategoryNavProps {
  articles: { slug: string; title: string }[];
  currentSlug: string;
  categoryName: string;
}

export function CategoryNav({ articles, currentSlug, categoryName }: CategoryNavProps) {
  return (
    <div>
      <h3 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
        {categoryName}
      </h3>
      <nav className="space-y-0.5">
        {articles.map((article) => (
          <Link
            key={article.slug}
            href={`/articles/${article.slug}`}
            className={`block rounded-md px-3 py-1.5 text-sm transition-colors ${
              article.slug === currentSlug
                ? "border-l-2 border-primary bg-primary/5 font-medium text-primary"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            }`}
          >
            {article.title}
          </Link>
        ))}
      </nav>
    </div>
  );
}
