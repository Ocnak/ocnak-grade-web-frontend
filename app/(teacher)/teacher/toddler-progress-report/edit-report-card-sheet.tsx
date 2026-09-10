"use client";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import * as motion from "motion/react-client";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  useFetchPreSchoolerQuestions,
  useFetchPreschoolerAnswersByStudent,
  useUpsertPreschoolerAnswers,
} from "@/hooks/use-preschooler";
import PreschoolerAnswersOption from "./preschooler-answers-option";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { PencilSparkles } from "lucide-react";
import { Form } from "@/components/ui/form";
import PreschoolerSelectSemester from "./preschooler-select-semester";
import { useFilterStore } from "@/store/filterStore";
import { Fredoka } from "next/font/google";
import { Spinner } from "@/components/ui/spinner";

const fredoka = Fredoka({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const answerSchema = z.record(z.string(), z.enum(["yes", "working-on"]));
const reportCardSchema = z.object({
  answers: answerSchema,
});

type ReportCardForm = z.infer<typeof reportCardSchema>;

export default function EditReportCardSheet() {
  const searchParams = useSearchParams();
  const preschoolerId = searchParams.get("studentId");
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const { preschoolerSemester } = useFilterStore();
  const semester = preschoolerSemester || "Semester 1";

  const form = useForm<ReportCardForm>({
    resolver: zodResolver(reportCardSchema),
    defaultValues: { answers: {} },
  });

  const { handleSubmit, watch, setValue, reset } = form;
  const answers = watch("answers");

  const {
    mutate,
    isPending,
    error: mutationError,
  } = useUpsertPreschoolerAnswers();

  const {
    data: questionsData,
    error: questionsDataError,
    isLoading: questionsDataLoader,
  } = useFetchPreSchoolerQuestions();

  const {
    data: answersData,
    error: answersDataError,
    isLoading: answersDataLoader,
  } = useFetchPreschoolerAnswersByStudent(preschoolerId, semester);

  // Prefill the form with existing answers whenever the sheet opens for a
  // new student/semester combo (or once existing answers load in).
  useEffect(() => {
    if (!answersData) return;

    const existing = answersData.reduce<ReportCardForm["answers"]>(
      (acc, answer) => {
        if (answer.status === "yes" || answer.status === "working-on") {
          acc[answer.questionId] = answer.status;
        }
        return acc;
      },
      {},
    );

    reset({ answers: existing });
  }, [answersData, reset]);

  if (!preschoolerId) {
    return <div>No student selected.</div>;
  }

  if (questionsDataError)
    return (
      <div>
        Error fetching preschooler question category data:{" "}
        {questionsDataError.message}
      </div>
    );

  if (answersDataError)
    return (
      <div>
        Error fetching preschooler answers data: {answersDataError.message}
      </div>
    );

  const onSubmit = (values: ReportCardForm) => {
    mutate(
      { studentId: preschoolerId, semester, answers: values.answers },
      {
        onSuccess: () => {
          setOpen(false);
          queryClient.invalidateQueries({
            queryKey: [
              "preschooler_answers",
              "by-student",
              preschoolerId,
              semester,
            ],
          });
          toast.success("Report card answers saved!", {
            position: "top-right",
            style: {
              "--normal-bg":
                "color-mix(in oklab, light-dark(var(--color-green-600), var(--color-green-400)) 10%, var(--background))",
              "--normal-text":
                "light-dark(var(--color-green-600), var(--color-green-400))",
              "--normal-border":
                "light-dark(var(--color-green-600), var(--color-green-400))",
            } as React.CSSProperties,
          });
        },
      },
    );
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger>
        <motion.div
          className="cursor-pointer w-full tracking-wide flex items-center justify-center gap-2"
          whileTap={{ scale: 0.85 }}
        >
          <Button className="h-12.5 w-full text-[16px] font-medium cursor-pointer rounded-md bg-cyan-800 hover:bg-cyan-700 transition-none disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400 disabled:opacity-100">
            <PencilSparkles
              strokeWidth={2.25}
              className="transition-transform duration-200 group-hover:-translate-x-0.5 size-5"
            />
            Edit Record
          </Button>
        </motion.div>
      </SheetTrigger>
      <SheetContent className="md:max-w-112.5! sm:max-w-99.5! w-full!">
        <Form {...form}>
          <form className="h-full space-y-2" onSubmit={handleSubmit(onSubmit)}>
            <ScrollArea className="h-full">
              <SheetHeader>
                <SheetTitle
                  className={`${fredoka.className} text-2xl font-semibold md:text-[28px]`}
                >
                  Edit Report Card
                </SheetTitle>
                <SheetDescription>
                  Please review the information below before making any changes
                  to the report card.
                </SheetDescription>
                <div className="mt-2 w-full md:w-70">
                  <PreschoolerSelectSemester />
                </div>
              </SheetHeader>
              <div className="p-4 pt-0 text-sm">
                <p
                  className={`mb-2 ${fredoka.className} text-xl font-semibold uppercase`}
                >
                  Development Skills Assessment
                </p>

                {questionsDataLoader || answersDataLoader ? (
                  <div className="flex w-full items-center justify-center py-8 text-slate-400">
                    <Spinner className="size-16" />
                  </div>
                ) : (
                  <ol className="list-decimal space-y-6 pl-4 text-sm">
                    {questionsData?.map((category) => (
                      <li
                        key={category.id}
                        className="text-lg font-bold text-slate-800"
                      >
                        <span className="ml-2 tr acking-tight uppercase">
                          {category.categoryName}
                        </span>

                        <ul className="mt-3 space-y-4 pl-1 font-medium">
                          {category.questions?.map((question) => (
                            <li
                              key={question.id}
                              className="flex items-start gap-3 rounded-md"
                            >
                              <div className="flex items-center space-x-1">
                                <div className="flex size-5 shrink-0 rounded-full" />
                                <span className="text-slate-600">
                                  {question.questionText}:{" "}
                                  <span>
                                    <PreschoolerAnswersOption
                                      questionId={question.id}
                                      value={answers?.[question.id]}
                                      onChange={(val) =>
                                        setValue(
                                          `answers.${question.id}`,
                                          val,
                                          {
                                            shouldDirty: true,
                                          },
                                        )
                                      }
                                    />
                                  </span>
                                </span>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </li>
                    ))}
                  </ol>
                )}
              </div>

              {mutationError && (
                <div className="rounded border-l-4 border-red-400 bg-red-50 p-4">
                  <div className="flex">
                    <div className="ml-3">
                      <p className="text-[14px] font-medium tracking-wide text-red-700">
                        {mutationError.message}
                      </p>
                    </div>
                  </div>
                </div>
              )}
              <SheetFooter className="space-y-.5">
                <motion.div
                  className="cursor-pointer w-full tracking-wide flex items-center justify-center gap-2"
                  whileTap={{ scale: 0.85 }}
                >
                  <Button
                    disabled={isPending}
                    type="submit"
                    className="h-12.5 w-full text-[16px] font-medium cursor-pointer rounded-md bg-slate-800 transition-none disabled:cursor-not-allowed disabled:opacity-100"
                  >
                    {isPending ? (
                      <Spinner className="size-7" />
                    ) : (
                      <span>Save changes</span>
                    )}
                  </Button>
                </motion.div>

                <SheetClose>
                  <motion.div
                    className="cursor-pointer w-full tracking-wide flex items-center justify-center gap-2"
                    whileTap={{ scale: 0.85 }}
                  >
                    <Button
                      variant="secondary"
                      className="h-12.5 border border-gray-400 w-full text-[16px] font-medium cursor-pointer rounded-md transition-none disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400 disabled:opacity-100"
                    >
                      Cancel
                    </Button>
                  </motion.div>
                </SheetClose>
              </SheetFooter>
            </ScrollArea>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
