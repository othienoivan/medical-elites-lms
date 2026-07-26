import Button from "../ui/Button";

type Props = {
  hasPrevious: boolean;
  hasNext: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onSubmit: () => void;
};

export default function QuizNavigation({
  hasPrevious,
  hasNext,
  onPrevious,
  onNext,
  onSubmit,
}: Props) {
  return (
    <div className="flex justify-between border-t pt-6">
      <Button
        variant="outline"
        disabled={!hasPrevious}
        onClick={onPrevious}
      >
        Previous
      </Button>

      {hasNext ? (
        <Button onClick={onNext}>
          Next
        </Button>
      ) : (
        <Button onClick={onSubmit}>
          Submit Quiz
        </Button>
      )}
    </div>
  );
}