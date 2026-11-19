import { getRandomInterviewCover } from "@/lib/utils";
import React from "react";
import dayjs from "dayjs";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import DisplayTechIcons from "@/components/DisplayTechIcons";
import { getFeedbackByInterviewId } from "@/lib/actions/interview.action";
import { Calendar, Award, ArrowUpRight } from "lucide-react";

const InterviewCard = async ({
  interviewId,
  userId,
  role,
  type,
  techstack,
  createdAt,
  feedback: initialFeedback,
}: InterviewCardProps) => {
  const feedback =
    initialFeedback !== undefined
      ? initialFeedback
      : userId && interviewId
      ? await getFeedbackByInterviewId({
          interviewId,
          userId,
        })
      : null;

  const normalizedType = /mix/gi.test(type) ? "Mixed" : type;

  const badgeStyle =
    {
      Behavioral: "bg-purple-500/10 text-purple-400 border-purple-500/20",
      Mixed: "bg-blue-500/10 text-blue-400 border-blue-500/20",
      Technical: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    }[normalizedType] || "bg-slate-500/10 text-slate-400 border-slate-500/20";

  const formattedDate = dayjs(
    feedback?.createdAt || createdAt || Date.now()
  ).format("MMM D, YYYY");

  return (
    <div className="group relative flex flex-col justify-between rounded-xl bg-slate-900/60 border border-slate-800/80 p-5 transition-all duration-200 hover:border-slate-700 hover:bg-slate-900/90 shadow-xs">
      <div>
        {/* Header: Cover + Type Badge */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="relative size-12 rounded-xl bg-slate-800 border border-slate-700/60 p-1 flex items-center justify-center overflow-hidden">
            <Image
              src={getRandomInterviewCover()}
              alt="cover-image"
              width={48}
              height={48}
              className="size-full rounded-lg object-cover"
            />
          </div>

          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${badgeStyle}`}>
            {normalizedType}
          </span>
        </div>

        {/* Role Title */}
        <h3 className="text-base font-semibold text-white tracking-tight capitalize group-hover:text-blue-400 transition-colors">
          {role} Interview
        </h3>

        {/* Date & Score Metadata */}
        <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <Calendar className="size-3.5 text-slate-500" />
            <span>{formattedDate}</span>
          </div>

          {feedback?.totalScore !== undefined && (
            <div className="flex items-center gap-1.5 font-medium text-emerald-400">
              <Award className="size-3.5" />
              <span>{feedback.totalScore}/100</span>
            </div>
          )}
        </div>

        {/* Feedback Snippet / Description */}
        <p className="mt-3.5 text-xs text-slate-400 line-clamp-2 leading-relaxed">
          {feedback?.finalAssessment ||
            "Mock interview session focusing on real-world industry questions and technical proficiency."}
        </p>
      </div>

      {/* Footer: Tech Stack + Action Link */}
      <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between gap-2">
        <DisplayTechIcons techStack={techstack} />

        <Button asChild size="sm" className="btn-primary text-xs h-8 px-3 rounded-lg">
          <Link
            href={
              feedback
                ? `/interview/${interviewId}/feedback`
                : `/interview/${interviewId}`
            }
            className="flex items-center gap-1"
          >
            {feedback ? "View Feedback" : "Start Session"}
            <ArrowUpRight className="size-3" />
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default InterviewCard;
