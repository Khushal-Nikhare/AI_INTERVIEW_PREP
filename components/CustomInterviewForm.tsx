"use client";

import React, { useState } from "react";
import { useForm, FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createCustomInterview } from "@/lib/actions/interview.action";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

const customInterviewSchema = z.object({
  role: z.string().min(2, "Role must be at least 2 characters"),
  type: z.enum(["Technical", "Behavioral", "Mixed"]),
  level: z.enum(["Junior", "Mid", "Senior"]),
  techstack: z.string().min(2, "Add at least one technology"),
  questions: z
    .array(z.string().min(5, "Each question must be at least 5 characters"))
    .min(1, "Add at least one question")
    .max(20, "Maximum 20 questions allowed"),
});

type CustomInterviewFormData = z.infer<typeof customInterviewSchema>;

interface CustomInterviewFormProps {
  userId: string;
  userName?: string;
}

const CustomInterviewForm = ({ userId, userName: _userName }: CustomInterviewFormProps) => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [questions, setQuestions] = useState<string[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<CustomInterviewFormData>({
    resolver: zodResolver(customInterviewSchema),
    defaultValues: {
      type: "Technical",
      level: "Junior",
      questions: [],
    },
  });

  const addQuestion = () => {
    const trimmed = currentQuestion.trim();
    if (!trimmed) return;

    if (trimmed.length < 5) {
      toast.error("Question must be at least 5 characters long");
      return;
    }

    if (questions.length >= 20) {
      toast.error("Maximum 20 questions allowed");
      return;
    }

    const newQuestions = [...questions, trimmed];
    setQuestions(newQuestions);
    setValue("questions", newQuestions, { shouldValidate: true });
    setCurrentQuestion("");
  };

  const removeQuestion = (index: number) => {
    const newQuestions = questions.filter((_, i) => i !== index);
    setQuestions(newQuestions);
    setValue("questions", newQuestions, { shouldValidate: true });
  };

  const getQuestionErrorMessage = (qErrors: unknown): string | undefined => {
    if (!qErrors) return undefined;
    if (
      typeof qErrors === "object" &&
      qErrors !== null &&
      "message" in qErrors &&
      typeof (qErrors as { message: unknown }).message === "string"
    ) {
      return (qErrors as { message: string }).message;
    }
    if (Array.isArray(qErrors)) {
      const found = qErrors.find(
        (e) => e && typeof e === "object" && "message" in e && typeof e.message === "string"
      );
      if (found) return (found as { message: string }).message;
    }
    if (typeof qErrors === "object" && qErrors !== null) {
      for (const key of Object.keys(qErrors)) {
        const val = (qErrors as Record<string, unknown>)[key];
        if (
          val &&
          typeof val === "object" &&
          "message" in val &&
          typeof (val as { message: unknown }).message === "string"
        ) {
          return (val as { message: string }).message;
        }
      }
    }
    return undefined;
  };

  const onError = (formErrors: FieldErrors<CustomInterviewFormData>) => {
    console.error("Form validation errors:", formErrors);
    if (formErrors.role) {
      toast.error(formErrors.role.message || "Please enter a valid role");
      return;
    }
    if (formErrors.techstack) {
      toast.error(formErrors.techstack.message || "Please specify the tech stack");
      return;
    }
    if (formErrors.questions) {
      const errorMsg =
        getQuestionErrorMessage(formErrors.questions) ||
        "Please provide valid questions (at least 5 characters each)";
      toast.error(errorMsg);
      return;
    }
    toast.error("Please complete the required fields");
  };

  const onSubmit = async (data: CustomInterviewFormData) => {
    let finalQuestions = [...questions];

    if (currentQuestion.trim()) {
      const pendingTrimmed = currentQuestion.trim();
      if (pendingTrimmed.length < 5) {
        toast.error("The pending question in the input field is too short (min 5 characters)");
        return;
      }
      finalQuestions = [...finalQuestions, pendingTrimmed];
    }

    if (finalQuestions.length === 0) {
      toast.error("Please add at least one question before starting");
      return;
    }

    if (!userId) {
      toast.error("You must be signed in to create a custom interview");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await createCustomInterview({
        ...data,
        userId,
        questions: finalQuestions,
      });

      if (result.success && result.interviewId) {
        toast.success("Custom interview template configured successfully!");
        router.push(`/interview/${result.interviewId}`);
      } else {
        toast.error(result.error || "Failed to create interview template");
      }
    } catch (error) {
      console.error("Error creating interview:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const generalQuestionsError = getQuestionErrorMessage(errors.questions);

  return (
    <form onSubmit={handleSubmit(onSubmit, onError)} className="flex flex-col gap-6 w-full">
      {/* ── Primary Settings Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Role Input */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="role" className="text-xs font-semibold uppercase tracking-wider text-slate-300">
            Target Job Role
          </Label>
          <Input
            id="role"
            placeholder="e.g., Senior Full Stack Engineer, ML Specialist"
            {...register("role")}
            className="input"
          />
          {errors.role && (
            <p className="text-red-400 text-xs">{errors.role.message}</p>
          )}
        </div>

        {/* Tech Stack Input */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="techstack" className="text-xs font-semibold uppercase tracking-wider text-slate-300">
            Tech Stack (Comma Separated)
          </Label>
          <Input
            id="techstack"
            placeholder="e.g., React, TypeScript, Node.js, PostgreSQL"
            {...register("techstack")}
            className="input"
          />
          {errors.techstack && (
            <p className="text-red-400 text-xs">{errors.techstack.message}</p>
          )}
        </div>

        {/* Type Selection */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="type" className="text-xs font-semibold uppercase tracking-wider text-slate-300">
            Interview Focus
          </Label>
          <select
            id="type"
            {...register("type")}
            className="input bg-slate-900 border border-slate-800 text-slate-100 rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-blue-500"
          >
            <option value="Technical">Technical (Coding & Architecture)</option>
            <option value="Behavioral">Behavioral (Leadership & STAR method)</option>
            <option value="Mixed">Mixed (Comprehensive Assessment)</option>
          </select>
          {errors.type && (
            <p className="text-red-400 text-xs">{errors.type.message}</p>
          )}
        </div>

        {/* Level Selection */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="level" className="text-xs font-semibold uppercase tracking-wider text-slate-300">
            Seniority Level
          </Label>
          <select
            id="level"
            {...register("level")}
            className="input bg-slate-900 border border-slate-800 text-slate-100 rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-blue-500"
          >
            <option value="Junior">Junior / Entry Level (0-2 yrs)</option>
            <option value="Mid">Mid Level (2-5 yrs)</option>
            <option value="Senior">Senior / Staff (5+ yrs)</option>
          </select>
          {errors.level && (
            <p className="text-red-400 text-xs">{errors.level.message}</p>
          )}
        </div>
      </div>

      {/* ── Custom Questions List ── */}
      <div className="flex flex-col gap-4 mt-2 pt-4 border-t border-slate-800">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
            Interview Questions ({questions.length}/20)
          </Label>
          <span className="text-xs text-slate-500">Min 5 chars per question, up to 20 questions</span>
        </div>

        {/* Existing Question Items */}
        {questions.length > 0 && (
          <div className="flex flex-col gap-2">
            {questions.map((question, index) => {
              const itemError = Array.isArray(errors.questions)
                ? errors.questions[index]?.message
                : errors.questions && typeof errors.questions === "object"
                ? (errors.questions as Record<number, { message?: string }>)[index]?.message
                : undefined;

              return (
                <div key={index} className="flex flex-col gap-1">
                  <div
                    className={cn(
                      "flex items-start gap-3 p-3.5 bg-slate-900/60 border rounded-xl group transition-colors",
                      itemError
                        ? "border-red-500/60 bg-red-950/20"
                        : "border-slate-800 hover:border-slate-700"
                    )}
                  >
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-slate-800 text-xs font-bold text-slate-400">
                      {index + 1}
                    </span>
                    <p className="flex-1 text-xs sm:text-sm text-slate-200 mt-0.5 leading-relaxed">
                      {question}
                    </p>
                    <button
                      type="button"
                      onClick={() => removeQuestion(index)}
                      className="text-slate-500 hover:text-red-400 transition-colors p-1"
                      title="Remove Question"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                  {itemError && (
                    <p className="text-red-400 text-xs pl-2">{itemError}</p>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Add Question Input Box */}
        <div className="flex gap-2">
          <Input
            placeholder="Type your interview question (min 5 characters) and press Enter..."
            value={currentQuestion}
            onChange={(e) => setCurrentQuestion(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addQuestion();
              }
            }}
            className="input flex-1"
          />
          <Button
            type="button"
            onClick={addQuestion}
            disabled={!currentQuestion.trim() || questions.length >= 20}
            className="btn-secondary h-auto px-4"
          >
            <Plus className="size-4" />
            <span className="hidden sm:inline">Add</span>
          </Button>
        </div>

        {generalQuestionsError && (
          <p className="text-red-400 text-xs">{generalQuestionsError}</p>
        )}
      </div>

      {/* ── Submit Action ── */}
      <Button
        type="submit"
        disabled={isSubmitting || (questions.length === 0 && !currentQuestion.trim())}
        className="btn-primary w-full py-3 mt-2"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="animate-spin size-4" />
            <span>Configuring Simulation Room...</span>
          </>
        ) : (
          "Save & Start Mock Interview"
        )}
      </Button>
    </form>
  );
};

export default CustomInterviewForm;
