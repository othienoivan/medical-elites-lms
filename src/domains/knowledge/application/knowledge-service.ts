import type { KnowledgeArticle, KnowledgeAudience } from "../domain/models";
import { staticKnowledgeArticles } from "../infrastructure/static-knowledge-repository";

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

function roleAudience(role?: string | null): KnowledgeAudience {
  if (role === "student") return "student";
  if (role === "tutor") return "tutor";
  if (role === "admin") return "administrator";
  if (role === "institution_admin") return "institution_admin";
  if (role === "platform_admin" || role === "super_admin" || role === "founder") return "platform_admin";
  return "all";
}

function canRead(article: KnowledgeArticle, audience: KnowledgeAudience): boolean {
  return article.status === "published" && (
    article.audience.includes("all") ||
    audience === "all" ||
    article.audience.includes(audience)
  );
}

export const KnowledgeService = {
  list(role?: string | null): KnowledgeArticle[] {
    const audience = roleAudience(role);
    return staticKnowledgeArticles.filter((article) => canRead(article, audience));
  },

  getBySlug(slug: string, role?: string | null): KnowledgeArticle | null {
    return this.list(role).find((article) => article.slug === slug) ?? null;
  },

  listByCategory(category: string, role?: string | null): KnowledgeArticle[] {
    return this.list(role).filter((article) => article.category === category);
  },

  search(query: string, role?: string | null): KnowledgeArticle[] {
    const needle = normalize(query);
    if (!needle) return this.list(role);
    return this.list(role)
      .map((article) => {
        const searchable = [article.title, article.summary, article.body, article.category, ...article.keywords]
          .join(" ")
          .toLowerCase();
        const score = article.title.toLowerCase().includes(needle) ? 3 :
          article.keywords.some((keyword) => keyword.toLowerCase().includes(needle)) ? 2 :
          searchable.includes(needle) ? 1 : 0;
        return { article, score };
      })
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score || a.article.title.localeCompare(b.article.title))
      .map(({ article }) => article);
  },

  recommended(role?: string | null, limit = 6): KnowledgeArticle[] {
    return this.list(role).slice(0, limit);
  },
};
