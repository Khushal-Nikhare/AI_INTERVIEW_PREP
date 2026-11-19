"use client";

import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { vapi } from "@/lib/vapi.sdk";
import { interviewer } from "@/constants";
import { createFeedback } from "@/lib/actions/interview.action";
import { Phone, PhoneOff, Mic, Sparkles, User as UserIcon } from "lucide-react";
import { toast } from "sonner";

enum CallStatus {
  INACTIVE = "INACTIVE",
  CONNECTING = "CONNECTING",
  ACTIVE = "ACTIVE",
  FINISHED = "FINISHED",
}

interface SavedMessage {
  role: "user" | "system" | "assistant";
  content: string;
}

const Agent = ({
  userName,
  userId,
  type,
  interviewId,
  feedbackId,
  questions,
}: AgentProps) => {
  const router = useRouter();

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [messages, setMessages] = useState<SavedMessage[]>([]);
  const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);
  const hasTriggeredFeedback = useRef(false);

  useEffect(() => {
    const onCallStart = () => {
      console.log("Vapi Event: call-start");
      setCallStatus(CallStatus.ACTIVE);
    };

    const onCallEnd = () => {
      console.log("Vapi Event: call-end");
      setCallStatus(CallStatus.FINISHED);
    };

    const onMessage = (message: {
      type: string;
      transcriptType?: string;
      transcript?: string;
      role?: "user" | "system" | "assistant";
    }) => {
      console.log("Vapi Event: message", message.type);
      if (
        message.type === "transcript" &&
        message.transcriptType === "final" &&
        message.transcript &&
        message.role
      ) {
        console.log("New transcript message:", message.transcript);
        const newMessage: SavedMessage = {
          role: message.role,
          content: message.transcript,
        };
        setMessages((prev) => [...prev, newMessage]);
      }
    };

    const onSpeechStart = () => {
      setIsSpeaking(true);
    };

    const onSpeechEnd = () => {
      setIsSpeaking(false);
    };

    const onError = (error: Error) => {
      console.error("Vapi Event: error", error);
    };

    vapi.on("call-start", onCallStart);
    vapi.on("call-end", onCallEnd);
    vapi.on("message", onMessage);
    vapi.on("speech-start", onSpeechStart);
    vapi.on("speech-end", onSpeechEnd);
    vapi.on("error", onError);

    return () => {
      vapi.off("call-start", onCallStart);
      vapi.off("call-end", onCallEnd);
      vapi.off("message", onMessage);
      vapi.off("speech-start", onSpeechStart);
      vapi.off("speech-end", onSpeechEnd);
      vapi.off("error", onError);
    };
  }, []);

  useEffect(() => {
    const handleGenerateFeedback = async (messages: SavedMessage[]) => {
      console.log("handleGenerateFeedback");

      const { success, feedbackId: id } = await createFeedback({
        interviewId: interviewId!,
        userId: userId!,
        transcript: messages,
        feedbackId,
      });

      if (success && id) {
        router.push(`/interview/${interviewId}/feedback`);
      } else {
        console.log("Error saving feedback");
        router.push("/");
      }
    };

    if (callStatus === CallStatus.FINISHED && !hasTriggeredFeedback.current) {
      hasTriggeredFeedback.current = true;
      console.log("Call status changed to FINISHED. Messages count:", messages.length);
      if (type === "generate") {
        router.push("/");
      } else {
        console.log("Triggering handleGenerateFeedback");
        handleGenerateFeedback(messages);
      }
    }
  }, [messages, callStatus, feedbackId, interviewId, router, type, userId]);

  const handleCall = async () => {
    hasTriggeredFeedback.current = false;
    setCallStatus(CallStatus.CONNECTING);
    try {
      if (type === "generate") {
        const assistantId = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID;

        if (!assistantId) {
          throw new Error(
            "Vapi is not configured. Set NEXT_PUBLIC_VAPI_ASSISTANT_ID to a published Vapi Assistant ID."
          );
        }

        await vapi.start(assistantId, {
          variableValues: {
            username: userName,
            userid: userId,
          },
        });
      } else {
        const formattedQuestions = questions
          ?.map((question) => `- ${question}`)
          .join("\n") ?? "";

        await vapi.start(interviewer, {
          variableValues: {
            questions: formattedQuestions,
          },
        });
      }
    } catch (error) {
      console.error("Unable to start Vapi call:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to start the voice interview. Please try again."
      );
      setCallStatus(CallStatus.INACTIVE);
    }
  };

  const handleDisconnect = () => {
    setCallStatus(CallStatus.FINISHED);
    vapi.stop();
  };

  const latestMessage = messages[messages.length - 1]?.content;

  const isCallInactiveOrFinished =
    callStatus === CallStatus.INACTIVE || callStatus === CallStatus.FINISHED;

  return (
    <div className="flex flex-col items-center gap-8 w-full max-w-4xl mx-auto">
      {/* ── Virtual Stage Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
        {/* AI Interviewer Node */}
        <div className="relative flex flex-col items-center justify-center p-8 rounded-2xl bg-slate-900/70 border border-slate-800 shadow-sm min-h-[320px] overflow-hidden">
          <div className="absolute top-4 left-4 flex items-center gap-2">
            <span className="flex size-2 rounded-full bg-emerald-400" />
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              AI Recruiter
            </span>
          </div>

          <div className="relative flex items-center justify-center size-28 rounded-full bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 shadow-lg p-1 mt-4">
            {isSpeaking && (
              <span className="absolute inset-0 rounded-full animate-ping bg-blue-400/40" />
            )}
            <div className="size-full rounded-full bg-slate-950 flex items-center justify-center overflow-hidden">
              <Image
                src="/ai-avatar.png"
                alt="AI Interviewer"
                width={70}
                height={70}
                className="object-contain"
                priority
              />
            </div>
          </div>

          <div className="mt-4 text-center">
            <h3 className="text-base font-semibold text-white">Sarah Jenkins</h3>
            <p className="text-xs text-slate-400 mt-0.5">Senior Technical Evaluator</p>
          </div>

          {isSpeaking && (
            <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium animate-pulse">
              <Mic className="size-3" />
              <span>Speaking...</span>
            </div>
          )}
        </div>

        {/* Candidate / User Node */}
        <div className="relative flex flex-col items-center justify-center p-8 rounded-2xl bg-slate-900/40 border border-slate-800/80 min-h-[320px]">
          <div className="absolute top-4 left-4 flex items-center gap-2">
            <UserIcon className="size-3 text-slate-400" />
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Candidate
            </span>
          </div>

          <div className="size-28 rounded-full bg-slate-800 border-2 border-slate-700/60 flex items-center justify-center overflow-hidden shadow-md mt-4">
            <Image
              src="/user-avatar.png"
              alt={userName || "Candidate"}
              width={112}
              height={112}
              className="size-full object-cover"
            />
          </div>

          <div className="mt-4 text-center">
            <h3 className="text-base font-semibold text-white">{userName || "Candidate"}</h3>
            <p className="text-xs text-slate-400 mt-0.5">Audio Feed Ready</p>
          </div>
        </div>
      </div>

      {/* ── Live Transcriptions Box ── */}
      {messages.length > 0 && (
        <div className="w-full rounded-xl border border-slate-800 bg-slate-900/80 p-4 min-h-16 flex items-center justify-center shadow-xs">
          <p
            key={latestMessage}
            className={cn(
              "text-slate-200 text-sm font-medium text-center leading-relaxed",
              "animate-fadeIn"
            )}
          >
            &ldquo;{latestMessage}&rdquo;
          </p>
        </div>
      )}

      {/* ── Call Action Controls ── */}
      <div className="flex items-center justify-center pt-2">
        {callStatus !== "ACTIVE" ? (
          <button
            onClick={handleCall}
            disabled={callStatus === CallStatus.CONNECTING}
            className="group relative inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-semibold text-sm text-white bg-emerald-600 hover:bg-emerald-500 border border-emerald-500/30 shadow-lg shadow-emerald-950/40 transition-all duration-150 active:scale-[0.98] cursor-pointer disabled:opacity-75"
          >
            <Phone className="size-4 group-hover:rotate-12 transition-transform" />
            <span>
              {callStatus === CallStatus.CONNECTING
                ? "Connecting AI Interviewer..."
                : "Begin Voice Interview"}
            </span>
          </button>
        ) : (
          <button
            onClick={handleDisconnect}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-semibold text-sm text-white bg-red-600 hover:bg-red-500 border border-red-500/30 shadow-lg shadow-red-950/40 transition-all duration-150 active:scale-[0.98] cursor-pointer"
          >
            <PhoneOff className="size-4" />
            <span>Conclude & Generate Feedback</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default Agent;
