import type { DocumentationRole } from "../../knowledge";
import type { DeterministicCopilotAnswer } from "../domain/copilot-models";

interface DeterministicAnswerRule {
  roles: Array<Exclude<DocumentationRole, null>>;
  patterns: RegExp[];
  result: DeterministicCopilotAnswer;
}

const rules: DeterministicAnswerRule[] = [
  {
    roles: ["student"],
    patterns: [
      /where (are|is) my purchased (course|courses|content|products)/i,
      /find my purchased (course|courses|content|products)/i,
      /open my (learning )?library/i,
    ],
    result: {
      answer:
        "Your purchased courses and learning products are available in My Learning Library. Open Student → My Library, or use the Open My Library button below. If an item is missing, open My Purchases and confirm that the order status is Fulfilled; fulfilled purchases are added to your library automatically.",
      actionKeys: [
        "student.library",
        "student.purchases",
        "student.marketplace",
      ],
      articleSlugs: ["using-my-learning-library", "marketplace-purchases"],
    },
  },
  {
    roles: ["student"],
    patterns: [/where (are|is) my purchases/i, /order history/i],
    result: {
      answer:
        "Open My Purchases to review your marketplace orders, payment status and fulfilment status. A fulfilled order should also appear in My Learning Library.",
      actionKeys: ["student.purchases", "student.library"],
    },
  },
  {
    roles: ["tutor", "admin"],
    patterns: [/how (do|can) i create a quiz/i, /create quiz/i],
    result: {
      answer:
        "To create a quiz, open the tutor assessment workspace, create the quiz, configure its instructions, pass mark and attempt limit, then add questions from the Question Bank before publishing it.",
      actionKeys: ["tutor.questionBank", "tutor.examinations"],
    },
  },
  {
    roles: ["tutor", "admin"],
    patterns: [/how (do|can) i create a coupon/i, /create coupon/i],
    result: {
      answer:
        "Open Tutor Commerce → Coupons, create a coupon, select the discount type and value, define its validity period and eligible products, then activate it when ready.",
      actionKeys: ["tutor.coupons", "tutor.products"],
    },
  },
  {
    roles: ["admin"],
    patterns: [/how (do|can) i manage users/i, /assign.*role/i],
    result: {
      answer:
        "Open User Management to review accounts and roles. Use the normal administrator workflow for role changes; Medi provides guidance but does not modify accounts directly.",
      actionKeys: ["admin.users", "help.center"],
    },
  },
];

export const DeterministicAnswerService = {
  resolve(
    prompt: string,
    role: DocumentationRole,
  ): DeterministicCopilotAnswer | null {
    if (!role) {
      return null;
    }

    const match = rules.find(
      (rule) =>
        rule.roles.includes(role) &&
        rule.patterns.some((pattern) => pattern.test(prompt)),
    );

    return match?.result ?? null;
  },
};
