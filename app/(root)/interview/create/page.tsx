import CustomInterviewForm from "@/components/CustomInterviewForm";
import { getCurrentUser } from "@/lib/actions/auth.action";
import React from "react";
import Link from "next/link";
import { ChevronLeft, Sliders } from "lucide-react";

const CreateCustomInterviewPage = async () => {
  const user = await getCurrentUser();

  return (
    <div className="flex flex-col gap-6 max-w-3xl mx-auto w-full">
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
          Template Builder
        </span>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-blue-400 text-xs font-semibold uppercase tracking-wider">
          <Sliders className="size-4" />
          <span>Tailored Technical Preparation</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
          Create Custom Mock Interview
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
          Specify exact questions, desired focus areas, and technical frameworks. The AI voice agent will conduct a structured interview according to your defined curriculum.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8 shadow-xs mt-2">
        <CustomInterviewForm userId={user?.id || ""} userName={user?.name || ""} />
      </div>
    </div>
  );
};

export default CreateCustomInterviewPage;
