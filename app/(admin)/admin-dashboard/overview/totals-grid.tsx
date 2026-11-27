"use client";

import { useState } from "react";
import { Fredoka } from "next/font/google";
import { GiTeacher } from "react-icons/gi";
import { PiStudent } from "react-icons/pi";
import { RiParentFill } from "react-icons/ri";
import { SiGoogleclassroom } from "react-icons/si";
import { CalendarRangeIcon, PencilIcon, ScanLine } from "lucide-react";
import { useFetchStudents } from "@/hooks/use-students";
import { useFetchTeachers } from "@/hooks/use-teacher";
import { useFetchParentsWithStudents } from "@/hooks/use-parent";
import { useFetchScanners } from "@/hooks/use-scanner";
import { useFetchClasses } from "@/hooks/use-classes";
import { useAcademicSettings } from "@/hooks/use-academic-settings";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import StatCard, { SectionTitle } from "./stat-card";
import EditTermModal from "./edit-term-modal";

const fredoka = Fredoka({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export default function TotalsGrid() {
  const students = useFetchStudents();
  const teachers = useFetchTeachers();
  const parents = useFetchParentsWithStudents();
  const scanners = useFetchScanners();
  const classes = useFetchClasses();

  const cards = [
    {
      label: "Students",
      href: "/admin-dashboard/students",
      icon: PiStudent,
      query: students,
      count: students.data?.length,
    },
    {
      label: "Teachers",
      href: "/admin-dashboard/teachers",
      icon: GiTeacher,
      query: teachers,
      count: teachers.data?.length,
    },
    {
      label: "Parents",
      href: "/admin-dashboard/parents",
      icon: RiParentFill,
      query: parents,
      count: parents.data?.length,
    },
    {
      label: "Scanners",
      href: "/admin-dashboard/scanners",
      icon: ScanLine,
      query: scanners,
      count: scanners.data?.length,
    },
    {
      label: "Classes",
      href: "/admin-dashboard/classes",
      icon: SiGoogleclassroom,
      query: classes,
      count: classes.data?.classes?.length,
    },
  ];

  return (
    <section className="space-y-3">
      <SectionTitle>School</SectionTitle>
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,3fr)]">
        <CurrentTermCard />
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
          {cards.map((card) => (
            <StatCard
              key={card.label}
              href={card.href}
              label={card.label}
              value={card.query.error ? "–" : card.count}
              icon={card.icon}
              iconBg="bg-slate-800 text-white"
              loading={card.query.isLoading}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function CurrentTermCard() {
  const { data, isLoading, error } = useAcademicSettings();
  const [open, setOpen] = useState(false);

  const period = data?.currentPeriod?.period;

  return (
    <div className="flex items-center gap-3 rounded-lg border-2 border-gray-200 bg-white p-4">
      <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-sky-100 text-sky-700">
        <CalendarRangeIcon className="size-5" />
      </span>
      <div className="min-w-0 flex-1">
        <span className="block text-[13px] font-medium text-gray-500">
          Current term
        </span>
        {isLoading ? (
          <Skeleton className="mt-1 h-7 w-32" />
        ) : error ? (
          <span className="text-sm text-red-600">{error.message}</span>
        ) : (
          <span
            className={`${fredoka.className} block text-[22px] leading-tight font-semibold text-slate-800`}
          >
            {period ? `Period ${period}` : "No period set"}
            <span className="block text-[15px] font-medium text-gray-500">
              {data?.currentSemester ?? "No semester set"}
            </span>
          </span>
        )}
      </div>
      <Button
        variant="outline"
        size="icon"
        onClick={() => setOpen(true)}
        disabled={isLoading}
        aria-label="Change the current term"
        className="cursor-pointer rounded-sm"
      >
        <PencilIcon className="size-4" />
      </Button>
      {data && (
        <EditTermModal open={open} onOpenChange={setOpen} settings={data} />
      )}
    </div>
  );
}
