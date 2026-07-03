export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export interface Quiz {
  id: string;
  moduleId: string;
  title: string;
  passMark: number;
  questions: QuizQuestion[];
}