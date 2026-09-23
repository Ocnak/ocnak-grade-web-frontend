"use client";

import { FileDown, FileUp } from "lucide-react";
import { useFetchClasses } from "@/hooks/use-classes";
import { useQueryClient } from "@tanstack/react-query";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { RippleButton } from "@/components/ui/ripple-button";
import { useState } from "react";
import { Spinner } from "@/components/ui/spinner";
import { Fredoka } from "next/font/google";
import { AlertDialog as AlertDialogPrimitive } from "radix-ui";
import { useFilterStore } from "@/store/filterStore";
import { useFetchPeriods } from "@/hooks/use-periods";
import { useUnapproveGradesByClassPeriod } from "@/hooks/use-students";

const fredoka = Fredoka({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export default function UnPublishStudentGradeModal() {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);

  const { className, periodId } = useFilterStore();

  const { data: classesData } = useFetchClasses();
  const { data: periodData } = useFetchPeriods();

  const {
    mutate: submittedGrades,
    isPending,
    error,
  } = useUnapproveGradesByClassPeriod();

  const selectedClass = classesData?.classes?.find(
    (cls: { id: string; name: string }) => cls.id === className,
  );
  const selectedPeriod = periodData?.find(
    (period: any) => period.id === periodId,
  );

  const isSelectionMissing = !className || !periodId;

  const onUnHandlePublish = () => {
    if (isSelectionMissing) return;

    submittedGrades(
      { classId: className, periodId },
      {
        onSuccess: (data) => {
          setIsOpen(false);
          toast.success(
            `${data.unapproved} student grade${data.unapproved === 1 ? "" : "s"} unpublished successfully!`,
            {
              position: "top-right",
              style: {
                "--normal-bg":
                  "color-mix(in oklab, light-dark(var(--color-green-600), var(--color-green-400)) 10%, var(--background))",
                "--normal-text":
                  "light-dark(var(--color-green-600), var(--color-green-400))",
                "--normal-border":
                  "light-dark(var(--color-green-600), var(--color-green-400))",
              } as React.CSSProperties,
            },
          );
        },
        onError: (err) => {
          toast.error(err.message, {
            position: "top-right",
          });
        },
      },
    );
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <RippleButton
          type="submit"
          disabled={isSelectionMissing}
          className="h-12 cursor-pointer rounded-md bg-amber-700 px-4 hover:bg-amber-600"
        >
          <FileDown className="text-white size-6" />
          <span className="">Unpublish Student Grade</span>
        </RippleButton>
      </AlertDialogTrigger>
      <AlertDialogContent className="data-[state=open]:zoom-in-0! data-[state=open]:duration-300 sm:max-w-115.75!">
        <AlertDialogHeader className="items-center">
          <div className="bg-amber-700/20 mx-auto mb-2 flex size-14 items-center justify-center rounded-full">
            <FileDown className="text-amber-600 size-6.6" />
          </div>
          <AlertDialogTitle
            className={`${fredoka.className} w-full text-center`}
          >
            Are you sure you want to unpublish these student grades?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center w-full">
            Once unpublished, the grades for{" "}
            <span className="font-medium text-foreground">
              {selectedClass?.name ?? "the selected class"}
            </span>{" "}
            in{" "}
            <span className="font-medium text-foreground">
              {selectedPeriod
                ? `Period ${selectedPeriod.period}`
                : "the selected period"}
            </span>{" "}
            will no longer be available for parents to view. This will allow the
            grades to be reviewed or corrected before they are published again.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogPrimitive.Cancel className="h-10 px-5 cursor-pointer rounded-sm border border-gray-300 bg-white  hover:bg-accent hover:text-accent-foreground">
            <span className="text-[13px] font-medium">Cancel</span>
          </AlertDialogPrimitive.Cancel>

          <Button
            disabled={isPending}
            onClick={onUnHandlePublish}
            className="bg-amber-700 font-medium text-[13px] hover:bg-amber-600  focus-visible:ring-emerald-700 h-10 px-5 cursor-pointer rounded-sm text-white duration-300"
          >
            {isPending ? (
              <Spinner className="size-6" />
            ) : (
              <span className="text-[13px] font-medium"> Unpublish Grade</span>
            )}
          </Button>
        </AlertDialogFooter>
        {error && (
          <div className="rounded border-l-4 border-red-400 bg-red-50 p-4">
            <div className="flex">
              <div className="ml-3">
                <p className="text-[14px] font-medium tracking-wide text-red-700">
                  {error.message}
                </p>
              </div>
            </div>
          </div>
        )}
      </AlertDialogContent>
    </AlertDialog>
  );
}
