import type { KnowledgeArticle } from "../../knowledge";
import type { DocumentationAssistantAction } from "../../knowledge/domain/assistant-models";

export type CopilotMode = "ask" | "explain" | "guide" | "search";

export interface CopilotMessage {
  id: string;
  sender: "user" | "medi";
  text: string;
  createdAt: number;
  actions?: DocumentationAssistantAction[];
  articles?: KnowledgeArticle[];
}

export interface DeterministicCopilotAnswer {
  answer: string;
  actionKeys: string[];
  articleSlugs?: string[];
}
