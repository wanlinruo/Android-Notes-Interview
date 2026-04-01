import { Article, Category, Tag, User, Comment } from "@/generated/prisma/client";

export type ArticleWithRelations = Article & {
  category: Category;
  tags: { tag: Tag }[];
  _count: {
    favorites: number;
    comments: number;
  };
};

export type CategoryWithChildren = Category & {
  children: Category[];
};

export type CommentWithUser = Comment & {
  user: Pick<User, "id" | "nickname" | "avatar">;
};
