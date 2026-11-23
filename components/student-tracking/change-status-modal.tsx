"use client";

import { useEffect, useState } from "react";
import { Fredoka } from "next/font/google";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import {
  useChangeStudentStatus,
  type LiveStudent,
} from "@/hooks/use-student-tracking";
import type { TrackingStatus } from "@/lib/types/student-attendance-shared";
import {
  TRACKING_STATUS_ORDER,
  TRACKING_STATUS_STYLES,
} from "./tracking-status-styles";

const fredoka = Fredoka({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

type ChangeStatusModalProps = {
  student: LiveStudent | null;
  onClose: () => void;
};

export default function ChangeStatusModal({
  student,
  onClose,
}: ChangeStatusModalProps) {
  const { mutate, error, isPending, reset } = useChangeStudentStatus();
  const [status, setStatus] = useState<TrackingStatus>("at_school");

  // each time the modal opens, start on a status that differs from the current one
  useEffect(() => {
    if (!student) return;
    setStatus(student.status === "at_school" ? "off_campus" : "at_school");
  }, [student?.id]);

  const onHandleOpenChange = (open: boolean) => {
    // keep the modal open while the request is running
    if (open || isPending) return;
    reset();
    onClose();
  };

  const onHandleSave = () => {
    if (!student) return;

    mutate(
      { studentId: student.id, status },
      {
        onSuccess: (data) => {
          const label = TRACKING_STATUS_STYLES[status].label;
          if (data.result === "already_set") {
            toast.info(`${student.name} is already marked ${label} today`, {
              position: "top-right",
            });
          } else {
            toast.success(`${student.name} marked ${label}`, {
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
          }
          reset();
          onClose();
        },
      },
    );
  };

  return (
    <Dialog open={!!student} onOpenChange={onHandleOpenChange}>
      <DialogContent className="data-[state=open]:zoom-in-0! h-auto rounded-lg border-none bg-white px-3 data-[state=open]:duration-200 md:max-w-120 md:rounded-[15px] md:p-6">
        <DialogHeader>
          <DialogTitle>
            <span className={`${fredoka.className} text-[25px] font-semibold`}>
              Change Status
            </span>
          </DialogTitle>
          <DialogDescription>
            Correct where{" "}
            <span className="font-medium capitalize text-slate-800">
              {student?.name}
            </span>{" "}
            is right now.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-2">
            {TRACKING_STATUS_ORDER.map((option) => {
              const style = TRACKING_STATUS_STYLES[option];
              const Icon = style.icon;
              const active = option === status;
              return (
                <Button
                  key={option}
                  type="button"
                  onClick={() => setStatus(option)}
                  aria-pressed={active}
                  className={`flex h-18 cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-2 text-[13px] font-medium transition-colors ${
                    active ? style.optionActive : style.optionIdle
                  }`}
                >
                  <Icon className="size-5" />
                  {style.label}
                </Button>
              );
            })}
          </div>

          {status === "at_school" && (
            <p className="text-[13px] text-gray-500">
              This also marks them present today, or tardy if it&apos;s after
              the cutoff time.
            </p>
          )}

          {error && (
            <div className="rounded border-l-4 border-red-400 bg-red-50 p-4">
              <p className="ml-3 text-[14px] font-medium tracking-wide text-red-700">
                {error.message}
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="mt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => onHandleOpenChange(false)}
            disabled={isPending}
            className="h-11 cursor-pointer rounded-lg px-6"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={onHandleSave}
            disabled={isPending}
            className="h-11 cursor-pointer rounded-lg px-6"
          >
            {isPending ? (
              <Spinner className="size-7" />
            ) : (
              <span className="text-[13px]">Save status</span>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
