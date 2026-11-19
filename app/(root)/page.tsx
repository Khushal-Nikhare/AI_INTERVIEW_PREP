import InterviewCard from "@/components/InterviewCard";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/actions/auth.action";
import {
  getInterviewsByUserId,
  getLatestInterviews,
  getAptitudeResultsByUser,
  getFeedbackMapByUserId,
} from "@/lib/actions/interview.action";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { Sparkles, CheckSquare, PlusCircle, ArrowRight, TrendingUp, Layers, History } from "lucide-react";

const Page = async () => {
  const user = await getCurrentUser();
  const userId = user?.id;

  const [userInterviews, allInterview, aptitudeResults, userFeedbackMap] = await Promise.all([
    getInterviewsByUserId(userId ?? ""),
    getLatestInterviews({ userId: userId ?? "" }),
    userId ? getAptitudeResultsByUser(userId) : Promise.resolve([]),
    userId ? getFeedbackMapByUserId(userId) : Promise.resolve({} as Record<string, Feedback>),
  ]);

  const hasPastInterviews = (userInterviews?.length ?? 0) > 0;
  const hasUpcomingInterviews = (allInterview?.length ?? 0) > 0;

  return (
    <div className="flex flex-col gap-10">
      {/* ── Hero Platform Banner ── */}
      <section className="relative overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900/90 to-blue-950/40 p-6 sm:p-10 shadow-sm">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 z-10 relative">
          <div className="flex flex-col gap-4 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium w-fit">
              <Sparkles className="size-3.5" />
              <span>Next-Gen Technical & Aptitude Training</span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white leading-tight">
              Master Your Next Tech Interview with Real-Time AI Feedback
            </h1>
            
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Experience conversational voice interviews powered by voice AI, instant structured evaluations, and timed aptitude tests.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button asChild className="btn-primary">
                <Link href="/interview" className="flex items-center gap-2">
                  <Sparkles className="size-4" />
                  <span>Start AI Interview</span>
                </Link>
              </Button>

              <Button asChild variant="outline" className="btn-secondary">
                <Link href="/aptitude" className="flex items-center gap-2">
                  <CheckSquare className="size-4" />
                  <span>Take Aptitude Test</span>
                </Link>
              </Button>

              <Button asChild variant="outline" className="btn-secondary">
                <Link href="/interview/create" className="flex items-center gap-2">
                  <PlusCircle className="size-4" />
                  <span>Create Custom</span>
                </Link>
              </Button>
            </div>
          </div>

          <div className="hidden lg:flex items-center justify-center p-4">
            <div className="relative size-64 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-blue-500/10 blur-2xl" />
              <Image
                src="/robot.png"
                alt="AI Interviewer"
                width={260}
                height={260}
                className="relative z-10 drop-shadow-xl object-contain"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── User's Interviews Section ── */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="size-5 text-blue-400" />
            <h2 className="text-lg sm:text-xl font-semibold text-white tracking-tight">Your Interviews</h2>
          </div>
          {hasPastInterviews && (
            <span className="text-xs text-slate-400 font-medium">
              {userInterviews?.length} session{userInterviews?.length === 1 ? "" : "s"}
            </span>
          )}
        </div>

        {hasPastInterviews ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {userInterviews?.map((interview) => (
              <InterviewCard
                key={interview.id}
                userId={user?.id}
                interviewId={interview.id}
                role={interview.role}
                type={interview.type}
                techstack={interview.techstack}
                createdAt={interview.createdAt}
                feedback={userFeedbackMap[interview.id] ?? null}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-8 rounded-xl border border-dashed border-slate-800 bg-slate-900/30 text-center">
            <p className="text-slate-400 text-sm">You haven&apos;t taken any mock interviews yet.</p>
            <Button asChild className="btn-primary mt-4" size="sm">
              <Link href="/interview">Launch First Interview</Link>
            </Button>
          </div>
        )}
      </section>

      {/* ── Community / Available Interviews Section ── */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="size-5 text-emerald-400" />
            <h2 className="text-lg sm:text-xl font-semibold text-white tracking-tight">Available Mock Interviews</h2>
          </div>
        </div>

        {hasUpcomingInterviews ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {allInterview?.map((interview) => (
              <InterviewCard
                key={interview.id}
                userId={user?.id}
                interviewId={interview.id}
                role={interview.role}
                type={interview.type}
                techstack={interview.techstack}
                createdAt={interview.createdAt}
                feedback={userFeedbackMap[interview.id] ?? null}
              />
            ))}
          </div>
        ) : (
          <div className="p-6 rounded-xl border border-slate-800/80 bg-slate-900/30 text-center">
            <p className="text-slate-400 text-sm">No community templates available at this moment.</p>
          </div>
        )}
      </section>

      {/* ── Aptitude Performance Summary ── */}
      {aptitudeResults && aptitudeResults.length > 0 && (
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="size-5 text-indigo-400" />
              <h2 className="text-lg sm:text-xl font-semibold text-white tracking-tight">Recent Aptitude Tests</h2>
            </div>
            <Link
              href="/aptitude"
              className="text-xs text-blue-400 hover:text-blue-300 font-medium inline-flex items-center gap-1 transition-colors"
            >
              <span>View All</span>
              <ArrowRight className="size-3" />
            </Link>
          </div>

          <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/60 shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 text-xs font-medium uppercase tracking-wider">
                  <tr>
                    <th className="px-5 py-3.5">Category</th>
                    <th className="px-5 py-3.5">Score</th>
                    <th className="px-5 py-3.5">Grade</th>
                    <th className="px-5 py-3.5">Date</th>
                    <th className="px-5 py-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 text-slate-300">
                  {aptitudeResults.slice(0, 5).map((result) => (
                    <tr key={result.id} className="hover:bg-slate-850/50 transition-colors">
                      <td className="px-5 py-4 font-medium text-white capitalize">
                        {result.category.replace("_", " ")}
                      </td>
                      <td className="px-5 py-4 text-slate-300">
                        {result.score} / {result.totalQuestions}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                          result.percentage >= 80
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : result.percentage >= 50
                            ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                            : "bg-red-500/10 text-red-400 border-red-500/20"
                        }`}>
                          {result.percentage}%
                        </span>
                      </td>
                      <td className="px-5 py-4 text-slate-400">
                        {new Date(result.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <Link
                          href={`/aptitude/${result.category}/result?resultId=${result.id}`}
                          className="text-blue-400 hover:text-blue-300 font-medium inline-flex items-center gap-1 transition-colors"
                        >
                          <span>Review</span>
                          <ArrowRight className="size-3" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default Page;
