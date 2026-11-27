"use client";

import { useMemo } from "react";
import {
  CircleCheckIcon,
  CircleXIcon,
  ClockIcon,
  HourglassIcon,
} from "lucide-react";
import { useLiveTracking } from "@/hooks/use-student-tracking";
import { useDailyAttendance } from "@/hooks/use-student-attendance";
import type { TrackingStatus } from "@/lib/types/student-attendance-shared";
import {
  TRACKING_STATUS_ORDER,
  TRACKING_STATUS_STYLES,
} from "@/components/student-tracking/tracking-status-styles";
import StatCard, { SectionTitle } from "./stat-card";

const LIVE_HREF = "/admin-dashboard/tracking/live";
const ATTENDANCE_HREF = "/admin-dashboard/tracking/attendance";

// icon colors match DAY_STATUS_STYLES in attendance-status-styles.ts
const ATTENDANCE_CARDS = [
  {
    key: "present",
    label: "On time",
    icon: CircleCheckIcon,
    iconBg: "bg-green-100 text-green-700",
  },
  {
    key: "tardy",
    label: "Late",
    icon: ClockIcon,
    iconBg: "bg-amber-100 text-amber-700",
  },
  {
    key: "absent",
    label: "Absent",
    icon: CircleXIcon,
    iconBg: "bg-red-100 text-red-700",
  },
  {
    key: "not_arrived",
    label: "Not yet",
    icon: HourglassIcon,
    iconBg: "bg-gray-100 text-gray-600",
  },
] as const;

export default function TodayRow({ location }: { location: string }) {
  const live = useLiveTracking();
  const daily = useDailyAttendance({ location });

  const liveCounts = useMemo(() => {
    const result: Record<TrackingStatus, number> = {
      at_school: 0,
      on_bus: 0,
      off_campus: 0,
    };
    for (const student of live.data?.students ?? []) {
      if (student.location === location) result[student.status] += 1;
    }
    return result;
  }, [live.data, location]);

  const counts = daily.data?.counts;
  const noSchool = daily.data && !daily.data.isSchoolDay;

  return (
    <section className="space-y-3">
      <SectionTitle>Today</SectionTitle>

      {live.error && (
        <p className="text-sm text-red-600">{live.error.message}</p>
      )}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        {TRACKING_STATUS_ORDER.map((status) => {
          const style = TRACKING_STATUS_STYLES[status];
          return (
            <StatCard
              key={status}
              href={LIVE_HREF}
              label={style.label}
              value={liveCounts[status]}
              icon={style.icon}
              iconBg={style.iconBg}
              loading={live.isLoading}
            />
          );
        })}
      </div>

      {daily.error ? (
        <p className="text-sm text-red-600">{daily.error.message}</p>
      ) : noSchool ? (
        <p className="rounded-lg border border-gray-300 bg-white px-4 py-6 text-center text-sm text-gray-500 shadow-sm">
          No school today, so there is no attendance to count.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {ATTENDANCE_CARDS.map((card) => (
            <StatCard
              key={card.key}
              href={ATTENDANCE_HREF}
              label={card.label}
              value={counts?.[card.key] ?? 0}
              icon={card.icon}
              iconBg={card.iconBg}
              loading={daily.isLoading}
            />
          ))}
        </div>
      )}
    </section>
  );
}
