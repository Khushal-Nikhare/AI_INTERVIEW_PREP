import Link from "next/link";
import dayjs from "dayjs";
import { Clock, HelpCircle, RotateCcw, ArrowRight, Award } from "lucide-react";

const CATEGORY_META: Record<
  string,
  { label: string; icon: string; accentBorder: string; badge: string; description: string }
> = {
  quantitative: {
    label: "Quantitative Aptitude",
    icon: "🔢",
    accentBorder: "border-blue-500/20 hover:border-blue-500/50",
    badge: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    description: "Arithmetic, percentages, ratios, probability, time-speed-distance, and algebraic formulations.",
  },
  logical_reasoning: {
    label: "Logical Reasoning",
    icon: "🧩",
    accentBorder: "border-purple-500/20 hover:border-purple-500/50",
    badge: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    description: "Number series, analogies, deductive syllogisms, pattern matching, coding-decoding, and blood relations.",
  },
  verbal_ability: {
    label: "Verbal Ability",
    icon: "📝",
    accentBorder: "border-emerald-500/20 hover:border-emerald-500/50",
    badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    description: "Reading comprehension, sentence completion, vocabulary, contextual antonyms, and error identification.",
  },
};

interface AptitudeCardProps {
  category: string;
  bestScore?: number;
  lastAttempted?: string;
  totalAttempts?: number;
}

const AptitudeCard = ({
  category,
  bestScore,
  lastAttempted,
  totalAttempts = 0,
}: AptitudeCardProps) => {
  const meta = CATEGORY_META[category] ?? {
    label: category,
    icon: "📋",
    accentBorder: "border-slate-800 hover:border-slate-700",
    badge: "bg-slate-500/10 text-slate-400 border-slate-500/20",
    description: "Timed multiple-choice evaluation.",
  };

  return (
    <div
      className={`group relative flex flex-col justify-between rounded-xl bg-slate-900/60 border ${meta.accentBorder} p-6 shadow-xs transition-all duration-200 hover:bg-slate-900/90`}
    >
      <div>
        {/* Header: Icon + Best Score */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex size-12 items-center justify-center rounded-xl bg-slate-800 border border-slate-700/60 text-2xl shadow-xs">
            {meta.icon}
          </div>

          {bestScore !== undefined && bestScore > 0 ? (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Award className="size-3.5" />
              <span>Best: {bestScore}/20</span>
            </div>
          ) : (
            <span className="text-xs text-slate-500 font-medium">Not attempted</span>
          )}
        </div>

        {/* Title & Description */}
        <h3 className="text-base sm:text-lg font-semibold text-white tracking-tight group-hover:text-blue-400 transition-colors">
          {meta.label}
        </h3>
        <p className="mt-2 text-xs sm:text-sm text-slate-400 leading-relaxed line-clamp-3">
          {meta.description}
        </p>

        {/* Stats strip */}
        <div className="flex flex-wrap items-center gap-3 mt-5 pt-4 border-t border-slate-800/80 text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <HelpCircle className="size-3.5 text-slate-500" />
            <span>20 Questions</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-1.5">
            <Clock className="size-3.5 text-slate-500" />
            <span>30 Min</span>
          </div>
          {totalAttempts > 0 && (
            <>
              <span>•</span>
              <div className="flex items-center gap-1.5">
                <RotateCcw className="size-3.5 text-slate-500" />
                <span>{totalAttempts} {totalAttempts === 1 ? "attempt" : "attempts"}</span>
              </div>
            </>
          )}
        </div>

        {lastAttempted && (
          <p className="mt-2 text-[11px] text-slate-500">
            Last active: {dayjs(lastAttempted).format("MMM D, YYYY")}
          </p>
        )}
      </div>

      {/* Action CTA */}
      <div className="mt-6 pt-2">
        <Link
          href={`/aptitude/${category}`}
          className="w-full btn-primary text-center text-xs sm:text-sm py-2 px-4 rounded-lg flex items-center justify-center gap-2"
        >
          <span>{totalAttempts > 0 ? "Retake Test" : "Start Test"}</span>
          <ArrowRight className="size-3.5" />
        </Link>
      </div>
    </div>
  );
};

export default AptitudeCard;
export { CATEGORY_META };
