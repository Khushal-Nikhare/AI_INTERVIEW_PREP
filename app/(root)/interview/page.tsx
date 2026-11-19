import Agent from "@/components/Agent";
import { getCurrentUser } from "@/lib/actions/auth.action";
import React from "react";
import Link from "next/link";
import { ChevronLeft, Mic } from "lucide-react";

const Page = async () => {
  const user = await getCurrentUser();

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto w-full">
      {/* ── Top Header Navigation Bar ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex size-9 items-center justify-center rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <ChevronLeft className="size-5" />
          </Link>

          <div>
            <h1 className="text-lg sm:text-xl font-bold text-white leading-tight">
              AI Interview Generator
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">Interactive Voice Setup Session</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Mic className="size-3" />
            <span>Voice Guided</span>
          </span>
        </div>
      </div>

      <Agent userName={user?.name || ""} userId={user?.id} type="generate" />
    </div>
  );
};

export default Page;
