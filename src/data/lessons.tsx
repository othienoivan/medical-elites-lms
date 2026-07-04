import type { Lesson } from "../models/Lesson";

export const lessons: Lesson[] = [
  {
    id: "lesson-1",
    courseId: "1",
    moduleId: "module-1",
    title: "Introduction to Pathology",
    description:
      "This lesson introduces the meaning, scope, causes, mechanisms, and clinical importance of pathology.",
    order: 1,
    estimatedMinutes: 45,
    notesUrl: "",
    quizId: "quiz-module-1",
    published: true,
    version: 1,
    createdBy: "system",

    completionCriteria: {
      watchVideos: false,
      completeKnowledgeChecks: true,
      passQuiz: true,
    },

    learningObjectives: [
      "Explain the background and meaning of pathology.",
      "Identify major causes of disease.",
      "Describe the concept of pathogenesis.",
      "Explain morphologic changes and clinical significance.",
      "Describe diagnostic techniques used in pathology.",
    ],

    sections: [
      {
        id: "section-1",
        title: "Learning Outcomes",
        order: 1,
        slides: [
          {
            id: "slide-1",
            title: "Learning Outcomes",
            order: 1,
            content:
              "By the end of this module unit, the learner should be able to explain the background of pathology, identify causes of disease, discuss pathogenesis, and describe specimens used in pathology.",
          },
        ],
        videos: [],
        clinicalPearl:
          "Clear learning outcomes help both the tutor and learner focus on what must be achieved by the end of the lesson.",
      },
      {
        id: "section-2",
        title: "Definition and Scope of Pathology",
        order: 2,
        slides: [
          {
            id: "slide-2",
            title: "Definition of Pathology",
            order: 1,
            content:
              "Pathology is the scientific study of disease. It explains disease by studying etiology, pathogenesis, morphologic changes, functional derangements, and clinical significance.",
          },
          {
            id: "slide-3",
            title: "Scope of Pathology",
            order: 2,
            content:
              "Pathology is the foundation of medical science and practice. It helps healthcare workers understand disease mechanisms, diagnosis, treatment, and prognosis.",
          },
        ],
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
        clinicalPearl:
          "Clinical medicine cannot be practiced scientifically without understanding pathology.",
        knowledgeChecks: [
          {
            id: "kc-1",
            question: "Pathology is best defined as:",
            options: [
              "The study of drugs",
              "The scientific study of disease",
              "The study of normal body structure",
              "The study of hospital management",
            ],
            correctAnswer: "The scientific study of disease",
            explanation:
              "Pathology is the scientific study of disease, including its causes, mechanisms, structural changes, and clinical consequences.",
          },
        ],
      },
      {
        id: "section-3",
        title: "Etiology and Pathogenesis",
        order: 3,
        slides: [
          {
            id: "slide-4",
            title: "Etiology",
            order: 1,
            content:
              "Etiology means the cause of disease. Causes may be congenital or acquired, including infectious, nutritional, chemical, physical, immunological, and genetic factors.",
          },
          {
            id: "slide-5",
            title: "Pathogenesis",
            order: 2,
            content:
              "Pathogenesis refers to the mechanism through which the cause of disease produces pathological and clinical manifestations.",
          },
        ],
        videos: [],
        clinicalPearl:
          "Etiology tells us what caused the disease; pathogenesis explains how the disease develops.",
        caseScenario:
          "A patient develops liver damage after taking excessive paracetamol. The etiologic factor is the toxic drug exposure, while the pathogenesis involves biochemical injury to liver cells.",
        knowledgeChecks: [
          {
            id: "kc-2",
            question: "Pathogenesis refers to:",
            options: [
              "The cause of disease",
              "The mechanism through which disease develops",
              "The treatment of disease",
              "The final outcome of disease",
            ],
            correctAnswer: "The mechanism through which disease develops",
            explanation:
              "Pathogenesis explains how an etiologic factor produces disease and clinical manifestations.",
          },
        ],
      },
      {
        id: "section-4",
        title: "Morphologic Changes and Clinical Significance",
        order: 4,
        slides: [
          {
            id: "slide-6",
            title: "Morphologic Changes",
            order: 1,
            content:
              "Morphologic changes are structural alterations in cells or tissues. They may be gross, visible to the naked eye, or microscopic, visible under the microscope.",
          },
          {
            id: "slide-7",
            title: "Clinical Significance",
            order: 2,
            content:
              "Morphologic changes influence organ function and determine the clinical features, course, and prognosis of disease.",
          },
        ],
        videos: [],
        clinicalPearl:
          "Structural changes often explain the symptoms and signs observed in patients.",
      },
      {
        id: "section-5",
        title: "Diagnostic Techniques in Pathology",
        order: 5,
        slides: [
          {
            id: "slide-8",
            title: "Diagnostic Techniques",
            order: 1,
            content:
              "Diagnostic techniques in pathology include histopathology, cytopathology, hematology, microbiology, immunohistochemistry, biochemical examination, molecular techniques, and autopsy.",
          },
          {
            id: "slide-9",
            title: "Histopathology",
            order: 2,
            content:
              "Histopathology involves microscopic examination of tissues and is usually considered the gold standard for many pathologic diagnoses.",
          },
        ],
        videos: [],
        clinicalPearl:
          "Histopathology is often the definitive method for diagnosing many tumors and tissue diseases.",
      },
    ],
  },
];