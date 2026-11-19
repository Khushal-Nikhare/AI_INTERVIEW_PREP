import React from "react";
import AptitudeCard, { CATEGORY_META } from "@/components/AptitudeCard";
import { getCurrentUser } from "@/lib/actions/auth.action";
import { getAptitudeResultsByUser } from "@/lib/actions/interview.action";
import Link from "next/link";
import { ArrowRight, CheckSquare, History, Sparkles } from "lucide-react";

const AptitudeHubPage = async () => {
  const user = await getCurrentUser();
  const userId = user?.id;

  // Fetch user's past aptitude results
  const pastResults = userId ? await getAptitudeResultsByUser(userId) : [];

  // Group results by category to find best score and total attempts
  const categoryStats: Record<string, { bestScore: number; attempts: number; lastAttempt: string }> = {};

  pastResults.forEach((result) => {
    if (!categoryStats[result.category]) {
      categoryStats[result.category] = { bestScore: 0, attempts: 0, lastAttempt: result.createdAt };
    }
    
    const stats = categoryStats[result.category];
    stats.attempts += 1;
    if (result.score > stats.bestScore) {
      stats.bestScore = result.score;
    }
    if (new Date(result.createdAt) > new Date(stats.lastAttempt)) {
      stats.lastAttempt = result.createdAt;
    }
  });

  const categories = Object.keys(CATEGORY_META);

  return (
    <div className="flex flex-col gap-10">
      {/* ── Hub Header ── */}
      <section className="flex flex-col gap-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium w-fit">
          <CheckSquare className="size-3.5" />
          <span>Placement & Corporate Readiness Tests</span>
        </div>

        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white">
          Aptitude Assessment Center
        </h1>
        <p className="text-sm sm:text-base text-slate-400 max-w-2xl leading-relaxed">
          Master quantitative problem solving, logical deduction, and verbal accuracy with dynamically generated 20-question, 30-minute timed tests.
        </p>
      </section>

      {/* ── Category Cards Grid ── */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => {
          const stats = categoryStats[category];
          return (
            <AptitudeCard
              key={category}
              category={category}
              bestScore={stats?.bestScore}
              totalAttempts={stats?.attempts}
              lastAttempted={stats?.lastAttempt}
            />
          );
        })}
      </section>
      
      {/* ── Recent Activity Table ── */}
      {pastResults.length > 0 && (
        <section className="flex flex-col gap-4 mt-4">
          <div className="flex items-center gap-2">
            <History className="size-5 text-blue-400" />
            <h2 className="text-lg sm:text-xl font-semibold text-white tracking-tight">Attempt History</h2>
          </div>

          <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/60 shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 text-xs font-medium uppercase tracking-wider">
                  <tr>
                    <th className="px-5 py-3.5">Category</th>
                    <th className="px-5 py-3.5">Score</th>
                    <th className="px-5 py-3.5">Performance</th>
                    <th className="px-5 py-3.5">Date Attempted</th>
                    <th className="px-5 py-3.5 text-right">Review</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 text-slate-300">
                  {pastResults.map((result) => (
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
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <Link
                          href={`/aptitude/${result.category}/result?resultId=${result.id}`}
                          className="text-blue-400 hover:text-blue-300 font-medium inline-flex items-center gap-1 transition-colors"
                        >
                          <span>Details</span>
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

export default AptitudeHubPage;
