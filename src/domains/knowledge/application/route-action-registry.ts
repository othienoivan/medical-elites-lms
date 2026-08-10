export type DocumentationRole = "student" | "tutor" | "admin" | null;
export interface RouteActionDefinition { key: string; label: string; path: string; roles: Array<"student" | "tutor" | "admin">; keywords: string[]; }

export const documentationRouteActions: RouteActionDefinition[] = [
  { key: "help.center", label: "Open Knowledge Center", path: "/help", roles: ["student", "tutor", "admin"], keywords: ["help", "documentation"] },
  { key: "student.library", label: "Open My Library", path: "/student/library", roles: ["student"], keywords: ["library", "purchased", "owned"] },
  { key: "student.purchases", label: "Open My Purchases", path: "/student/purchases", roles: ["student"], keywords: ["purchase", "order", "payment"] },
  { key: "student.marketplace", label: "Browse Marketplace", path: "/student/marketplace", roles: ["student"], keywords: ["marketplace", "buy", "course"] },
  { key: "student.assessments", label: "Open Assessments", path: "/student/assessments", roles: ["student"], keywords: ["quiz", "assessment", "attempt"] },
  { key: "tutor.lessons", label: "Open Lessons", path: "/tutor/lessons", roles: ["tutor", "admin"], keywords: ["lesson", "builder", "objective"] },
  { key: "tutor.questionBank", label: "Open Question Bank", path: "/tutor/questions", roles: ["tutor", "admin"], keywords: ["question", "bank", "mcq"] },
  { key: "tutor.examinations", label: "Open Examinations", path: "/tutor/examinations", roles: ["tutor", "admin"], keywords: ["exam", "examination", "assessment"] },
  { key: "tutor.products", label: "Open Products", path: "/tutor/commerce/products", roles: ["tutor", "admin"], keywords: ["product", "sell", "marketplace"] },
  { key: "tutor.coupons", label: "Open Coupons", path: "/tutor/commerce/coupons", roles: ["tutor", "admin"], keywords: ["coupon", "discount", "promotion"] },
  { key: "admin.users", label: "Manage Users", path: "/admin/users", roles: ["admin"], keywords: ["user", "student", "tutor", "role"] },
  { key: "admin.programmes", label: "Manage Programmes", path: "/admin/programmes", roles: ["admin"], keywords: ["programme", "academic"] },
];

export function resolveDocumentationActions(query: string, role: DocumentationRole, limit = 3): RouteActionDefinition[] {
  if (!role) return [];
  const needle = query.toLowerCase();
  return documentationRouteActions
    .filter((action) => action.roles.includes(role))
    .map((action) => ({ action, score: action.keywords.filter((keyword) => needle.includes(keyword)).length }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ action }) => action);
}
