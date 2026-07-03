import type { Quiz } from "../models/Quiz";

export const quizzes: Quiz[] = [
  {
    id: "quiz-module-1",
    moduleId: "module-1",
    title: "Introduction to Pathology Quiz",
    passMark: 80,
    questions: [
      {
        id: "q1",
        question: "Pathology is best defined as:",
        options: [
          "The study of drugs",
          "The scientific study of disease",
          "The study of normal anatomy",
          "The treatment of patients",
        ],
        correctAnswer: "The scientific study of disease",
        explanation:
          "Pathology is the scientific study of disease, including causes, mechanisms, structural changes, and clinical consequences.",
      },
      {
        id: "q2",
        question: "Etiology refers to:",
        options: [
          "The cause of disease",
          "The treatment of disease",
          "The symptoms of disease",
          "The prognosis of disease",
        ],
        correctAnswer: "The cause of disease",
        explanation: "Etiology means the cause or origin of a disease.",
      },
      {
        id: "q3",
        question: "Pathogenesis means:",
        options: [
          "The outcome of disease",
          "The mechanism through which disease develops",
          "The prevention of disease",
          "The legal classification of disease",
        ],
        correctAnswer: "The mechanism through which disease develops",
        explanation:
          "Pathogenesis explains how the cause produces pathological and clinical manifestations.",
      },
      {
        id: "q4",
        question: "Morphologic changes refer to:",
        options: [
          "Changes in drug action",
          "Structural alterations in cells or tissues",
          "Changes in hospital records",
          "Emotional reactions to disease",
        ],
        correctAnswer: "Structural alterations in cells or tissues",
        explanation:
          "Morphologic changes are structural changes that occur in cells or tissues during disease.",
      },
      {
        id: "q5",
        question: "The routine stain commonly used in histopathology is:",
        options: [
          "Gram stain",
          "Hematoxylin and Eosin",
          "Ziehl-Neelsen stain",
          "India ink",
        ],
        correctAnswer: "Hematoxylin and Eosin",
        explanation:
          "Hematoxylin and Eosin, commonly abbreviated H&E, is routinely used in histopathology.",
      },
    ],
  },
];