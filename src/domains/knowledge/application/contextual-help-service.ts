import type { KnowledgeArticle } from "../domain/models";
import { KnowledgeService } from "./knowledge-service";

function matchesContext(article: KnowledgeArticle, pathname: string): boolean {
  return (article.routeContexts ?? []).some((context) =>
    context === "*" || pathname === context || pathname.startsWith(`${context}/`),
  );
}

export const ContextualHelpService = {
  resolve(pathname: string, role?: string | null, limit = 5): KnowledgeArticle[] {
    return KnowledgeService.list(role)
      .filter((article) => matchesContext(article, pathname))
      .slice(0, limit);
  },
};
