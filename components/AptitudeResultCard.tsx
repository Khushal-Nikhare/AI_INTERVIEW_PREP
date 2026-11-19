import { CheckCircle2, XCircle, MinusCircle, Lightbulb } from "lucide-react";

interface AptitudeResultCardProps {
  question: string;
  options: string[];
  userAnswer: string;
  correctAnswer: string;
  explanation: string;
  index: number;
}

const AptitudeResultCard = ({
  question,
  options,
  userAnswer,
  correctAnswer,
  explanation,
  index,
}: AptitudeResultCardProps) => {
  const isCorrect = userAnswer === correctAnswer;
  const isSkipped = !userAnswer;

  const cardBorder = isCorrect
    ? "border-emerald-500/30 bg-slate-900/70"
    : isSkipped
    ? "border-slate-800 bg-slate-900/50"
    : "border-red-500/30 bg-slate-900/70";

  return (
    <div className={`rounded-xl border p-6 flex flex-col gap-4 shadow-xs ${cardBorder}`}>
      {/* Question Header & Status Badge */}
      <div className="flex items-start justify-between gap-4">
        <h3 className="text-sm sm:text-base font-medium text-slate-100 leading-relaxed">
          <span className="text-slate-400 font-semibold mr-2">{index + 1}.</span>
          {question}
        </h3>

        <div className="shrink-0">
          {isCorrect ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold">
              <CheckCircle2 className="size-3.5" /> Correct
            </span>
          ) : isSkipped ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-800 text-slate-400 border border-slate-700 text-xs font-semibold">
              <MinusCircle className="size-3.5" /> Skipped
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 text-xs font-semibold">
              <XCircle className="size-3.5" /> Incorrect
            </span>
          )}
        </div>
      </div>

      {/* Options Matrix */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1">
        {options.map((option) => {
          const letter = option.charAt(0).toUpperCase();
          const isUserSelection = userAnswer === letter;
          const isActualCorrect = correctAnswer === letter;

          let optionStyle = "border-slate-800 bg-slate-900/40 text-slate-400";
          
          if (isActualCorrect) {
            optionStyle = "border-emerald-500/50 bg-emerald-500/10 text-emerald-300 font-medium";
          } else if (isUserSelection && !isActualCorrect) {
            optionStyle = "border-red-500/50 bg-red-500/10 text-red-300 font-medium";
          }

          return (
            <div
              key={option}
              className={`flex items-start gap-2.5 p-3 rounded-lg border text-xs sm:text-sm leading-relaxed ${optionStyle}`}
            >
              <span className="font-semibold">{letter}.</span>
              <span className="flex-1">{option.replace(/^[A-Za-z][.)]\s*/, "")}</span>
              {isActualCorrect && (
                <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400 px-1.5 py-0.5 rounded bg-emerald-500/20">
                  Correct
                </span>
              )}
              {isUserSelection && !isActualCorrect && (
                <span className="text-[10px] uppercase font-bold tracking-wider text-red-400 px-1.5 py-0.5 rounded bg-red-500/20">
                  Your Answer
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Structured Explanation Box */}
      {explanation && (
        <div className="mt-2 p-4 rounded-lg bg-slate-950/60 border border-slate-800/80 flex flex-col gap-1.5">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-400 uppercase tracking-wider">
            <Lightbulb className="size-3.5" />
            <span>Explanation & Solution</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {explanation}
          </p>
        </div>
      )}
    </div>
  );
};

export default AptitudeResultCard;
