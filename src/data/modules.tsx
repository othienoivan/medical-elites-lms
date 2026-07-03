import type { CourseModule } from "../models/Module";

export const courseModules: CourseModule[] = [
  {
    id: "module-1",
    courseId: "1",
    title: "Introduction to Pathology",
    description:
      "Understand the meaning, scope, causes, mechanisms, and clinical importance of pathology.",
    order: 1,
    passMark: 80,
    isLockedByDefault: false,
    isPublished: true,
  },
  {
    id: "module-2",
    courseId: "1",
    title: "Cell Injury and Cell Death",
    description:
      "Study reversible injury, irreversible injury, necrosis, apoptosis, and cellular adaptation.",
    order: 2,
    passMark: 80,
    isLockedByDefault: true,
    isPublished: true,
  },
  {
    id: "module-3",
    courseId: "1",
    title: "Inflammation and Repair",
    description:
      "Learn acute inflammation, chronic inflammation, healing, repair, and tissue regeneration.",
    order: 3,
    passMark: 80,
    isLockedByDefault: true,
    isPublished: true,
  },
  {
    id: "module-4",
    courseId: "1",
    title: "Neoplasia",
    description:
      "Understand tumor biology, benign and malignant tumors, grading, staging, and spread.",
    order: 4,
    passMark: 80,
    isLockedByDefault: true,
    isPublished: true,
  },
];