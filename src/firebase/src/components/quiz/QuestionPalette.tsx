type Props = {
  total: number;
  current: number;
  answered: number[];
  flagged: number[];
  onSelect: (index: number) => void;
};

export default function QuestionPalette({
  total,
  current,
  answered,
  flagged,
  onSelect,
}: Props) {
  return (
    <div>
      <h2 className="text-xl font-bold">
        Questions
      </h2>

      <div className="mt-5 grid grid-cols-5 gap-3">
        {Array.from({ length: total }).map((_, index) => {
          const isCurrent = current === index;
          const isAnswered = answered.includes(index);
          const isFlagged = flagged.includes(index);

          let classes =
            "rounded-xl border p-3 text-sm font-bold transition ";

          if (isCurrent) {
            classes +=
              "bg-blue-700 text-white border-blue-700";
          } else if (isFlagged) {
            classes +=
              "bg-amber-100 border-amber-500 text-amber-900";
          } else if (isAnswered) {
            classes +=
              "bg-green-100 border-green-600 text-green-700";
          } else {
            classes +=
              "bg-white border-slate-300";
          }

          return (
            <button
              key={index}
              type="button"
              onClick={() => onSelect(index)}
              className={classes}
            >
              {index + 1}
            </button>
          );
        })}
      </div>
    </div>
  );
}