"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useQueries } from "@tanstack/react-query";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  useAttendanceSettings,
  useAttendanceSummary,
  type AttendanceSummary,
} from "@/hooks/use-student-attendance";
import {
  ATTENDANCE_URL,
  apiRequest,
  attendanceKeys,
  toQuery,
} from "@/lib/types/student-attendance-shared";
import {
  addDays,
  formatDay,
  getMonday,
  getSchoolToday,
} from "@/lib/attendance-dates";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Spinner } from "@/components/ui/spinner";
import { SectionTitle } from "./stat-card";

// one summary request per week, so keep the chart to the latest weeks
const MAX_WEEKS = 16;
const MOST_ABSENT_COUNT = 5;
const ATTENDANCE_HREF = "/admin-dashboard/tracking/attendance";

const chartConfig = {
  rate: { label: "Attendance", color: "var(--color-green-600)" },
} satisfies ChartConfig;

// the Mondays from the term start to this week, the latest MAX_WEEKS of them
function listWeeks(startDate: string, today: string) {
  const weeks: string[] = [];
  for (
    let monday = getMonday(startDate);
    monday <= today;
    monday = addDays(monday, 7)
  ) {
    weeks.push(monday);
  }
  return weeks.slice(-MAX_WEEKS);
}

// share of school days the students came in (on time or late)
function attendanceRate(summary: AttendanceSummary) {
  let attended = 0;
  let schoolDays = 0;
  for (const student of summary.students) {
    attended += student.present + student.tardy;
    schoolDays += student.schoolDays;
  }
  return schoolDays ? Math.round((attended / schoolDays) * 1000) / 10 : null;
}

export default function AttendanceTrendRow({ location }: { location: string }) {
  const settings = useAttendanceSettings(location);
  const startDate = settings.data?.startDate ?? null;
  const today = getSchoolToday();

  return (
    <section className="space-y-3">
      <SectionTitle>Attendance this term</SectionTitle>

      {settings.isLoading ? (
        <div className="flex justify-center py-10">
          <Spinner className="size-14" />
        </div>
      ) : settings.error ? (
        <p className="text-sm text-red-600">{settings.error.message}</p>
      ) : !startDate || startDate > today ? (
        <p className="rounded-lg border border-gray-300 bg-white px-4 py-6 text-center text-sm text-gray-500 shadow-sm">
          {startDate
            ? `Attendance starts counting on ${formatDay(startDate, { month: "long", day: "numeric" })}.`
            : `Attendance isn't set up for ${location} yet. `}
          {!startDate && (
            <Link
              href={ATTENDANCE_HREF}
              className="font-medium text-slate-800 underline"
            >
              Set it up
            </Link>
          )}
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
          <TrendChart location={location} startDate={startDate} today={today} />
          <MostAbsentList
            location={location}
            startDate={startDate}
            today={today}
          />
        </div>
      )}
    </section>
  );
}

function TrendChart({
  location,
  startDate,
  today,
}: {
  location: string;
  startDate: string;
  today: string;
}) {
  const weeks = useMemo(() => listWeeks(startDate, today), [startDate, today]);

  // same key and request as useAttendanceSummary, so the cache is shared
  const results = useQueries({
    queries: weeks.map((monday) => {
      const query = {
        from: monday < startDate ? startDate : monday,
        to: addDays(monday, 6) > today ? today : addDays(monday, 6),
        location,
        classId: undefined,
      };
      return {
        queryKey: attendanceKeys.summary(query),
        queryFn: () =>
          apiRequest<AttendanceSummary>(
            `${ATTENDANCE_URL}/summary${toQuery(query)}`,
            "Failed to load attendance summary",
          ),
        staleTime: 1000 * 60,
        retry: 1,
      };
    }),
  });

  const isLoading = results.some((result) => result.isLoading);
  const error = results.find((result) => result.error)?.error;

  // weeks with no school days (holidays) are left out
  const data = results.flatMap((result, index) => {
    const rate = result.data ? attendanceRate(result.data) : null;
    return rate === null
      ? []
      : [
          {
            week: formatDay(weeks[index], { month: "short", day: "numeric" }),
            rate,
          },
        ];
  });

  return (
    <div className="rounded-lg border border-gray-300 bg-white p-4 shadow-sm lg:col-span-2">
      <p className="text-[13px] font-bold text-[#777]">
        Weekly attendance rate
      </p>
      <p className="mb-3 text-xs text-gray-500">
        Students on time or late, as a share of school days
      </p>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Spinner className="size-10" />
        </div>
      ) : error ? (
        <p className="text-sm text-red-600">{error.message}</p>
      ) : data.length === 0 ? (
        <p className="flex h-64 items-center justify-center text-sm text-gray-500">
          No school days counted yet.
        </p>
      ) : (
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-64 w-full"
        >
          <AreaChart data={data} margin={{ left: 0, right: 12, top: 8 }}>
            <defs>
              <linearGradient id="fillRate" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-rate)"
                  stopOpacity={0.35}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-rate)"
                  stopOpacity={0.05}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="week"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={24}
            />
            <YAxis
              domain={[0, 100]}
              tickLine={false}
              axisLine={false}
              tickMargin={4}
              width={40}
              tickFormatter={(value) => `${value}%`}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(label) => `Week of ${label}`}
                  formatter={(value) => (
                    <span className="flex w-full justify-between gap-4">
                      <span className="text-muted-foreground">Attendance</span>
                      <span className="font-mono font-medium">{value}%</span>
                    </span>
                  )}
                />
              }
            />
            <Area
              dataKey="rate"
              type="monotone"
              stroke="var(--color-rate)"
              strokeWidth={2}
              fill="url(#fillRate)"
              dot={{ r: 3, fill: "var(--color-rate)" }}
            />
          </AreaChart>
        </ChartContainer>
      )}
    </div>
  );
}

function MostAbsentList({
  location,
  startDate,
  today,
}: {
  location: string;
  startDate: string;
  today: string;
}) {
  const { data, isLoading, error } = useAttendanceSummary({
    from: startDate,
    to: today,
    location,
  });

  const students = useMemo(
    () =>
      (data?.students ?? [])
        .filter((student) => student.absent > 0)
        .sort((a, b) => b.absent - a.absent)
        .slice(0, MOST_ABSENT_COUNT),
    [data],
  );

  return (
    <div className="overflow-hidden rounded-lg border border-gray-300 bg-white shadow-sm">
      <div className="border-b border-gray-200 bg-gray-50 px-4 py-2.5 text-[13px] font-bold text-[#777]">
        Absent most often
      </div>

      {isLoading ? (
        <div className="flex justify-center py-10">
          <Spinner className="size-10" />
        </div>
      ) : error ? (
        <p className="px-4 py-6 text-sm text-red-600">{error.message}</p>
      ) : students.length === 0 ? (
        <p className="px-4 py-10 text-center text-sm text-gray-500">
          No absences this term.
        </p>
      ) : (
        <ul>
          {students.map((student) => (
            <li
              key={student.id}
              className="border-b border-gray-100 last:border-b-0"
            >
              <Link
                href={`/admin-dashboard/student-detail?studentId=${student.id}`}
                className="flex items-center justify-between gap-3 px-4 py-3 transition-colors hover:bg-gray-50"
              >
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium text-slate-800">
                    {student.name}
                  </span>
                  <span className="block truncate text-xs text-gray-500">
                    {student.class?.name ?? "No class"}
                  </span>
                </span>
                <span className="shrink-0 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-700">
                  {student.absent} of {student.schoolDays} days
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
