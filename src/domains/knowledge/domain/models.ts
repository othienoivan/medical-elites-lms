export type KnowledgeAudience =
  | "all"
  | "administrator"
  | "institution_admin"
  | "tutor"
  | "student"
  | "platform_admin"
  | "developer";

export type KnowledgeArticleStatus = "draft" | "published" | "archived";

export interface KnowledgeArticle {
  id: string;
  slug: string;
  title: string;
  summary: string;
  body: string;
  category: string;
  audience: KnowledgeAudience[];
  status: KnowledgeArticleStatus;
  version: string;
  keywords: string[];
  relatedArticleSlugs?: string[];
  routeContexts?: string[];
  estimatedMinutes?: number;
  updatedAt?: string;
}

export interface KnowledgeCategory {
  id: string;
  title: string;
  description: string;
  icon: string;
  order: number;
}
