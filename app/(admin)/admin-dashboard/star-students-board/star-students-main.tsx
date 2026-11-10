"use client";

import { useMemo } from "react";
import Image from "next/image";
import { Fredoka } from "next/font/google";
import { Spinner } from "@/components/ui/spinner";
import { useFilterStore } from "@/store/filterStore";
import { useFetchHonorStudents } from "@/hooks/use-student-grades";
import StudentClassSelect from "./student-class-select";
import SelectHonorListing from "./select-honor-listing";
import StudentPeriodSelect from "./student-period-select";
import StudentLocationSelect from "./student-location-select";
import StarStudentsRecord from "./star-students-record";

const fredoka = Fredoka({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const isNurseryClass = (className: string) =>
  className.toLowerCase().includes("nursery");

export default function StarStudentsMain() {
  // the store calls it "className", but it holds the class id
  const {
    className: classId,
    periodId,
    academicListing,
    location,
  } = useFilterStore();

  const {
    data: students,
    isLoading: studentsLoader,
    error: studentsError,
  } = useFetchHonorStudents();

  // filter, adjust and rank on screen, so changing a filter is instant
  const filteredStudents = useMemo(() => {
    if (!students || !classId) return [];

    return students
      .filter((student: any) => {
        const matchesClass = student.class_id === classId;
        const matchesPeriod = !periodId || student.period_id === periodId;
        const matchesListing =
          !academicListing || student.honor_category === academicListing;
        const matchesLocation = !location || student.location === location;

        return (
          matchesClass && matchesPeriod && matchesListing && matchesLocation
        );
      })
      .map((student: any) => {
        // nursery classes are ranked by count, everyone else by average
        const isNursery = isNurseryClass(student.class_name);

        return {
          ...student,
          avg_numeric: isNursery ? null : student.avg_numeric,
          count_as: isNursery ? student.count_as : null,
        };
      })
      .sort((a: any, b: any) => {
        if (a.avg_numeric != null || b.avg_numeric != null) {
          return (b.avg_numeric || 0) - (a.avg_numeric || 0);
        }
        return (b.count_as || 0) - (a.count_as || 0);
      });
  }, [students, classId, periodId, academicListing, location]);

  return (
    <>
      <div className="mt-10.25 grid w-full grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="w-full sm:max-w-90 md:max-w-108">
          <StudentClassSelect />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <SelectHonorListing />
          <StudentPeriodSelect />

          <div className="col-span-2 grid">
            <StudentLocationSelect />
          </div>
        </div>
      </div>

      {!classId ? (
        <div
          className={`mt-15 flex w-full flex-col items-center justify-center gap-2 text-[22px] font-semibold text-slate-800 ${fredoka.className}`}
        >
          <Image
            src="/images/undraw_my-answer_au1h.svg"
            alt="empty rooster image"
            width={300}
            height={300}
            className="h-auto w-56 md:w-64 lg:size-66"
            preload
            quality={75}
            sizes="(max-width: 640px) 160px, (max-width: 768px) 224px, (max-width: 1024px) 256px, 264px"
          />

          <h1 className="text-center text-[22px] font-semibold md:text-[26px]">
            Choose a class to display the student roster.
          </h1>
        </div>
      ) : studentsLoader ? (
        <div className="mt-32.5 flex w-full items-center justify-center">
          <Spinner className="size-19" />
        </div>
      ) : studentsError ? (
        <p className="mt-7 text-sm text-red-600">
          Error fetching data: {studentsError.message}
        </p>
      ) : (
        <div className="mt-7">
          <StarStudentsRecord
            data={filteredStudents}
            classId={classId}
            periodId={periodId}
            academicListing={academicListing}
          />
        </div>
      )}
    </>
  );
}
