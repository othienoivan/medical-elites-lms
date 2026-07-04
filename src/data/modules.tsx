import type { Module } from "../models/Module";

export const courseModules: Module[] = [
  {
    id: "module-1",
    courseId: "1",
    title: "Introduction to Pathology",
    description:
      "Understand the meaning, scope, causes, mechanisms and clinical importance of pathology.",
    order: 1,
    duration: "1 Week",
    lessons: 1,
    passMark: 80,
    published: true,
  },

  {
    id: "module-2",
    courseId: "1",
    title: "Cell Injury and Cell Death",
    description:
      "Study reversible injury, irreversible injury, necrosis, apoptosis and cellular adaptation.",
    order: 2,
    duration: "1 Week",
    lessons: 1,
    passMark: 80,
    published: true,
  },

  {
    id: "module-3",
    courseId: "1",
    title: "Inflammation and Repair",
    description:
      "Learn acute inflammation, chronic inflammation, healing, repair and tissue regeneration.",
    order: 3,
    duration: "1 Week",
    lessons: 1,
    passMark: 80,
    published: true,
  },

  {
    id: "module-4",
    courseId: "1",
    title: "Neoplasia",
    description:
      "Understand tumour biology, benign and malignant tumours, grading, staging and metastasis.",
    order: 4,
    duration: "1 Week",
    lessons: 1,
    passMark: 80,
    published: true,
  },
];