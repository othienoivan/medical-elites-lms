export type OnlineExamQuestion = {
  number: number;
  section: string;
  prompt: string;
  options: Array<{ label: string; text: string }>;
  marks?: number;
};

function clean(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

export function parseOnlineExamination(source: string): OnlineExamQuestion[] {
  const normalized = source
    .replace(/\r/g, "")
    .replace(/\s*(SECTION\s+[A-Z]\s*:\s*.*?(?:\(\d+\s*MARKS\)|—\s*\d+\s*MARKS))\s*/gi, "\n$1\n")
    .replace(/([a-z0-9?)])([A-D])\.\s/g, "$1\n$2. ")
    .replace(/\s+(?=(?:[1-9]|[1-9]\d|1\d\d)\.\s)/g, "\n");
  const sectionMatches = [...normalized.matchAll(/SECTION\s+([A-Z])\s*:\s*([^\n]*)/gi)];
  const sectionFor = (offset: number) => {
    const match = sectionMatches.filter(item => (item.index ?? 0) <= offset).at(-1);
    return match ? `Section ${match[1]}: ${clean(match[2])}` : "Examination";
  };
  const numbered = [...normalized.matchAll(/(?:^|\n)(\d{1,3})\.\s+([\s\S]*?)(?=\n\d{1,3}\.\s+|\nSECTION\s+[A-Z]|$)/gi)];
  const questions: OnlineExamQuestion[] = numbered.map((match) => {
    const number = Number(match[1]);
    const body = clean(match[2]);
    const optionMarkers = [...body.matchAll(/(?:^|\s)([A-D])\.\s*/g)];
    const firstOption = optionMarkers[0]?.index ?? -1;
    const prompt = firstOption >= 0 ? clean(body.slice(0, firstOption)) : body;
    const marksMatch = body.match(/\((\d+)\s*marks?\)/i);
    return {
      number,
      section: sectionFor(match.index ?? 0),
      prompt,
      options: optionMarkers.map((item, optionIndex) => {
        const start = (item.index ?? 0) + item[0].length;
        const end = optionMarkers[optionIndex + 1]?.index ?? body.length;
        return { label: item[1], text: clean(body.slice(start, end)) };
      }),
      marks: marksMatch ? Number(marksMatch[1]) : undefined,
    };
  });

  // Some imported papers omit the number immediately after a new section.
  // Recover that block when the numbering jumps by exactly one (for example 32 → 34).
  for (let index = 1; index < numbered.length; index += 1) {
    const previous = Number(numbered[index - 1][1]);
    const current = Number(numbered[index][1]);
    if (current !== previous + 2) continue;
    const gapStart = (numbered[index - 1].index ?? 0) + numbered[index - 1][0].length;
    const gapEnd = numbered[index].index ?? gapStart;
    const gapSource = normalized.slice(gapStart, gapEnd);
    const instructionEnd = Math.max(gapSource.search(/Each question carries \d+ marks?\./i), gapSource.search(/Instructions?:/i));
    const afterInstructions = instructionEnd >= 0 ? gapSource.slice(gapSource.indexOf(".", instructionEnd) + 1) : gapSource;
    const gap = clean(afterInstructions.replace(/SECTION\s+[A-Z][^\n]*/gi, ""));
    if (gap.length > 40) questions.push({ number: previous + 1, section: sectionFor(gapEnd), prompt: gap, options: [] });
  }
  return questions.sort((a, b) => a.number - b.number);
}

