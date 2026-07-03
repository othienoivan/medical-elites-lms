import type { Lesson } from "../models/Lesson";

export const lessons: Lesson[] = [
  {
    id: "lesson-1",
    moduleId: "module-1",
    title: "Introduction to Pathology",
    description:
      "This lesson introduces the meaning, scope, causes, mechanisms, and clinical importance of pathology.",
    order: 1,
    estimatedMinutes: 45,
    isPublished: true,
    notesUrl: "",
    quizId: "quiz-module-1",
    videos: [
      {
        id: "video-1",
        title: "Introduction to Pathology Video Lecture",
        type: "youtube",
        url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        durationMinutes: 10,
        required: false,
      },
    ],
    slides: [
      {
        id: "slide-1",
        title: "Learning Outcomes",
        order: 1,
        content:
          "By the end of this module unit, the learner should be able to explain the background of pathology, identify causes of disease, discuss pathogenesis, and describe specimens used in pathology.",
      },
      {
        id: "slide-2",
        title: "Definition of Pathology",
        order: 2,
        content:
          "Pathology is the scientific study of disease. It explains disease by studying etiology, pathogenesis, morphologic changes, functional derangements, and clinical significance.",
      },
      {
        id: "slide-3",
        title: "Etiology",
        order: 3,
        content:
          "Etiology means the cause of disease. Causes may be congenital or acquired, including infectious, nutritional, chemical, physical, immunological, and genetic factors.",
      },
      {
        id: "slide-4",
        title: "Pathogenesis",
        order: 4,
        content:
          "Pathogenesis refers to the mechanism through which the cause of disease produces pathological and clinical manifestations.",
      },
      {
        id: "slide-5",
        title: "Morphologic Changes",
        order: 5,
        content:
          "Morphologic changes are structural alterations in cells or tissues. They may be gross, visible to the naked eye, or microscopic, visible under the microscope.",
      },
      {
        id: "slide-6",
        title: "Clinical Significance",
        order: 6,
        content:
          "Morphologic changes influence organ function and determine the clinical features, course, and prognosis of disease.",
      },
    ],
  },
];