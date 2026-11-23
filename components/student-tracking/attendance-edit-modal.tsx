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
  useSetAttendance,
  type GridCell,
} from "@/hooks/use-student-attendance";
import type { AttendanceStatus } from "@/lib/types/student-attendance-shared";
import {
  ATTENDANCE_STATUS_ORDER,
  DAY_STATUS_STYLES,
  OPTION_IDLE,
} from "./attendance-status-styles";

const fredoka = Fredoka({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export type AttendanceEditTarget = {
  studentId: string;
  studentName: string;
  date: string;
  cell: GridCell;
};

type AttendanceEditModalProps = {
  target: AttendanceEditTarget | null;
  onClose: () => void;
};

const formatLongDate = (date: string) =>
  new Date(`${date}T00:00:00Z`).toLocaleDateString([], {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  });

// pick a sensible starting choice for the cell that was clicked
const getStartingStatus = (cell: GridCell): AttendanceStatus => {
  if (cell.status === "absent") return "excused";
  if ((ATTENDANCE_STATUS_ORDER as string[]).includes(cell.status)) {
    return cell.status as AttendanceStatus;
  }
  return "present";
};

export default function AttendanceEditModal({
  target,
  onClose,
}: AttendanceEditModalProps) {
  const { mutate, error, isPending, reset } = useSetAttendance();
  const [status, setStatus] = useState<AttendanceStatus>("present");

  useEffect(() => {
    if (!target) return;
    setStatus(getStartingStatus(target.cell));
  }, [target?.studentId, target?.date]);

  const onHandleOpenChange = (open: boolean) => {
    // keep the modal open while the request is running
    if (open || isPending) return;
    reset();
    onClose();
  };

  const onHandleSave = () => {
    if (!target) return;

    mutate(
      {
        studentId: target.studentId,
        date: target.date,
        status,
      },
      {
        onSuccess: () => {
          toast.success(
            `${target.studentName} marked ${DAY_STATUS_STYLES[status].label.toLowerCase()}`,
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
          reset();
          onClose();
        },
      },
    );
  };

  return (
    <Dialog open={!!target} onOpenChange={onHandleOpenChange}>
      <DialogContent className="data-[state=open]:zoom-in-0! h-auto rounded-lg border-none bg-white px-3 data-[state=open]:duration-200 md:max-w-130 md:rounded-[15px] md:p-6">
        <DialogHeader>
          <DialogTitle>
            <span className={`${fredoka.className} text-[25px] font-semibold`}>
              Edit Attendance
            </span>
          </DialogTitle>
          <DialogDescription>
            <span className="font-medium capitalize text-slate-800">
              {target?.studentName}
            </span>{" "}
            on {target ? formatLongDate(target.date) : ""}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
            {ATTENDANCE_STATUS_ORDER.map((option) => {
              const style = DAY_STATUS_STYLES[option];
              const active = option === status;
              return (
                <Button
                  key={option}
                  type="button"
                  onClick={() => setStatus(option)}
                  aria-pressed={active}
                  className={`h-12 cursor-pointer rounded-lg border-2 text-[13px] font-medium transition-colors ${
                    active ? style.optionActive : OPTION_IDLE
                  }`}
                >
                  {style.label}
                </Button>
              );
            })}
          </div>

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
              <span className="text-[13px]">Save attendance</span>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
