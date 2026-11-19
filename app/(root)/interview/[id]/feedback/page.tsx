import dayjs from "dayjs";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  getFeedbackByInterviewId,
  getInterviewById,
} from "@/lib/actions/interview.action";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/actions/auth.action";
import { Award, Calendar, CheckCircle2, ChevronLeft, Layers, ThumbsUp, AlertCircle, ArrowRight, RotateCcw } from "lucide-react";

const Feedback = async ({ params }: RouteParams) => {
  const { id } = await params;
  const user = await getCurrentUser();

  const interview = await getInterviewById(id);
  if (!interview) redirect("/");

  const feedback = await getFeedbackByInterviewId({
    interviewId: id,
    userId: user?.id || "",
  });

  const totalScore = feedback?.totalScore ?? 0;

  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto w-full">
      {/* ── Breadcrumb Navigation ── */}
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors"
        >
          <ChevronLeft className="size-4" />
          <span>Back to Dashboard</span>
        </Link>
        <span className="text-xs uppercase font-semibold tracking-wider text-slate-400 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800">
          {interview.role} Evaluation
        </span>
      </div>

      {/* ── Overall Assessment Hero Card ── */}
      <div className="rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-8 shadow-sm">
        <div className="flex flex-col gap-2.5 text-center md:text-left">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-blue-400 uppercase tracking-wider">
            <Award className="size-4" />
            <span>AI Performance Assessment</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight capitalize">
            {interview.role} Interview Evaluation
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 max-w-lg leading-relaxed mt-1">
            {feedback?.finalAssessment || "Comprehensive evaluation across technical expertise, communication clarity, and problem solving."}
          </p>

          <div className="flex items-center gap-2 mt-3 text-xs text-slate-400">
            <Calendar className="size-3.5 text-slate-500" />
            <span>
              {feedback?.createdAt
                ? dayjs(feedback.createdAt).format("MMMM D, YYYY [at] h:mm A")
                : "Recent Session"}
            </span>
          </div>
        </div>

        {/* Total Score Badge */}
        <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-slate-950/80 border border-slate-800 min-w-48 text-center">
          <span className="text-xs uppercase font-medium text-slate-400 tracking-wider mb-1">
            Overall Score
          </span>
          <div className="flex items-baseline gap-1">
            <span className={`text-5xl font-bold tracking-tight ${
              totalScore >= 80 ? "text-emerald-400" : totalScore >= 60 ? "text-amber-400" : "text-red-400"
            }`}>
              {totalScore}
            </span>
            <span className="text-xl text-slate-500 font-medium">/100</span>
          </div>
          <span className={`mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
            totalScore >= 80
              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
              : totalScore >= 60
              ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
              : "bg-red-500/10 text-red-400 border-red-500/20"
          }`}>
            {totalScore >= 80 ? "Interview Ready" : totalScore >= 60 ? "Proficient" : "Needs Revision"}
          </span>
        </div>
      </div>

      {/* ── Category Breakdown Grid ── */}
      {feedback?.categoryScores && feedback.categoryScores.length > 0 && (
        <section className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Layers className="size-5 text-blue-400" />
            <h2 className="text-lg sm:text-xl font-semibold text-white tracking-tight">Competency Breakdown</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {feedback.categoryScores.map((cat, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 flex flex-col justify-between gap-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-sm font-semibold text-white">{cat.name}</h3>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold border ${
                    cat.score >= 80
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                      : cat.score >= 60
                      ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                      : "bg-red-500/10 text-red-400 border-red-500/20"
                  }`}>
                    {cat.score}/100
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{cat.comment}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Strengths & Areas for Improvement ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Strengths */}
        <div className="rounded-xl border border-emerald-500/20 bg-slate-900/60 p-6 flex flex-col gap-4">
          <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
            <ThumbsUp className="size-4" />
            <span>Demonstrated Strengths</span>
          </div>
          <ul className="flex flex-col gap-2.5">
            {feedback?.strengths?.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-300 leading-relaxed">
                <CheckCircle2 className="size-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Areas for Improvement */}
        <div className="rounded-xl border border-amber-500/20 bg-slate-900/60 p-6 flex flex-col gap-4">
          <div className="flex items-center gap-2 text-amber-400 font-semibold text-sm">
            <AlertCircle className="size-4" />
            <span>Areas for Improvement</span>
          </div>
          <ul className="flex flex-col gap-2.5">
            {feedback?.areasForImprovement?.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-300 leading-relaxed">
                <span className="flex size-4 rounded-full bg-amber-500/20 text-amber-400 items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                  !
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* ── Action Footers ── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-800">
        <Button asChild variant="outline" className="btn-secondary w-full sm:w-auto">
          <Link href="/">Return to Dashboard</Link>
        </Button>

        <Button asChild className="btn-primary w-full sm:w-auto">
          <Link href={`/interview/${id}`} className="flex items-center gap-2">
            <RotateCcw className="size-4" />
            <span>Retake This Interview</span>
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default Feedback;
