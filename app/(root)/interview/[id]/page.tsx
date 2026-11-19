import Agent from "@/components/Agent";
import DisplayTechIcons from "@/components/DisplayTechIcons";
import { getCurrentUser } from "@/lib/actions/auth.action";
import { getInterviewById } from "@/lib/actions/interview.action";
import { getRandomInterviewCover } from "@/lib/utils";
import Image from "next/image";
import { redirect } from "next/navigation";
import React from "react";
import Link from "next/link";
import { ChevronLeft, Sparkles } from "lucide-react";

const InterviewDetails = async ({ params }: RouteParams) => {
  const { id } = await params;
  const user = await getCurrentUser();
  const interview = await getInterviewById(id);
  if (!interview) redirect("/");

  const normalizedType = /mix/gi.test(interview.type) ? "Mixed" : interview.type;

  const badgeStyle =
    {
      Behavioral: "bg-purple-500/10 text-purple-400 border-purple-500/20",
      Mixed: "bg-blue-500/10 text-blue-400 border-blue-500/20",
      Technical: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    }[normalizedType] || "bg-slate-500/10 text-slate-400 border-slate-500/20";

  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto w-full">
      {/* ── Top Header Navigation Bar ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex size-9 items-center justify-center rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <ChevronLeft className="size-5" />
          </Link>

          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-slate-800 border border-slate-700/60 p-1 flex items-center justify-center overflow-hidden">
              <Image
                src={getRandomInterviewCover()}
                alt="cover-image"
                width={40}
                height={40}
                className="size-full rounded-lg object-cover"
              />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-white capitalize leading-tight">
                {interview.role} Interview
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">Live Real-Time Technical Simulation</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-auto">
          <DisplayTechIcons techStack={interview.techstack} />
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${badgeStyle}`}>
            {normalizedType}
          </span>
        </div>
      </div>

      {/* ── Agent Voice Stage ── */}
      <Agent
        userName={user?.name || ""}
        userId={user?.id}
        interviewId={id}
        type="interview"
        questions={interview.questions}
      />
    </div>
  );
};

export default InterviewDetails;
