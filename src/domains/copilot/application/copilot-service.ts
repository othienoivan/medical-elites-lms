import {
  DocumentationAssistantService,
  documentationRouteActions,
  resolveDocumentationPageContext,
  type DocumentationAssistantResult,
  type DocumentationRole,
} from "../../knowledge";
import { DeterministicAnswerService } from "./deterministic-answer-service";

function resolveAllowedActions(
  actionKeys: string[],
  role: DocumentationRole,
): DocumentationAssistantResult["actions"] {
  if (!role) return [];

  return actionKeys.flatMap((routeKey) => {
    const action = documentationRouteActions.find(
      (candidate) =>
        candidate.key === routeKey && candidate.roles.includes(role),
    );

    return action
      ? [{ routeKey: action.key, label: action.label, path: action.path }]
      : [];
  });
}

function isExplainRequest(prompt: string): boolean {
  return /explain (this|the) page|what (is|does) this page|page purpose/i.test(
    prompt,
  );
}

function isGuideRequest(prompt: string): boolean {
  return /guide me|step by step|main task on this page/i.test(prompt);
}

export const CopilotService = {
  async ask(
    prompt: string,
    pathname: string,
    role: DocumentationRole,
    pageTitle: string,
  ): Promise<DocumentationAssistantResult> {
    const pageContext = resolveDocumentationPageContext(pathname);

    if (isExplainRequest(prompt)) {
      return {
        answer: `${pageContext.purpose}\n\nMain workflow\n${pageContext.mainWorkflow
          .map((step, index) => `${index + 1}. ${step}`)
          .join("\n")}`,
        actions: resolveAllowedActions(pageContext.actionKeys, role),
        articles: [],
      };
    }

    if (isGuideRequest(prompt)) {
      return {
        answer: `Follow these steps on ${pageTitle}:\n${pageContext.mainWorkflow
          .map((step, index) => `${index + 1}. ${step}`)
          .join("\n")}`,
        actions: resolveAllowedActions(pageContext.actionKeys, role),
        articles: [],
        guide: {
          title: `${pageContext.pageTitle} guide`,
          steps: pageContext.mainWorkflow,
        },
      };
    }

    const deterministic = DeterministicAnswerService.resolve(prompt, role);

    if (deterministic) {
      return {
        answer: deterministic.answer,
        actions: resolveAllowedActions(deterministic.actionKeys, role),
        articles: [],
      };
    }

    return DocumentationAssistantService.ask(
      prompt,
      pathname,
      role,
      pageTitle,
    );
  },
};
