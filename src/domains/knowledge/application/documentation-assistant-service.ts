import { generateAiResponse } from "../../../firebase/aiAssistant";
import type {
  DocumentationAssistantAction,
  DocumentationAssistantResult,
} from "../domain/assistant-models";
import { ContextualHelpService } from "./contextual-help-service";
import { KnowledgeService } from "./knowledge-service";
import {
  resolveDocumentationActions,
  type DocumentationRole,
  type RouteActionDefinition,
} from "./route-action-registry";

function toAssistantAction(
  action: RouteActionDefinition,
): DocumentationAssistantAction {
  return {
    routeKey: action.key,
    label: action.label,
    path: action.path,
  };
}

export const DocumentationAssistantService = {
  async ask(
    prompt: string,
    pathname: string,
    role: DocumentationRole,
    pageTitle: string,
  ): Promise<DocumentationAssistantResult> {
    const contextualArticles =
      ContextualHelpService.resolve(
        pathname,
        role,
        4,
      );

    const searchArticles =
      KnowledgeService.search(
        prompt,
        role,
      ).slice(0, 4);

    const articles = [
      ...contextualArticles,
      ...searchArticles,
    ]
      .filter(
        (article, index, list) =>
          list.findIndex(
            (item) => item.id === article.id,
          ) === index,
      )
      .slice(0, 6);

    const actions =
      resolveDocumentationActions(
        `${prompt} ${pathname}`,
        role,
      ).map(toAssistantAction);

    const grounding = articles
      .map((article) =>
        [
          `TITLE: ${article.title}`,
          `SUMMARY: ${article.summary}`,
          `CONTENT: ${article.body}`,
        ].join("\n"),
      )
      .join("\n\n");

    const context = [
      `ROLE: ${role ?? "unknown"}`,
      `CURRENT PAGE: ${pageTitle}`,
      `ROUTE: ${pathname}`,
      "",
      "KNOWLEDGE ARTICLES:",
      grounding ||
        "No matching Knowledge Center articles were found.",
    ].join("\n");

    try {
      const response =
        await generateAiResponse({
          mode: "documentation_assistant",
          prompt,
          context,
        });

      return {
        answer: response.text,
        articles,
        actions,
      };
    } catch (error) {
      console.error(
        "Documentation assistant request failed",
        error,
      );

      return {
        answer:
          articles.length > 0
            ? `Here are the most relevant Knowledge Center articles for ${pageTitle}.`
            : "No matching article is available yet. Open the Knowledge Center to search all documentation.",
        articles,
        actions,
      };
    }
  },
};