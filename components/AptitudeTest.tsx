"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { saveAptitudeResult } from "@/lib/actions/interview.action";
import { Clock, CheckCircle2, AlertTriangle, ArrowLeft, ArrowRight, Send, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AptitudeTestProps {
  questions: MCQQuestion[];
  category: string;
  userId: string;
  durationMinutes?: number;
}

const AptitudeTest = ({
  questions,
  category,
  userId,
  durationMinutes = 30,
}: AptitudeTestProps) => {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [secondsLeft, setSecondsLeft] = useState(durationMinutes * 60);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // ── Timer ───────────────────────────────────────────────────────
  useEffect(() => {
    if (secondsLeft <= 0) {
      handleSubmit(true);
      return;
    }
    const timer = setInterval(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secondsLeft]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };

  const timerBadgeStyle =
    secondsLeft < 300
      ? "text-red-400 bg-red-500/10 border-red-500/20"
      : secondsLeft < 600
      ? "text-amber-400 bg-amber-500/10 border-amber-500/20"
      : "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";

  // ── Answer Selection ────────────────────────────────────────────
  const selectAnswer = (questionId: string, option: string) => {
    const letter = option.charAt(0).toUpperCase();
    setAnswers((prev) => ({ ...prev, [questionId]: letter }));
  };

  // ── Submit ──────────────────────────────────────────────────────
  const handleSubmit = useCallback(
    async (_auto = false) => {
      if (isSubmitting) return;
      setIsSubmitting(true);
      setShowConfirm(false);

      const answerEntries: AptitudeAnswerEntry[] = questions.map((q) => ({
        questionId: q.id,
        selected: answers[q.id] ?? "",
        correct: q.correctAnswer,
        isCorrect: (answers[q.id] ?? "") === q.correctAnswer,
        questionText: q.question,
        options: q.options,
        explanation: q.explanation,
      }));

      const score = answerEntries.filter((a) => a.isCorrect).length;
      const percentage = Math.round((score / questions.length) * 100);

      const { success, resultId } = await saveAptitudeResult({
        userId,
        category,
        score,
        totalQuestions: questions.length,
        percentage,
        answers: answerEntries,
      });

      if (success && resultId) {
        router.push(`/aptitude/${category}/result?resultId=${resultId}`);
      } else {
        // Fallback for resilient routing
        router.push(
          `/aptitude/${category}/result?score=${score}&total=${questions.length}`
        );
      }
    },
    [answers, category, isSubmitting, questions, router, userId]
  );

  const currentQ = questions[currentIndex];
  const answeredCount = Object.keys(answers).length;
  const unansweredCount = questions.length - answeredCount;

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto w-full">
      {/* ── Top Status Bar ── */}
      <div className="flex items-center justify-between rounded-xl bg-slate-900/80 border border-slate-800 p-4 shadow-xs">
        <div className="flex items-center gap-3">
          <span className="text-xs sm:text-sm font-semibold text-slate-200">
            Question {currentIndex + 1} of {questions.length}
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <CheckCircle2 className="size-3" />
            <span>{answeredCount} Completed</span>
          </span>
        </div>

        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-mono font-bold ${timerBadgeStyle}`}>
          <Clock className="size-4" />
          <span>{formatTime(secondsLeft)}</span>
        </div>
      </div>

      {/* ── Question Navigator Grid ── */}
      <div className="rounded-xl bg-slate-900/40 border border-slate-800 p-3.5">
        <div className="flex flex-wrap gap-1.5 justify-center sm:justify-start">
          {questions.map((q, i) => {
            const isAnswered = !!answers[q.id];
            const isCurrent = i === currentIndex;
            return (
              <button
                key={q.id}
                onClick={() => setCurrentIndex(i)}
                className={`size-8 rounded-lg text-xs font-semibold transition-all duration-150 cursor-pointer ${
                  isCurrent
                    ? "bg-blue-600 text-white shadow-xs ring-2 ring-blue-500/40"
                    : isAnswered
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30"
                    : "bg-slate-800/80 text-slate-400 border border-slate-700/60 hover:bg-slate-800 hover:text-slate-200"
                }`}
              >
                {i + 1}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Active Question Card ── */}
      <div className="rounded-xl bg-slate-900/70 border border-slate-800 p-6 sm:p-8 flex flex-col gap-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <h2 className="text-base sm:text-lg font-medium text-slate-100 leading-relaxed">
            <span className="text-blue-400 font-semibold mr-2">{currentIndex + 1}.</span>
            {currentQ.question}
          </h2>
          <span className="shrink-0 text-[11px] uppercase tracking-wider font-semibold px-2.5 py-1 rounded-md bg-slate-800 border border-slate-700 text-slate-400">
            {currentQ.difficulty}
          </span>
        </div>

        {/* Options */}
        <div className="flex flex-col gap-3">
          {currentQ.options.map((option) => {
            const letter = option.charAt(0).toUpperCase();
            const isSelected = answers[currentQ.id] === letter;
            return (
              <button
                key={option}
                onClick={() => selectAnswer(currentQ.id, option)}
                className={`group flex items-start gap-3 text-left p-4 rounded-xl border transition-all duration-150 text-sm cursor-pointer ${
                  isSelected
                    ? "border-blue-500/80 bg-blue-500/10 text-white font-medium shadow-xs"
                    : "border-slate-800/80 bg-slate-900/40 text-slate-300 hover:border-slate-700 hover:bg-slate-850/60"
                }`}
              >
                <span className={`flex size-6 shrink-0 items-center justify-center rounded-md text-xs font-semibold border ${
                  isSelected
                    ? "bg-blue-600 border-blue-500 text-white"
                    : "bg-slate-800 border-slate-700 text-slate-400 group-hover:text-slate-200"
                }`}>
                  {letter}
                </span>
                <span className="flex-1 mt-0.5 leading-relaxed">
                  {option.replace(/^[A-Za-z][.)]\s*/, "")}
                </span>
                {isSelected && (
                  <Check className="size-4 text-blue-400 shrink-0 mt-1" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Navigation Footer Controls ── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <Button
          disabled={currentIndex === 0}
          onClick={() => setCurrentIndex((i) => i - 1)}
          variant="outline"
          className="btn-secondary w-full sm:w-auto"
        >
          <ArrowLeft className="size-4" />
          <span>Previous</span>
        </Button>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {currentIndex < questions.length - 1 ? (
            <>
              <Button
                onClick={() => setShowConfirm(true)}
                variant="outline"
                className="btn-secondary flex-1 sm:flex-initial"
              >
                <span>End Test</span>
              </Button>
              <Button
                onClick={() => setCurrentIndex((i) => i + 1)}
                className="btn-primary flex-1 sm:flex-initial"
              >
                <span>Next</span>
                <ArrowRight className="size-4" />
              </Button>
            </>
          ) : (
            <Button
              onClick={() => setShowConfirm(true)}
              className="btn-primary w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 border-emerald-500/30"
            >
              <Send className="size-4" />
              <span>Submit Examination</span>
            </Button>
          )}
        </div>
      </div>

      {/* ── Confirmation Modal Dialog ── */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 sm:p-8 max-w-md w-full flex flex-col gap-5 shadow-2xl animate-fadeIn">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
                <AlertTriangle className="size-5" />
              </div>
              <h3 className="text-lg font-semibold text-white">Submit Examination?</h3>
            </div>

            <p className="text-slate-300 text-sm leading-relaxed">
              You have completed <strong className="text-white">{answeredCount}</strong> of{" "}
              <strong className="text-white">{questions.length}</strong> questions.
              {unansweredCount > 0 && (
                <span className="block mt-2 text-amber-400 font-medium">
                  Note: {unansweredCount} question{unansweredCount > 1 ? "s remain" : " remains"} unanswered.
                </span>
              )}
            </p>

            <div className="flex items-center gap-3 pt-2">
              <Button
                onClick={() => setShowConfirm(false)}
                variant="outline"
                className="btn-secondary flex-1"
              >
                Review Answers
              </Button>
              <Button
                onClick={() => handleSubmit(false)}
                disabled={isSubmitting}
                className="btn-primary flex-1 bg-emerald-600 hover:bg-emerald-500 border-emerald-500/30"
              >
                {isSubmitting ? "Scoring..." : "Confirm & Submit"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AptitudeTest;
