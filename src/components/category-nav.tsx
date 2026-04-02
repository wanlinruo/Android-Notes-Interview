import Link from "next/link";

interface Article {
  id: string;
  title: string;
  slug: string;
}

interface Props {
  articles: Article[];
  currentSlug: string;
  categoryName: string;
}

export function CategoryNav({ articles, currentSlug, categoryName }: Props) {
  return (
    <nav>
      <p className="text-xs font-medium text-gray-500 uppercase mb-2">
        {categoryName}
      </p>
      <div className="space-y-0.5">
        {articles.map((article) => (
          <Link
            key={article.id}
            href={`/articles/${article.slug}`}
            className={`block text-xs py-1.5 px-2 rounded transition-colors ${
              article.slug === currentSlug
                ? "bg-blue-600 text-white"
                : "text-gray-400 hover:text-white hover:bg-gray-800"
            }`}
          >
            {article.title}
          </Link>
        ))}
      </div>
    </nav>
  );
}
