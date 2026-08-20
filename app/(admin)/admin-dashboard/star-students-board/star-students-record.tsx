"use client";

import { Fredoka } from "next/font/google";
import { Button } from "@/components/ui/button";
import { FaPrint } from "react-icons/fa6";
import { useReactToPrint } from "react-to-print";
import { useMemo, useRef } from "react";
import * as motion from "motion/react-client";
import { useFetchPeriodById } from "@/hooks/use-periods";
import { useFetchClassById } from "@/hooks/use-classes";
import { Star } from "lucide-react";

const fredoka = Fredoka({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

interface Student {
  student_id: string;
  first_name: string;
  last_name: string;
  class_id: string;
  class_name: string;
  honor_category: string;
  period_number?: number;
  avg_numeric: number;
}

interface StarStudentsRecordProps {
  data: Student[];
  classId?: string;
  periodId?: string;
  academicListing?: string;
}

const academicListingLabels: Record<string, string> = {
  principals_list: "Principal's List",
  honor_roll: "Honor Roll",
};

export default function StarStudentsRecord(props: StarStudentsRecordProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const { data: classData } = useFetchClassById(props.classId ?? null);
  const { data: periodData } = useFetchPeriodById(props.periodId as string);

  const periodName = periodData?.period;
  const className = classData?.class?.name;

  const onHandlePrint = useReactToPrint({
    contentRef: contentRef,
    documentTitle: "Student Grades",
  });

  // Logic to remove duplicates based on student_id
  const uniqueStudents = useMemo(() => {
    const seen = new Set();
    return props.data.filter((student) => {
      const duplicate = seen.has(student.student_id);
      seen.add(student.student_id);
      return !duplicate;
    });
  }, [props.data]);

  const gradeSuffixes: { [key: number]: string } = {
    1: "st",
    2: "nd",
    3: "rd",
    4: "th",
    5: "th",
    6: "th",
  };

  return (
    <>
      <div className="mb-5 md:pl-15">
        <Button
          className="h-11 w-40 cursor-pointer rounded bg-slate-800 transition-none"
          asChild
        >
          <motion.button
            className="text-[12px] tracking-wide"
            whileTap={{ scale: 0.85 }}
            onClick={onHandlePrint}
          >
            <FaPrint className="transition-transform duration-200 group-hover:translate-x-0.5" />
            Print Record
          </motion.button>
        </Button>
      </div>
      <div ref={contentRef} className="flex items-center justify-center">
        <div className="relative flex items-center justify-center rounded-md border border-gray-300 shadow-sm md:w-198 print:mt-6">
          <Star className="absolute top-2 left-2 size-10 text-[#D1B200]" />
          <Star className="absolute top-2 right-2 size-10  text-[#D1B200]" />
          <Star className="absolute bottom-2 left-2 size-10  text-[#D1B200]" />
          <Star className="absolute right-2 bottom-2 size-10  text-[#D1B200]" />
          <div className="print-scroll-area p-3 text-[#4a4442]">
            <p
              className={`${fredoka.className} text-center text-[14px] font-semibold md:text-[23px]`}
            >
              {className}, {periodName}
              <sup className="text-xs">
                {gradeSuffixes[periodName] || ""}
              </sup>{" "}
              Period{" "}
              {academicListingLabels[props.academicListing ?? ""] ??
                props.academicListing}{" "}
              Students
            </p>

            <div className="mt-4 flex flex-col items-center justify-center gap-2 font-medium">
              {uniqueStudents.length > 0 ? (
                uniqueStudents.map((student) => (
                  <div
                    key={student.student_id}
                    className="flex items-center justify-center text-[17px]"
                  >
                    <p>
                      {student.first_name} {student.last_name}
                    </p>
                    {!student.class_name.toLowerCase().includes("nursery") && (
                      <span className="ml-3 text-[15px] text-gray-500 italic">
                        - ({student.avg_numeric}%)
                      </span>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-gray-400 italic">No students found</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
