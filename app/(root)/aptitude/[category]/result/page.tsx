import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/actions/auth.action";
import { getAptitudeResultsByUser } from "@/lib/actions/interview.action";
import { CATEGORY_META } from "@/components/AptitudeCard";
import AptitudeResultCard from "@/components/AptitudeResultCard";
import { Award, RotateCcw, ListChecks, CheckCircle2, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const AptitudeResultPage = async ({
  params,
  searchParams,
}: {
  params: Promise<{ category: string }>;
  searchParams: Promise<{ resultId?: string; score?: string; total?: string }>;
}) => {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  const { category } = await params;
  const { resultId, score: fallbackScore, total: fallbackTotal } = await searchParams;

  const meta = CATEGORY_META[category] || { label: category, icon: "📋" };

  let resultData: AptitudeResult | null = null;

  if (resultId) {
    const allResults = await getAptitudeResultsByUser(user.id);
    resultData = allResults.find((r) => r.id === resultId) || null;
  }

  const score = resultData ? resultData.score : Number(fallbackScore) || 0;
  const total = resultData ? resultData.totalQuestions : Number(fallbackTotal) || 20;
  const percentage = resultData ? resultData.percentage : Math.round((score / total) * 100);

  const getScoreAssessment = (pct: number) => {
    if (pct >= 90) return { text: "Outstanding Proficiency", desc: "Top tier performance across all core competencies." };
    if (pct >= 75) return { text: "Strong Mastery", desc: "Solid conceptual grasp with high accuracy." };
    if (pct >= 50) return { text: "Competent Baseline", desc: "Good foundation, targeted practice recommended." };
    return { text: "Development Required", desc: "Review foundational concepts and problem solving techniques." };
  };

  const assessment = getScoreAssessment(percentage);

  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto w-full">
      {/* ── Breadcrumb & Category Tag ── */}
      <div className="flex items-center justify-between">
        <Link
          href="/aptitude"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors"
        >
          <ChevronLeft className="size-4" />
          <span>Back to Assessment Hub</span>
        </Link>
        <span className="text-xs uppercase font-semibold tracking-wider text-slate-400 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800">
          {meta.label}
        </span>
      </div>

      {/* ── High-Impact Score Card ── */}
      <div className="rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-8 shadow-sm">
        <div className="flex flex-col gap-2 text-center md:text-left">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-blue-400 uppercase tracking-wider">
            <Award className="size-4" />
            <span>Official Examination Result</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            {assessment.text}
          </h1>

          <p className="text-xs sm:text-sm text-slate-400 max-w-md">
            {assessment.desc}
          </p>

          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-4">
            <Button asChild className="btn-primary" size="sm">
              <Link href={`/aptitude/${category}`} className="flex items-center gap-1.5">
                <RotateCcw className="size-3.5" />
                <span>Retake Examination</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="btn-secondary" size="sm">
              <Link href="/aptitude" className="flex items-center gap-1.5">
                <ListChecks className="size-3.5" />
                <span>All Categories</span>
              </Link>
            </Button>
          </div>
        </div>

        {/* Circular / Stat Pill */}
        <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-slate-950/80 border border-slate-800 min-w-48 text-center">
          <span className="text-xs uppercase font-medium text-slate-400 tracking-wider mb-1">
            Total Score
          </span>
          <div className="flex items-baseline gap-1">
            <span className={`text-5xl font-bold tracking-tight ${
              percentage >= 80 ? "text-emerald-400" : percentage >= 50 ? "text-amber-400" : "text-red-400"
            }`}>
              {score}
            </span>
            <span className="text-xl text-slate-500 font-medium">/{total}</span>
          </div>
          <span className={`mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
            percentage >= 80
              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
              : percentage >= 50
              ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
              : "bg-red-500/10 text-red-400 border-red-500/20"
          }`}>
            {percentage}% Accuracy
          </span>
        </div>
      </div>

      {/* ── Question Breakdown Stream ── */}
      {resultData && resultData.answers && resultData.answers.length > 0 && (
        <section className="flex flex-col gap-4 mt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ListChecks className="size-5 text-blue-400" />
              <h2 className="text-lg sm:text-xl font-semibold text-white tracking-tight">Question Analysis & Solutions</h2>
            </div>
            <span className="text-xs text-slate-400">
              {resultData.answers.filter((a) => a.isCorrect).length} Correct of {resultData.answers.length}
            </span>
          </div>
          
          <div className="flex flex-col gap-4">
            {resultData.answers[0].questionText ? (
              resultData.answers.map((ans, i) => (
                <AptitudeResultCard
                  key={i}
                  index={i}
                  question={ans.questionText || `Question ${i + 1}`}
                  options={ans.options || []}
                  userAnswer={ans.selected}
                  correctAnswer={ans.correct}
                  explanation={ans.explanation || ""}
                />
              ))
            ) : (
              <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-6 text-center">
                <p className="text-slate-400 text-sm italic">
                  Detailed question review is unavailable for this older attempt format.
                </p>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
};

export default AptitudeResultPage;
