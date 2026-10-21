export type OnlineExamQuestion = {
  number: number;
  subpart?: string;
  section: string;
  prompt: string;
  options: Array<{ label: string; text: string }>;
  marks?: number;
};

export function onlineExamQuestionLabel(question: OnlineExamQuestion): string {
  return question.subpart ? `${question.number}.${question.subpart}` : String(question.number);
}

export function onlineExamAnswerKey(_question: OnlineExamQuestion, index: number): string {
  return `q_${index + 1}`;
}

function decodeHtmlEntities(value: string): string {
  return value
    .replace(/&#x([0-9a-f]+);/gi, (_match, hex: string) => String.fromCodePoint(Number.parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_match, decimal: string) => String.fromCodePoint(Number.parseInt(decimal, 10)))
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'");
}

function clean(value: string) {
  return decodeHtmlEntities(value).replace(/\s+/g, " ").trim();
}

type OptionMarker = { index: number; fullText: string; label: string };

function findSequentialOptionMarkers(value: string): OptionMarker[] {
  const candidates = [
    ...value.matchAll(/\(?([A-H])\)?\s*[.):\-]\s+/gi),
    ...value.matchAll(/(?<!\S)\(?([A-H])\)?(?=\s)\s*/gi),
  ]
    .map((match) => ({ index: match.index ?? 0, fullText: match[0], label: match[1].toUpperCase() }))
    .filter((candidate, index, rows) => rows.findIndex((row) => row.index === candidate.index && row.label === candidate.label) === index)
    .sort((a, b) => a.index - b.index);
  let best: OptionMarker[] = [];

  candidates.forEach((candidate, startIndex) => {
    if (candidate.label !== "A") return;
    const sequence: OptionMarker[] = [candidate];
    for (let index = startIndex + 1; index < candidates.length; index += 1) {
      const expected = String.fromCharCode(65 + sequence.length);
      if (candidates[index].label === expected) sequence.push(candidates[index]);
    }
    if (sequence.length > best.length) best = sequence;
  });

  return best.length >= 2 ? best : [];
}

const SECTION_PATTERN = /(?:^|\n)\s*(?:SECTION|PART)\s+([A-Z0-9]+)\s*[:.\-–—]?\s*([^\n]*)/gi;
const QUESTION_START = /(?:^|\n)\s*(?:Q(?:UESTION)?\s*)?(\d{1,3})\s*[.):\-]\s+/gi;

export function parseOnlineExamination(source: string): OnlineExamQuestion[] {
  if (!source.trim()) return [];

  const normalized = decodeHtmlEntities(source)
    .replace(/\r/g, "")
    .replace(/\u00a0/g, " ")
    .replace(/\s*((?:SECTION|PART)\s+[A-Z0-9]+\s*[:.\-–—]?)/gi, "\n$1")
    .replace(/([a-z0-9?).\]])\s+(?=(?:Q(?:UESTION)?\s*)?\d{1,3}\s*[.):\-]\s+)/gi, "$1\n")
    .replace(/([a-z0-9?)\]])\s+(?=\(?[A-H]\)?\s*[.):\-]\s+)/g, "$1\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  const sectionMatches = [...normalized.matchAll(SECTION_PATTERN)];
  const sectionFor = (offset: number) => {
    const match = sectionMatches.filter((item) => (item.index ?? 0) <= offset).at(-1);
    if (!match) return "Examination";
    const title = clean(match[2])
      .replace(/\s*\(?\d+(?:\.\d+)?\s*marks?\)?[\s\S]*$/i, "")
      .replace(/\s*(?:choose|select)\s+the\s+(?:single\s+)?best[\s\S]*$/i, "")
      .trim();
    return `Section ${match[1]}${title ? `: ${title}` : ""}`;
  };

  const starts = [...normalized.matchAll(QUESTION_START)];
  return starts.flatMap((match, index) => {
    const number = Number(match[1]);
    const start = (match.index ?? 0) + match[0].length;
    const end = starts[index + 1]?.index ?? normalized.length;
    const rawBody = normalized.slice(start, end)
      .replace(/\n\s*(?:SECTION|PART)\s+[A-Z0-9]+[\s\S]*$/i, "")
      .trim();
    const section = sectionFor(match.index ?? 0);
    const subpartPattern = /(?:^|\n|\s)\(?([a-h])\)?\s*[.):\-]\s+/g;
    const subpartMarkers = [...rawBody.matchAll(subpartPattern)];
    const sequentialSubparts = subpartMarkers.length >= 2
      && subpartMarkers[0][1] === "a"
      && subpartMarkers.every((item, itemIndex) => item[1].charCodeAt(0) === 97 + itemIndex);
    const isMultipleChoiceSection = /(?:multiple[ -]?choice|\bmcqs?\b)/i.test(section);

    if (sequentialSubparts && !isMultipleChoiceSection) {
      const firstSubpartOffset = subpartMarkers[0].index ?? 0;
      const sharedStem = clean(rawBody.slice(0, firstSubpartOffset).replace(/(?:\(|\[)?\d+(?:\.\d+)?\s*marks?(?:\)|\])?/gi, ""));
      return subpartMarkers.map((item, subpartIndex) => {
        const subpartStart = (item.index ?? 0) + item[0].length;
        const subpartEnd = subpartMarkers[subpartIndex + 1]?.index ?? rawBody.length;
        const partSource = rawBody.slice(subpartStart, subpartEnd).trim();
        const marksMatch = partSource.match(/(?:\(|\[)?(\d+(?:\.\d+)?)\s*marks?(?:\)|\])?/i);
        const partPrompt = clean(partSource.replace(/(?:\(|\[)?\d+(?:\.\d+)?\s*marks?(?:\)|\])?/gi, ""));
        return {
          number,
          subpart: item[1],
          section,
          prompt: clean([sharedStem, partPrompt].filter(Boolean).join(" ")),
          options: [],
          marks: marksMatch ? Number(marksMatch[1]) : undefined,
        };
      });
    }

    const optionMarkers = findSequentialOptionMarkers(rawBody);
    const firstOption = optionMarkers[0]?.index ?? -1;
    const promptSource = firstOption >= 0 ? rawBody.slice(0, firstOption) : rawBody;
    const marksMatch = promptSource.match(/(?:\(|\[)?(\d+(?:\.\d+)?)\s*marks?(?:\)|\])?/i);
    const prompt = clean(promptSource.replace(/(?:\(|\[)?\d+(?:\.\d+)?\s*marks?(?:\)|\])?/gi, ""));

    return {
      number,
      section,
      prompt,
      options: optionMarkers.map((item, optionIndex) => {
        const optionStart = item.index + item.fullText.length;
        const optionEnd = optionMarkers[optionIndex + 1]?.index ?? rawBody.length;
        return { label: item.label, text: clean(rawBody.slice(optionStart, optionEnd)) };
      }),
      marks: marksMatch ? Number(marksMatch[1]) : undefined,
    };
  }).filter((question) => question.prompt.length > 0);
}
