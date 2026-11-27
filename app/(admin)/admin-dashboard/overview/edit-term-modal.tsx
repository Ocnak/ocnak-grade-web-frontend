"use client";

import { useState } from "react";
import { Fredoka } from "next/font/google";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Field, FieldLabel } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useFetchPeriods } from "@/hooks/use-periods";
import { useUpdateAcademicSettings } from "@/hooks/use-academic-settings";
import {
  SEMESTERS,
  type AcademicSettings,
  type Semester,
} from "@/lib/prefreshing-components/fetch-academic-settings";

const fredoka = Fredoka({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const SELECT_CONTENT =
  "data-[state=open]:slide-in-from-bottom-8 data-[state=open]:zoom-in-100 p-0 duration-200";
const SELECT_TRIGGER =
  "h-10! w-full cursor-pointer rounded-md! bg-white! text-[13px]!";

type Period = { id: string; period: number | null };

export default function EditTermModal({
  open,
  onOpenChange,
  settings,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  settings: AcademicSettings;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="data-[state=open]:zoom-in-0! max-w-full px-3 data-[state=open]:duration-200 md:max-w-115 md:p-6">
        <DialogHeader>
          <DialogTitle asChild>
            <h2 className={`${fredoka.className} text-[25px] font-semibold`}>
              Current Term
            </h2>
          </DialogTitle>
          <DialogDescription>
            Set the period and semester the school is in now.
          </DialogDescription>
        </DialogHeader>
        {/* mounted only while open, so it starts from the saved values each time */}
        {open && (
          <EditTermForm
            settings={settings}
            onClose={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function EditTermForm({
  settings,
  onClose,
}: {
  settings: AcademicSettings;
  onClose: () => void;
}) {
  const { data: periods, isLoading: periodsLoading } = useFetchPeriods();
  const { mutate, isPending, error } = useUpdateAcademicSettings();
  const [periodId, setPeriodId] = useState(settings.currentPeriod?.id ?? "");
  const [semester, setSemester] = useState<Semester | "">(
    settings.currentSemester ?? "",
  );

  const sortedPeriods = [...((periods as Period[] | undefined) ?? [])].sort(
    (a, b) => (a.period ?? 0) - (b.period ?? 0),
  );

  const onSave = () =>
    mutate(
      { currentPeriodId: periodId || null, currentSemester: semester || null },
      {
        onSuccess: () => {
          onClose();
          toast.success("Current term updated!", {
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

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Field>
          <FieldLabel className="text-[13px] font-bold text-[#777]">
            Period
          </FieldLabel>
          <Select
            value={periodId}
            onValueChange={setPeriodId}
            disabled={periodsLoading}
          >
            <SelectTrigger className={SELECT_TRIGGER}>
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent
              position="popper"
              side="bottom"
              avoidCollisions={false}
              className={SELECT_CONTENT}
            >
              <SelectGroup>
                <SelectLabel>Periods</SelectLabel>
                {sortedPeriods.map((period) => (
                  <SelectItem key={period.id} value={period.id}>
                    Period {period.period}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </Field>

        <Field>
          <FieldLabel className="text-[13px] font-bold text-[#777]">
            Semester
          </FieldLabel>
          <Select
            value={semester}
            onValueChange={(value) => setSemester(value as Semester)}
          >
            <SelectTrigger className={SELECT_TRIGGER}>
              <SelectValue placeholder="Select semester" />
            </SelectTrigger>
            <SelectContent
              position="popper"
              side="bottom"
              avoidCollisions={false}
              className={SELECT_CONTENT}
            >
              <SelectGroup>
                <SelectLabel>Semesters</SelectLabel>
                {SEMESTERS.map((value) => (
                  <SelectItem key={value} value={value}>
                    {value}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </Field>
      </div>

      {error && (
        <div className="rounded border-l-4 border-red-400 bg-red-50 p-4">
          <p className="ml-3 text-[14px] font-medium tracking-wide text-red-700">
            {error.message}
          </p>
        </div>
      )}

      <DialogFooter className="mt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          className="h-11 cursor-pointer rounded-lg px-6"
        >
          Cancel
        </Button>
        <Button
          type="button"
          disabled={isPending}
          onClick={onSave}
          className="h-11 cursor-pointer rounded-lg px-6"
        >
          {isPending ? (
            <Spinner className="size-6" />
          ) : (
            <span className="text-[13px]">Save</span>
          )}
        </Button>
      </DialogFooter>
    </div>
  );
}
