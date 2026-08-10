import type { KnowledgeArticle } from "./models";

export interface DocumentationAssistantAction { label: string; routeKey: string; path: string; }
export interface DocumentationGuide { title: string; steps: string[]; }
export interface DocumentationAssistantResult {
  answer: string;
  articles: KnowledgeArticle[];
  actions: DocumentationAssistantAction[];
  guide?: DocumentationGuide;
}
