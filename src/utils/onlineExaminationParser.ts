export type OnlineExamQuestion = {
  number: number;
  section: string;
  prompt: string;
  options: Array<{ label: string; text: string }>;
  marks?: number;
};

export function onlineExamAnswerKey(_question: OnlineExamQuestion, index: number): string {
  return `q_${index + 1}`;
}

function clean(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

const SECTION_PATTERN = /(?:^|\n)\s*(?:SECTION|PART)\s+([A-Z0-9]+)\s*[:.\-–—]?\s*([^\n]*)/gi;
const QUESTION_START = /(?:^|\n)\s*(?:Q(?:UESTION)?\s*)?(\d{1,3})\s*[.):\-]\s+/gi;

export function parseOnlineExamination(source: string): OnlineExamQuestion[] {
  if (!source.trim()) return [];

  const normalized = source
    .replace(/\r/g, "")
    .replace(/\u00a0/g, " ")
    .replace(/\s*((?:SECTION|PART)\s+[A-Z0-9]+\s*[:.\-–—]?)/gi, "\n$1")
    .replace(/([a-z0-9?)\]])\s+(?=(?:Q(?:UESTION)?\s*)?\d{1,3}\s*[.):\-]\s+)/gi, "$1\n")
    .replace(/([a-z0-9?)\]])\s+(?=\(?[A-H]\)?\s*[.):\-]\s+)/g, "$1\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  const sectionMatches = [...normalized.matchAll(SECTION_PATTERN)];
  const sectionFor = (offset: number) => {
    const match = sectionMatches.filter((item) => (item.index ?? 0) <= offset).at(-1);
    return match
      ? `Section ${match[1]}: ${clean(match[2]).replace(/\s*\(?(?:\d+\s*)?marks?\)?\s*$/i, "")}`.replace(/:\s*$/, "")
      : "Examination";
  };

  const starts = [...normalized.matchAll(QUESTION_START)];
  return starts.map((match, index) => {
    const number = Number(match[1]);
    const start = (match.index ?? 0) + match[0].length;
    const end = starts[index + 1]?.index ?? normalized.length;
    const rawBody = normalized.slice(start, end)
      .replace(/\n\s*(?:SECTION|PART)\s+[A-Z0-9]+[\s\S]*$/i, "")
      .trim();
    const optionPattern = /(?:^|\s)\(?([A-H])\)?\s*[.):\-]\s+/g;
    const optionMarkers = [...rawBody.matchAll(optionPattern)];
    const firstOption = optionMarkers[0]?.index ?? -1;
    const promptSource = firstOption >= 0 ? rawBody.slice(0, firstOption) : rawBody;
    const marksMatch = promptSource.match(/(?:\(|\[)?(\d+(?:\.\d+)?)\s*marks?(?:\)|\])?/i);
    const prompt = clean(promptSource.replace(/(?:\(|\[)?\d+(?:\.\d+)?\s*marks?(?:\)|\])?/gi, ""));

    return {
      number,
      section: sectionFor(match.index ?? 0),
      prompt,
      options: optionMarkers.map((item, optionIndex) => {
        const optionStart = (item.index ?? 0) + item[0].length;
        const optionEnd = optionMarkers[optionIndex + 1]?.index ?? rawBody.length;
        return { label: item[1].toUpperCase(), text: clean(rawBody.slice(optionStart, optionEnd)) };
      }),
      marks: marksMatch ? Number(marksMatch[1]) : undefined,
    };
  }).filter((question) => question.prompt.length > 0);
}
