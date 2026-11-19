import { CATEGORY_META } from "@/components/AptitudeCard";
import AptitudeTest from "@/components/AptitudeTest";
import { getCurrentUser } from "@/lib/actions/auth.action";
import { generateAptitudeQuestions } from "@/lib/actions/interview.action";
import { redirect } from "next/navigation";
import { AlertCircle, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const AptitudeTestPage = async ({ params }: RouteParams) => {
  const { category } = await params;
  const user = await getCurrentUser();

  if (!user) redirect("/sign-in");

  const meta = CATEGORY_META[category];
  
  if (!meta) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 text-center">
        <h2 className="text-xl font-bold text-white">Category Not Found</h2>
        <p className="text-slate-400 text-sm">The aptitude category &quot;{category}&quot; does not exist.</p>
        <Button asChild className="btn-primary mt-2">
          <Link href="/aptitude">Return to Assessment Hub</Link>
        </Button>
      </div>
    );
  }

  // Generate 20 questions
  const { success, questions, error } = await generateAptitudeQuestions(category, 20);

  if (!success || !questions || questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-5 max-w-md mx-auto text-center">
        <div className="size-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
          <AlertCircle className="size-7" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Generation Unavailable</h2>
          <p className="text-slate-400 text-sm mt-1.5 leading-relaxed">
            There was an error generating AI questions. Please verify your backend connection or retry in a moment.
          </p>
          {error && (
            <p className="text-red-400 font-mono text-xs mt-2 px-3 py-1.5 rounded bg-red-500/10 border border-red-500/20 text-left">
              {error}
            </p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <Button asChild variant="outline" className="btn-secondary">
            <Link href="/aptitude">Back to Hub</Link>
          </Button>
          <Button asChild className="btn-primary">
            <a href={`/aptitude/${category}`}>Retry Generation</a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto w-full">
      {/* ── Runner Breadcrumb & Header ── */}
      <div className="flex items-center justify-between">
        <Link
          href="/aptitude"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors"
        >
          <ChevronLeft className="size-4" />
          <span>Exit to Hub</span>
        </Link>
        <div className="flex items-center gap-2">
          <span className="text-base">{meta.icon}</span>
          <span className="text-xs uppercase font-semibold tracking-wider text-slate-300">
            {meta.label}
          </span>
        </div>
      </div>

      <AptitudeTest
        questions={questions}
        category={category}
        userId={user.id}
        durationMinutes={30}
      />
    </div>
  );
};

export default AptitudeTestPage;
