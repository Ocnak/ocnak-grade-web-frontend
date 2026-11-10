"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { Fredoka } from "next/font/google";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { useFilterStore } from "@/store/filterStore";
import {
  useAttendanceGrid,
  type AttendanceGridStudent,
  type GridCell,
} from "@/hooks/use-student-attendance";
import {
  SCHOOL_TIME_ZONE,
  type AttendanceStatus,
} from "@/lib/types/student-attendance-shared";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import {
  ATTENDANCE_STATUS_ORDER,
  DAY_STATUS_STYLES,
} from "./attendance-status-styles";
import AttendanceEditModal, {
  type AttendanceEditTarget,
} from "./attendance-edit-modal";

const fredoka = Fredoka({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

// school days that have started can be corrected; holidays and future days can't
const EDITABLE_STATUSES = new Set([
  "present",
  "tardy",
  "absent",
  "excused",
  "sick",
  "not_arrived",
]);

const getSchoolToday = () =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: SCHOOL_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());

const addDays = (date: string, days: number) => {
  const parsed = new Date(`${date}T00:00:00Z`);
  parsed.setUTCDate(parsed.getUTCDate() + days);
  return parsed.toISOString().slice(0, 10);
};

const getMonday = (date: string) => {
  const weekday = new Date(`${date}T00:00:00Z`).getUTCDay();
  return addDays(date, weekday === 0 ? -6 : 1 - weekday);
};

const formatDay = (date: string, options: Intl.DateTimeFormatOptions) =>
  new Date(`${date}T00:00:00Z`).toLocaleDateString([], {
    ...options,
    timeZone: "UTC",
  });

const formatArrival = (value: string) =>
  new Date(value).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
    timeZone: SCHOOL_TIME_ZONE,
  });

export function AttendanceMain() {
  // the store calls it "className", but it holds the class id
  const { location, name: search, className: classId } = useFilterStore();
  const today = useMemo(getSchoolToday, []);
  const thisMonday = getMonday(today);
  const [weekStart, setWeekStart] = useState(thisMonday);
  const [editTarget, setEditTarget] = useState<AttendanceEditTarget | null>(
    null,
  );
  const weekEnd = addDays(weekStart, 4);

  const { data, isLoading, isFetching, error } = useAttendanceGrid({
    from: weekStart,
    to: weekEnd,
  });
  // class, location and name are filtered here, so changing them is instant
  const visibleStudents = useMemo(() => {
    const term = search.trim().toLowerCase();
    return (data?.students ?? []).filter((student) => {
      const matchesClass = classId ? student.class?.id === classId : true;
      const matchesLocation = location ? student.location === location : true;
      const matchesName = term
        ? student.name.toLowerCase().includes(term)
        : true;
      return matchesClass && matchesLocation && matchesName;
    });
  }, [data, classId, location, search]);

  const summary = useMemo(() => {
    const counts: Record<AttendanceStatus, number> = {
      present: 0,
      tardy: 0,
      absent: 0,
      excused: 0,
      sick: 0,
    };
    for (const student of visibleStudents) {
      for (const cell of student.days) {
        if ((ATTENDANCE_STATUS_ORDER as string[]).includes(cell.status)) {
          counts[cell.status as AttendanceStatus] += 1;
        }
      }
    }
    const total = Object.values(counts).reduce((sum, n) => sum + n, 0);
    return { counts, total };
  }, [visibleStudents]);

  const visibleMissingSettings = (data?.missingSettings ?? []).filter((loc) =>
    location ? loc === location : true,
  );

  const onHandlePrevWeek = () => setWeekStart((prev) => addDays(prev, -7));
  const onHandleNextWeek = () => setWeekStart((prev) => addDays(prev, 7));
  const onHandleThisWeek = () => setWeekStart(thisMonday);

  const onHandleCellClick = (
    student: AttendanceGridStudent,
    date: string,
    cell: GridCell,
  ) => {
    if (!EDITABLE_STATUSES.has(cell.status)) return;
    setEditTarget({
      studentId: student.id,
      studentName: student.name,
      date,
      cell,
    });
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner className="size-19" />
      </div>
    );
  }

  const dates = data?.dates ?? [];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={onHandlePrevWeek}
            aria-label="Previous week"
            className="h-10 w-10 cursor-pointer rounded-sm p-0"
          >
            <ChevronLeftIcon className="size-5" />
          </Button>
          <Button
            variant="outline"
            onClick={onHandleThisWeek}
            disabled={weekStart === thisMonday}
            className="h-10 cursor-pointer rounded-sm px-4"
          >
            This week
          </Button>
          <Button
            variant="outline"
            onClick={onHandleNextWeek}
            disabled={weekStart >= thisMonday}
            aria-label="Next week"
            className="h-10 w-10 cursor-pointer rounded-sm p-0"
          >
            <ChevronRightIcon className="size-5" />
          </Button>
          <p
            className={`${fredoka.className} ml-2 text-[17px] font-medium text-slate-800`}
          >
            {formatDay(weekStart, { day: "numeric", month: "short" })} –{" "}
            {formatDay(weekEnd, {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </p>
          {isFetching && <Spinner className="size-5" />}
        </div>

        <div className="flex flex-wrap gap-2">
          {ATTENDANCE_STATUS_ORDER.map((status) => {
            const style = DAY_STATUS_STYLES[status];
            const percent = summary.total
              ? Math.round((summary.counts[status] / summary.total) * 100)
              : 0;
            return (
              <span
                key={status}
                className="inline-flex items-center gap-1.5 rounded-full border border-gray-300 bg-white px-3 py-1 text-xs font-medium text-slate-700"
              >
                <span className={`size-2 rounded-full ${style.dot}`} />
                {style.label} {percent}%
              </span>
            );
          })}
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error.message}</p>}

      {visibleMissingSettings.length > 0 && (
        <div className="rounded border-l-4 border-amber-400 bg-amber-50 p-4">
          <p className="ml-3 text-[14px] font-medium tracking-wide text-amber-800">
            Attendance settings are missing for{" "}
            {visibleMissingSettings.join(" and ")}, so today stays &quot;Not
            yet&quot; there until tomorrow.
          </p>
        </div>
      )}

      <div className="overflow-x-auto rounded-lg border border-gray-300 bg-white shadow-sm">
        <table className="w-full min-w-160 border-collapse text-sm">
          <thead>
            <tr className="bg-gray-50">
              <th className="sticky left-0 z-10 bg-gray-50 px-4 py-2.5 text-left text-[13px] font-bold text-[#777]">
                Student
              </th>
              {dates.map((date) => (
                <th
                  key={date}
                  className={`px-2 py-2.5 text-center text-[13px] font-bold ${
                    date === today ? "text-slate-800" : "text-[#777]"
                  }`}
                >
                  <span className="block">
                    {formatDay(date, { weekday: "short" })}
                  </span>
                  <span className={`${fredoka.className} text-[17px]`}>
                    {formatDay(date, { day: "numeric" })}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visibleStudents.length === 0 ? (
              <tr>
                <td
                  colSpan={dates.length + 1}
                  className="px-4 py-10 text-center text-gray-500"
                >
                  No students match these filters.
                </td>
              </tr>
            ) : (
              visibleStudents.map((student) => (
                <tr key={student.id} className="border-t border-gray-100">
                  <td className="sticky left-0 z-10 bg-white px-4 py-2">
                    <p
                      className={`${fredoka.className} max-w-44 truncate font-medium capitalize text-slate-800`}
                    >
                      {student.name}
                    </p>
                    <p className="text-xs text-gray-500">{student.location}</p>
                  </td>

                  {student.days.map((cell, index) => {
                    const date = dates[index];
                    const style = DAY_STATUS_STYLES[cell.status];
                    const editable = EDITABLE_STATUSES.has(cell.status);

                    return (
                      <td
                        key={date}
                        className={`px-1.5 py-1.5 ${date === today ? "bg-slate-50" : ""}`}
                      >
                        <button
                          type="button"
                          disabled={!editable}
                          onClick={() => onHandleCellClick(student, date, cell)}
                          title={cell.reason ?? undefined}
                          className={`flex h-11 w-full flex-col items-center justify-center rounded-md border text-xs font-medium transition ${style.cell} ${
                            editable
                              ? "cursor-pointer hover:brightness-95"
                              : "cursor-default"
                          }`}
                        >
                          {style.label}
                          {cell.status === "tardy" && cell.firstArrivalAt && (
                            <span className="text-[10px] font-normal">
                              {formatArrival(cell.firstArrivalAt)}
                            </span>
                          )}
                          {cell.source === "manual" && (
                            <span className="text-[10px] font-normal opacity-75">
                              Edited
                            </span>
                          )}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <AttendanceEditModal
        target={editTarget}
        onClose={() => setEditTarget(null)}
      />
    </div>
  );
}
