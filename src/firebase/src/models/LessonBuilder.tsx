export type LessonBuilderBlockType =
  | "objective"
  | "section"
  | "resource";

export interface LessonBuilderObjectiveBlock {
  id: string;
  type: "objective";
  objective: string;
}

export interface LessonBuilderSectionBlock {
  id: string;
  type: "section";
  title: string;
  content: string;
}

export interface LessonBuilderResourceBlock {
  id: string;
  type: "resource";
  title: string;
  url: string;
}

export type LessonBuilderBlock =
  | LessonBuilderObjectiveBlock
  | LessonBuilderSectionBlock
  | LessonBuilderResourceBlock;