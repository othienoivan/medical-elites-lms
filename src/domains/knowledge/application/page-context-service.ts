export interface DocumentationPageContext {
  pathname: string;
  pageTitle: string;
  purpose: string;
  mainWorkflow: string[];
  actionKeys: string[];
}

interface PageContextDefinition {
  pattern: RegExp;
  pageTitle: string;
  purpose: string;
  mainWorkflow: string[];
  actionKeys: string[];
}

const contexts: PageContextDefinition[] = [
  {
    pattern: /^\/dashboard(?:\/|$)/,
    pageTitle: "Student Dashboard",
    purpose:
      "Your student dashboard summarizes learning activity and gives you quick access to courses, assessments, marketplace purchases and support.",
    mainWorkflow: [
      "Review your current learning and pending tasks.",
      "Continue an assigned or previously started course unit.",
      "Open assessments, the marketplace or My Learning Library as needed.",
    ],
    actionKeys: ["student.library", "student.purchases", "student.assessments"],
  },
  {
    pattern: /^\/student\/library/,
    pageTitle: "My Learning Library",
    purpose:
      "This page contains learning products granted through fulfilled marketplace purchases.",
    mainWorkflow: [
      "Search or filter your owned learning products.",
      "Select a product to open its learning destination.",
      "Use My Purchases to confirm fulfilment when an item is missing.",
    ],
    actionKeys: ["student.purchases", "student.marketplace"],
  },
  {
    pattern: /^\/student\/purchases/,
    pageTitle: "My Purchases",
    purpose:
      "This page shows your marketplace orders, payment status and fulfilment status.",
    mainWorkflow: [
      "Review the order status.",
      "Confirm successful orders are marked Fulfilled.",
      "Open fulfilled learning from My Learning Library.",
    ],
    actionKeys: ["student.library", "student.marketplace"],
  },
  {
    pattern: /^\/student\/assessments/,
    pageTitle: "Student Assessments",
    purpose:
      "This page lists assessments assigned to you and enforces tutor-configured attempt limits.",
    mainWorkflow: [
      "Choose an available assessment.",
      "Review instructions and remaining attempts.",
      "Start, submit and review the result when permitted.",
    ],
    actionKeys: ["student.assessments"],
  },
  {
    pattern: /^\/tutor\/dashboard/,
    pageTitle: "Tutor Dashboard",
    purpose:
      "The tutor dashboard summarizes teaching, assessment, student and commerce activity.",
    mainWorkflow: [
      "Review items that require attention.",
      "Open lessons, questions or examinations to continue authoring.",
      "Use commerce tools to manage products and promotions.",
    ],
    actionKeys: ["tutor.lessons", "tutor.questionBank", "tutor.products"],
  },
  {
    pattern: /^\/tutor\/lessons/,
    pageTitle: "Tutor Lessons",
    purpose:
      "This workspace lets tutors create, edit and organize lessons within assigned course units and modules.",
    mainWorkflow: [
      "Select the correct course unit and module.",
      "Create or open a lesson.",
      "Add objectives and content, then save and publish when ready.",
    ],
    actionKeys: ["tutor.lessons", "tutor.questionBank"],
  },
  {
    pattern: /^\/tutor\/questions/,
    pageTitle: "Question Bank",
    purpose:
      "The Question Bank stores reusable assessment questions for quizzes and professional examinations.",
    mainWorkflow: [
      "Create, import or review questions.",
      "Verify options, answers and explanations.",
      "Use selected questions in a quiz or examination.",
    ],
    actionKeys: ["tutor.questionBank", "tutor.examinations"],
  },
  {
    pattern: /^\/tutor\/examinations/,
    pageTitle: "Professional Examination Builder",
    purpose:
      "This workspace supports structured professional examinations with sections, questions, security and delivery settings.",
    mainWorkflow: [
      "Create or open an examination.",
      "Configure sections and examination settings.",
      "Add questions, preview the paper and publish when complete.",
    ],
    actionKeys: ["tutor.examinations", "tutor.questionBank"],
  },
  {
    pattern: /^\/tutor\/commerce/,
    pageTitle: "Tutor Commerce",
    purpose:
      "Tutor Commerce is used to manage marketplace products, coupons, orders, storefront activity and earnings.",
    mainWorkflow: [
      "Create or update a marketplace product.",
      "Publish eligible products and manage promotions.",
      "Review orders, fulfilment and wallet activity.",
    ],
    actionKeys: ["tutor.products", "tutor.coupons"],
  },
  {
    pattern: /^\/admin\/users/,
    pageTitle: "User Management",
    purpose:
      "Administrators use this page to review and manage user accounts and roles through approved workflows.",
    mainWorkflow: [
      "Search for the required user.",
      "Review the account status and role.",
      "Apply the authorized update and confirm the result.",
    ],
    actionKeys: ["admin.users"],
  },
  {
    pattern: /^\/admin\/programmes/,
    pageTitle: "Programme Management",
    purpose:
      "This page manages academic programmes and their relationship to course units and institutional structures.",
    mainWorkflow: [
      "Create or select a programme.",
      "Review its academic details.",
      "Manage linked course units and allocations.",
    ],
    actionKeys: ["admin.programmes"],
  },
  {
    pattern: /^\/help/,
    pageTitle: "Knowledge Center",
    purpose:
      "The Knowledge Center provides role-aware documentation, FAQs, troubleshooting and release guidance.",
    mainWorkflow: [
      "Search for a topic or browse a category.",
      "Open the relevant article.",
      "Use related articles or Medi for further guidance.",
    ],
    actionKeys: ["help.center"],
  },
];

export function resolveDocumentationPageContext(
  pathname: string,
): DocumentationPageContext {
  const context = contexts.find(({ pattern }) => pattern.test(pathname));

  return {
    pathname,
    pageTitle: context?.pageTitle ?? "Medical Elites LMS",
    purpose:
      context?.purpose ??
      "This is an authenticated Medical Elites LMS workspace. Use the available navigation and role-authorized actions to complete your task.",
    mainWorkflow:
      context?.mainWorkflow ?? [
        "Review the page title and available controls.",
        "Choose the action relevant to your role and task.",
        "Use the Knowledge Center or ask Medi when you need guidance.",
      ],
    actionKeys: context?.actionKeys ?? ["help.center"],
  };
}
