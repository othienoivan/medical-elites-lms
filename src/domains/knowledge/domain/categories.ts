import type { KnowledgeCategory } from "./models";

export const knowledgeCategories: KnowledgeCategory[] = [
  { id: "getting-started", title: "Getting Started", description: "Account access, navigation and first steps.", icon: "Rocket", order: 1 },
  { id: "administration", title: "Administration", description: "Institution, user and platform administration.", icon: "ShieldCheck", order: 2 },
  { id: "academic-management", title: "Academic Management", description: "Programmes, course units, modules and registration.", icon: "GraduationCap", order: 3 },
  { id: "tutor-tools", title: "Tutor Tools", description: "Teaching, authoring, assessments and learner management.", icon: "Presentation", order: 4 },
  { id: "student-learning", title: "Student Learning", description: "Courses, lessons, progress and assessments.", icon: "BookOpen", order: 5 },
  { id: "marketplace", title: "Marketplace", description: "Products, purchases, storefronts and coupons.", icon: "ShoppingBag", order: 6 },
  { id: "payments-wallets", title: "Payments and Wallets", description: "Checkout, payments, earnings and reconciliation.", icon: "WalletCards", order: 7 },
  { id: "medi-ai", title: "Medi AI", description: "AI-assisted curriculum, lessons and assessment support.", icon: "Sparkles", order: 8 },
  { id: "security-permissions", title: "Security and Permissions", description: "Roles, access control and audit guidance.", icon: "LockKeyhole", order: 9 },
  { id: "troubleshooting", title: "Troubleshooting", description: "Resolve common platform and workflow problems.", icon: "Wrench", order: 10 },
  { id: "release-notes", title: "Release Notes", description: "What changed in each Medical Elites LMS release.", icon: "Megaphone", order: 11 },
];
