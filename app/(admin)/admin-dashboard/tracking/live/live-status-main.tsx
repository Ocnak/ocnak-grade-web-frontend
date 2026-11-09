"use client";

import { useMemo, useState } from "react";
import { Fredoka } from "next/font/google";
import { RefreshCwIcon, UsersIcon } from "lucide-react";
import { useFilterStore } from "@/store/filterStore";
import {
  useLiveTracking,
  type LiveStudent,
} from "@/hooks/use-student-tracking";
import type { TrackingStatus } from "@/lib/types/student-attendance-shared";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import {
  TRACKING_STATUS_ORDER,
  TRACKING_STATUS_STYLES,
} from "./tracking-status-styles";
import ChangeStatusModal from "./change-status-modal";

const fredoka = Fredoka({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const ROW_GRID =
  "grid grid-cols-[auto_minmax(0,1fr)_auto_auto] items-center gap-3 md:grid-cols-[auto_minmax(0,2fr)_minmax(0,1fr)_7.5rem_minmax(0,1.5fr)_auto]";

const formatTime = (value: string | Date) =>
  new Date(value).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });

const getInitials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

const describeLastScan = (student: LiveStudent) => {
  if (!student.statusAt) return "Not scanned today";
  const by =
    student.source === "manual" ? "Manual" : (student.scannedBy ?? "Scanner");
  return `${formatTime(student.statusAt)} · ${by}`;
};

export function LiveStatusMain() {
  // the store calls it "className", but it holds the class id
  const { location, name: search, className: classId } = useFilterStore();
  const [statusFilter, setStatusFilter] = useState<TrackingStatus | null>(null);
  const [changeTarget, setChangeTarget] = useState<LiveStudent | null>(null);
  const { data, isLoading, isFetching, error, refetch } = useLiveTracking();

  // location and class decide which students the cards count
  const scopedStudents = useMemo(
    () =>
      (data?.students ?? []).filter((student) => {
        const matchesLocation = location ? student.location === location : true;
        const matchesClass = classId ? student.class?.id === classId : true;
        return matchesLocation && matchesClass;
      }),
    [data, location, classId],
  );

  const counts = useMemo(() => {
    const result: Record<TrackingStatus, number> = {
      at_school: 0,
      on_bus: 0,
      off_campus: 0,
    };
    for (const student of scopedStudents) result[student.status] += 1;
    return result;
  }, [scopedStudents]);

  // the status cards and search only narrow the list, not the counts
  const visibleStudents = useMemo(() => {
    const term = search.trim().toLowerCase();
    return scopedStudents.filter((student) => {
      const matchesStatus = statusFilter
        ? student.status === statusFilter
        : true;
      const matchesName = term
        ? student.name.toLowerCase().includes(term)
        : true;
      return matchesStatus && matchesName;
    });
  }, [scopedStudents, statusFilter, search]);

  const onHandleStatusFilter = (status: TrackingStatus | null) =>
    setStatusFilter((prev) => (prev === status ? null : status));

  const onHandleRefresh = () => refetch();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner className="size-19" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-gray-500">
          {data?.updatedAt ? `Updated ${formatTime(data.updatedAt)}` : ""}
        </p>
        <Button
          variant="outline"
          onClick={onHandleRefresh}
          disabled={isFetching}
          className="h-10 cursor-pointer gap-2 rounded-sm"
        >
          <RefreshCwIcon
            className={`size-4 ${isFetching ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </div>

      {error && <p className="text-sm text-red-600">{error.message}</p>}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <button
          type="button"
          onClick={() => setStatusFilter(null)}
          aria-pressed={statusFilter === null}
          className={`flex cursor-pointer items-center gap-3 rounded-lg border-2 bg-white p-4 text-left transition-colors ${
            statusFilter === null
              ? "border-slate-800"
              : "border-gray-200 hover:border-gray-300"
          }`}
        >
          <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-slate-800 text-white">
            <UsersIcon className="size-5" />
          </span>
          <span>
            <span className="block text-[13px] font-medium text-gray-500">
              Total
            </span>
            <span
              className={`${fredoka.className} text-[28px] leading-none font-semibold text-slate-800`}
            >
              {scopedStudents.length}
            </span>
          </span>
        </button>

        {TRACKING_STATUS_ORDER.map((status) => {
          const style = TRACKING_STATUS_STYLES[status];
          const Icon = style.icon;
          const active = statusFilter === status;
          return (
            <button
              key={status}
              type="button"
              onClick={() => onHandleStatusFilter(status)}
              aria-pressed={active}
              className={`flex cursor-pointer items-center gap-3 rounded-lg border-2 bg-white p-4 text-left transition-colors ${
                active
                  ? style.cardActive
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <span
                className={`flex size-11 shrink-0 items-center justify-center rounded-full ${style.iconBg}`}
              >
                <Icon className="size-5" />
              </span>
              <span>
                <span className="block text-[13px] font-medium text-gray-500">
                  {style.label}
                </span>
                <span
                  className={`${fredoka.className} text-[28px] leading-none font-semibold text-slate-800`}
                >
                  {counts[status]}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      <div className="overflow-hidden rounded-lg border border-gray-300 bg-white shadow-sm">
        <div
          className={`${ROW_GRID} hidden border-b border-gray-200 bg-gray-50 px-4 py-2.5 text-[13px] font-bold text-[#777] md:grid`}
        >
          <span className="w-9" />
          <span>Student</span>
          <span>Class</span>
          <span>Status</span>
          <span>Last scan</span>
          <span className="w-18" />
        </div>

        {visibleStudents.length === 0 ? (
          <p className="px-4 py-10 text-center text-sm text-gray-500">
            No students match these filters.
          </p>
        ) : (
          <ul>
            {visibleStudents.map((student) => {
              const style = TRACKING_STATUS_STYLES[student.status];
              return (
                <li
                  key={student.id}
                  className={`${ROW_GRID} border-b border-gray-100 px-4 py-3 last:border-b-0`}
                >
                  <span className="flex size-9 items-center justify-center rounded-full bg-slate-100 text-[13px] font-semibold text-slate-700">
                    {getInitials(student.name)}
                  </span>

                  <div className="min-w-0">
                    <p
                      className={`${fredoka.className} truncate text-[15px] font-medium capitalize text-slate-800`}
                    >
                      {student.name}
                    </p>
                    {/* phones: class and last scan sit under the name */}
                    <p className="truncate text-xs text-gray-500 md:hidden">
                      {student.class?.name ?? "No class"} ·{" "}
                      {describeLastScan(student)}
                    </p>
                  </div>

                  <p className="hidden truncate text-sm text-slate-700 md:block">
                    {student.class?.name ?? "No class"}
                  </p>

                  <span
                    className={`w-fit rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap ${style.badge}`}
                  >
                    {style.label}
                  </span>

                  <p
                    className="hidden truncate text-sm text-gray-500 md:block"
                    title={student.reason ?? undefined}
                  >
                    {describeLastScan(student)}
                  </p>

                  <Button
                    variant="outline"
                    onClick={() => setChangeTarget(student)}
                    className="h-8 w-18 cursor-pointer rounded-sm px-3 text-xs"
                  >
                    Change
                  </Button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <ChangeStatusModal
        student={changeTarget}
        onClose={() => setChangeTarget(null)}
      />
    </div>
  );
}
