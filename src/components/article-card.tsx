import Link from "next/link";
import { ArticleWithRelations } from "@/types";

export function ArticleCard({ article }: { article: ArticleWithRelations }) {
  const difficultyTag = article.tags.find(
    (t) => t.tag.type === "DIFFICULTY"
  )?.tag;

  return (
    <Link
      href={`/articles/${article.slug}`}
      className="block p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg hover:border-blue-500 dark:hover:border-blue-500 transition-colors"
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-medium text-gray-900 dark:text-white">
          {article.title}
        </h3>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span>{article._count.favorites} fav</span>
          <span>{article.viewCount} views</span>
        </div>
      </div>
      {article.summary && (
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
          {article.summary}
        </p>
      )}
      <div className="flex items-center gap-2">
        <span
          className={`text-xs px-2 py-0.5 rounded ${
            article.type === "NOTE"
              ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
              : "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300"
          }`}
        >
          {article.type === "NOTE" ? "笔记" : "面试"}
        </span>
        {difficultyTag && (
          <span className="text-xs px-2 py-0.5 rounded bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
            {difficultyTag.name}
          </span>
        )}
        <span className="text-xs text-gray-500">{article.category.name}</span>
      </div>
    </Link>
  );
}
