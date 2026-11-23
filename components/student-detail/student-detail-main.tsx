"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Fredoka } from "next/font/google";
import * as motion from "motion/react-client";
import {
  ArrowRightIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  GraduationCapIcon,
  House,
  MailIcon,
  MapPinIcon,
  PhoneIcon,
  RefreshCwIcon,
  SmileIcon,
  UserIcon,
  UsersIcon,
} from "lucide-react";
import { useFetchStudentById } from "@/hooks/use-students";
import { useFetchClasses } from "@/hooks/use-classes";
import {
  useLiveTracking,
  useStudentEvents,
} from "@/hooks/use-student-tracking";
import {
  useAttendanceSettings,
  useStudentAttendance,
  type StudentAttendanceDay,
} from "@/hooks/use-student-attendance";
import type { AttendanceStatus } from "@/lib/types/student-attendance-shared";
import {
  addDays,
  formatArrival,
  formatDay,
  getMonday,
  getSchoolToday,
} from "@/lib/attendance-dates";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { TRACKING_STATUS_STYLES } from "@/components/student-tracking/tracking-status-styles";
import {
  ATTENDANCE_STATUS_ORDER,
  DAY_STATUS_STYLES,
} from "@/components/student-tracking/attendance-status-styles";

const fredoka = Fredoka({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const CARD = "rounded-lg border border-gray-300 bg-white p-4 shadow-sm md:p-5";

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

const hasText = (value?: string | null) => !!value && value.trim() !== "";

interface StudentDetailMainProps {
  // e.g. "/admin-dashboard/students"; the class id is appended
  studentsHref: string;
  // e.g. "/admin-dashboard/view-student-grade"
  gradesHref: string;
}

export default function StudentDetailMain({
  studentsHref,
  gradesHref,
}: StudentDetailMainProps) {
  const searchParams = useSearchParams();
  const studentId = searchParams.get("studentId");

  const {
    data: studentData,
    error: studentError,
    isLoading: studentLoading,
  } = useFetchStudentById(studentId);
  const { data: classesData, isLoading: classesLoading } = useFetchClasses();

  const student = studentData?.students;
  const classId: string | null = student?.classesId ?? null;
  const className =
    classesData?.classes?.find(
      (cls: { id: string; name: string }) => cls.id === classId,
    )?.name ?? "No class";

  const backHref = classId ? `${studentsHref}/${classId}` : studentsHref;

  if (studentLoading || classesLoading) {
    return (
      <div className="mt-32.5 flex w-full items-center justify-center">
        <Spinner className="size-19" />
      </div>
    );
  }

  if (!studentId || studentError || !student) {
    return (
      <div className="space-y-4">
        <BackLink href={backHref} />
        <div className={`${CARD} text-center text-gray-500`}>
          {!studentId
            ? "No student selected."
            : (studentError?.message ?? "Student not found.")}
        </div>
      </div>
    );
  }

  const fullName = `${student.firstName} ${student.lastName}`;
  const gradesParams = new URLSearchParams({ studentId });
  if (classId) gradesParams.set("classId", classId);

  return (
    <div className="space-y-5">
      <BackLink href={backHref} />

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-4">
          <span
            className={`${fredoka.className} flex size-16 shrink-0 items-center justify-center rounded-full bg-slate-800 text-[22px] font-semibold text-white`}
          >
            {getInitials(fullName)}
          </span>
          <div className="min-w-0">
            <h1
              className={`${fredoka.className} truncate text-[29px] font-semibold capitalize md:text-[35px]`}
            >
              {fullName}
            </h1>
            <p className="text-sm text-gray-500 capitalize">
              {className}
              {hasText(student.location) && ` · ${student.location}`}
            </p>
          </div>
        </div>

        <motion.div whileTap={{ scale: 0.9 }} className="max-sm:w-full">
          <Link
            href={`${gradesHref}?${gradesParams.toString()}`}
            className="group flex h-12.5 w-full items-center justify-center gap-2 rounded-md bg-slate-800 px-6 text-[16px] font-medium tracking-wide text-white hover:bg-slate-700"
          >
            View Grades
            <ArrowRightIcon
              strokeWidth={2.25}
              className="size-5 transition-transform duration-200 group-hover:translate-x-0.5"
            />
          </Link>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <section className={CARD}>
          <CardTitle>Student Info</CardTitle>
          <dl className="space-y-3">
            <InfoRow icon={UserIcon} label="Name" value={fullName} />
            <InfoRow icon={GraduationCapIcon} label="Class" value={className} />
            <InfoRow
              icon={MapPinIcon}
              label="Location"
              value={hasText(student.location) ? student.location : null}
            />
            <InfoRow
              icon={SmileIcon}
              label="Conduct"
              value={hasText(student.conduct) ? student.conduct : null}
            />
          </dl>
        </section>

        <section className={CARD}>
          <CardTitle>Parent / Guardian</CardTitle>
          {!hasText(student.parentName) &&
          !hasText(student.parentContact) &&
          !hasText(student.parentEmail) ? (
            <p className="py-6 text-center text-sm text-gray-500">
              No parent info on file.
            </p>
          ) : (
            <dl className="space-y-3">
              <InfoRow
                icon={UsersIcon}
                label="Name"
                value={hasText(student.parentName) ? student.parentName : null}
              />
              <InfoRow
                icon={PhoneIcon}
                label="Phone"
                value={
                  hasText(student.parentContact) ? student.parentContact : null
                }
                href={
                  hasText(student.parentContact)
                    ? `tel:${student.parentContact.replace(/\s+/g, "")}`
                    : undefined
                }
              />
              <InfoRow
                icon={MailIcon}
                label="Email"
                value={
                  hasText(student.parentEmail) ? student.parentEmail : null
                }
                href={
                  hasText(student.parentEmail)
                    ? `mailto:${student.parentEmail}`
                    : undefined
                }
                lowercase
              />
            </dl>
          )}
        </section>

        <LiveStatusCard studentId={studentId} />

        <AttendanceCard
          studentId={studentId}
          location={hasText(student.location) ? student.location : null}
        />
      </div>
    </div>
  );
}

function BackLink({ href }: { href: string }) {
  return (
    <div className="flex w-full items-end justify-end">
      <motion.div
        whileTap={{ scale: 0.85, rotate: 45 }}
        whileHover={{ scale: 1.08 }}
        transition={{ type: "spring", stiffness: 400, damping: 15 }}
      >
        <Link
          href={href}
          aria-label="Back to class roster"
          className="block cursor-pointer hover:text-red-700"
        >
          <House className="size-16" />
        </Link>
      </motion.div>
    </div>
  );
}

function CardTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2
      className={`${fredoka.className} mb-4 text-[20px] font-semibold text-slate-800`}
    >
      {children}
    </h2>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
  href,
  lowercase,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | null;
  href?: string;
  lowercase?: boolean;
}) {
  const text = value ?? "Not provided yet";
  return (
    <div className="flex items-center gap-3">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-700">
        <Icon className="size-4" />
      </span>
      <div className="min-w-0">
        <dt className="text-[13px] font-medium text-gray-500">{label}</dt>
        <dd
          className={`truncate text-[15px] ${value ? "text-slate-800" : "text-gray-400"} ${lowercase ? "" : "capitalize"}`}
        >
          {href && value ? (
            <a href={href} className="hover:text-cyan-700 hover:underline">
              {text}
            </a>
          ) : (
            text
          )}
        </dd>
      </div>
    </div>
  );
}

function LiveStatusCard({ studentId }: { studentId: string }) {
  const today = useMemo(getSchoolToday, []);
  const { data, isLoading, isFetching, error, refetch } = useLiveTracking();
  const { data: events, error: eventsError } = useStudentEvents(studentId, {
    from: today,
    to: today,
  });

  const live = data?.students.find((s) => s.id === studentId) ?? null;
  const style = live ? TRACKING_STATUS_STYLES[live.status] : null;
  const Icon = style?.icon;

  const lastScan = live?.statusAt
    ? `${formatTime(live.statusAt)} · ${
        live.source === "manual" ? "Manual" : (live.scannedBy ?? "Scanner")
      }`
    : "Not scanned today";

  return (
    <section className={CARD}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2
          className={`${fredoka.className} text-[20px] font-semibold text-slate-800`}
        >
          Live Status
        </h2>
        <Button
          variant="outline"
          onClick={() => refetch()}
          disabled={isFetching}
          className="h-9 cursor-pointer gap-2 rounded-sm"
        >
          <RefreshCwIcon
            className={`size-4 ${isFetching ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <Spinner className="size-8" />
        </div>
      ) : error ? (
        <p className="text-sm text-red-600">{error.message}</p>
      ) : (
        <>
          <div
            className={`flex items-center gap-3 rounded-lg border-2 p-4 ${
              style ? style.cardActive : "border-gray-200"
            }`}
          >
            <span
              className={`flex size-11 shrink-0 items-center justify-center rounded-full ${
                style ? style.iconBg : "bg-gray-100 text-gray-500"
              }`}
            >
              {Icon ? (
                <Icon className="size-5" />
              ) : (
                <UserIcon className="size-5" />
              )}
            </span>
            <div className="min-w-0">
              <p
                className={`${fredoka.className} text-[22px] leading-tight font-semibold text-slate-800`}
              >
                {style?.label ?? "Unknown"}
              </p>
              <p className="truncate text-sm text-gray-500">
                Last scan: {lastScan}
              </p>
              {hasText(live?.reason) && (
                <p className="truncate text-sm text-gray-500">
                  Reason: {live?.reason}
                </p>
              )}
            </div>
          </div>

          <p className="mt-2 text-xs text-gray-400">
            {data?.updatedAt ? `Updated ${formatTime(data.updatedAt)}` : ""}
          </p>

          <h3 className="mt-4 mb-2 text-[13px] font-bold text-[#777]">
            Today&apos;s movement
          </h3>
          {eventsError ? (
            <p className="text-sm text-red-600">{eventsError.message}</p>
          ) : !events || events.length === 0 ? (
            <p className="text-sm text-gray-500">No scans yet today.</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {events.map((event) => {
                const eventStyle = TRACKING_STATUS_STYLES[event.status];
                const scanner =
                  event.source === "manual"
                    ? "Manual"
                    : [event.scannerFirstName, event.scannerLastName]
                        .filter(Boolean)
                        .join(" ") || "Scanner";
                return (
                  <li
                    key={event.id}
                    className="flex items-center justify-between gap-3 py-2"
                  >
                    <span className="w-16 shrink-0 text-sm text-slate-700">
                      {formatTime(event.scannedAt)}
                    </span>
                    <span
                      className={`w-fit rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap ${eventStyle.badge}`}
                    >
                      {eventStyle.label}
                    </span>
                    <span
                      className="min-w-0 flex-1 truncate text-right text-sm text-gray-500 capitalize"
                      title={event.reason ?? undefined}
                    >
                      {scanner}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </>
      )}
    </section>
  );
}

function AttendanceCard({
  studentId,
  location,
}: {
  studentId: string;
  location: string | null;
}) {
  const today = useMemo(getSchoolToday, []);
  const thisMonday = getMonday(today);
  const [weekStart, setWeekStart] = useState(thisMonday);
  const weekEnd = addDays(weekStart, 4);

  const { data: settings, isLoading: settingsLoading } =
    useAttendanceSettings(location);
  // without settings (or access to them), count from the start of the year
  const termStart = settings?.startDate ?? `${today.slice(0, 4)}-01-01`;
  const firstMonday = getMonday(termStart);

  const { data, isLoading, error } = useStudentAttendance(studentId, {
    from: settingsLoading ? null : termStart,
    to: today,
  });

  const daysByDate = useMemo(() => {
    const map = new Map<string, StudentAttendanceDay>();
    for (const day of data?.days ?? []) map.set(day.date, day);
    return map;
  }, [data]);

  const totals = useMemo(() => {
    const counts: Record<AttendanceStatus, number> = {
      present: 0,
      tardy: 0,
      absent: 0,
      excused: 0,
      sick: 0,
    };
    for (const day of data?.days ?? []) {
      if ((ATTENDANCE_STATUS_ORDER as string[]).includes(day.status)) {
        counts[day.status as AttendanceStatus] += 1;
      }
    }
    const schoolDays = Object.values(counts).reduce((sum, n) => sum + n, 0);
    return { counts, schoolDays };
  }, [data]);

  const weekDates = Array.from({ length: 5 }, (_, i) => addDays(weekStart, i));

  return (
    <section className={`${CARD} lg:col-span-2`}>
      <CardTitle>Attendance</CardTitle>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Button
          variant="outline"
          onClick={() => setWeekStart((prev) => addDays(prev, -7))}
          disabled={weekStart <= firstMonday}
          aria-label="Previous week"
          className="h-10 w-10 cursor-pointer rounded-sm p-0"
        >
          <ChevronLeftIcon className="size-5" />
        </Button>
        <Button
          variant="outline"
          onClick={() => setWeekStart(thisMonday)}
          disabled={weekStart === thisMonday}
          className="h-10 cursor-pointer rounded-sm px-4"
        >
          This week
        </Button>
        <Button
          variant="outline"
          onClick={() => setWeekStart((prev) => addDays(prev, 7))}
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
      </div>

      {settingsLoading || isLoading ? (
        <div className="flex justify-center py-8">
          <Spinner className="size-8" />
        </div>
      ) : error ? (
        <p className="text-sm text-red-600">{error.message}</p>
      ) : (
        <>
          <div className="grid grid-cols-5 gap-1.5 md:gap-3">
            {weekDates.map((date) => {
              const day = daysByDate.get(date);
              const status = day?.status ?? "upcoming";
              const style = DAY_STATUS_STYLES[status];
              return (
                <div key={date} className="text-center">
                  <p
                    className={`text-[13px] font-bold ${
                      date === today ? "text-slate-800" : "text-[#777]"
                    }`}
                  >
                    {formatDay(date, { weekday: "short" })}
                  </p>
                  <p className={`${fredoka.className} mb-1.5 text-[17px]`}>
                    {formatDay(date, { day: "numeric" })}
                  </p>
                  <div
                    title={day?.reason ?? undefined}
                    className={`flex h-14 w-full flex-col items-center justify-center rounded-md border text-xs font-medium ${
                      status === "upcoming" || status === "not_enrolled"
                        ? "border-dashed border-gray-200 text-gray-300"
                        : style.cell
                    }`}
                  >
                    {style.label || "—"}
                    {status === "tardy" && day?.firstArrivalAt && (
                      <span className="text-[10px] font-normal">
                        {formatArrival(day.firstArrivalAt)}
                      </span>
                    )}
                    {day?.source === "manual" && (
                      <span className="text-[10px] font-normal opacity-75">
                        Edited
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-gray-100 pt-4">
            <span className="mr-1 text-[13px] font-bold text-[#777]">
              Since {formatDay(termStart, { day: "numeric", month: "short" })}:
            </span>
            {ATTENDANCE_STATUS_ORDER.map((status) => {
              const style = DAY_STATUS_STYLES[status];
              return (
                <span
                  key={status}
                  className="inline-flex items-center gap-1.5 rounded-full border border-gray-300 bg-white px-3 py-1 text-xs font-medium text-slate-700"
                >
                  <span className={`size-2 rounded-full ${style.dot}`} />
                  {style.label} {totals.counts[status]}
                </span>
              );
            })}
            <span className="text-xs text-gray-500">
              · {totals.schoolDays} school days
            </span>
          </div>
        </>
      )}
    </section>
  );
}
