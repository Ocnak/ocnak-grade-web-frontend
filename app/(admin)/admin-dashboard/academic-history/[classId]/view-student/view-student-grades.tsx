"use client";

import { Tinos } from "next/font/google";
import GradesRecord from "./grades-record";
import { useFetchArchivedStudentById } from "@/hooks/use-archived-students";
import { useFetchClasses } from "@/hooks/use-classes";
import { Spinner } from "@/components/ui/spinner";
import { FaSchoolCircleCheck } from "react-icons/fa6";
import { useMemo } from "react";

const tinos = Tinos({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

interface ViewStudentGradeProps {
  studentId: string;
  contentRef: React.RefObject<HTMLDivElement | null>;
}

export default function ViewStudentGrade(props: ViewStudentGradeProps) {
  const {
    data: studentData,
    error: studentDataError,
    isLoading: studentDataLoader,
  } = useFetchArchivedStudentById(props.studentId);

  const {
    data,
    isLoading: classesLoader,
    error: classesError,
  } = useFetchClasses();

  const classes = data?.classes;

  const className = useMemo(() => {
    return classes?.find(
      (cls: { id: string; name: string }) => cls.id === studentData?.classId,
    )?.name;
  }, [classes, studentData?.classId]);

  if (studentDataLoader || classesLoader) {
    return (
      <div className="flex  items-center justify-center py-6">
        <Spinner className="size-12" />
      </div>
    );
  }

  if (studentDataError)
    return <div>Error fetching student data: {studentDataError.message}</div>;

  if (classesError)
    return <div>Error fetching student data: {classesError.message}</div>;

  if (!studentData?.classId) {
    return <div>Error fetching student data, refresh the browser</div>;
  }

  return (
    <div
      className={`${tinos.className} h-full px-3 py-3 text-[#4a4442] antialiased sm:px-4 md:px-3`}
    >
      <div className="mx-auto my-3 w-full max-w-170 gap-0 border px-3 py-4 sm:my-5 sm:px-4 rounded-md sm:rounded-xl  md:border-gray-300 md:p-6 md:shadow-lg">
        {/* Header — stacks on mobile, sits side-by-side from sm up */}
        <div className="mt-1 flex flex-col items-center gap-2 px-1 text-center sm:mt-3 sm:flex-row sm:gap-0 sm:px-3 sm:text-left">
          <div className="flex w-full flex-col items-center justify-center">
            <h1 className="text-center text-[15px] leading-tight font-semibold sm:text-[16px] md:text-[18px]">
              School Grade Tracking System
            </h1>
            <p className="text-[12px] sm:text-[13px] md:text-[14px]">
              Monrovia, Liberia
            </p>
            <p className="text-[12px] font-bold sm:text-[13px] md:text-[14px]">
              {className} -{" "}
              <span>
                {studentData.firstName} {studentData.lastName}
              </span>
            </p>
          </div>

          <FaSchoolCircleCheck className="size-12 shrink-0 sm:size-16 md:size-20" />
        </div>

        <section className="mt-4 items-center justify-center overflow-x-auto sm:mt-6 md:flex">
          <GradesRecord
            studentId={props.studentId}
            classId={studentData.classId}
          />
        </section>

        <section className="my-4 grid w-full grid-cols-1 items-stretch gap-4 font-medium tracking-wide sm:grid-cols-2 md:w-fit md:grid-cols-3 md:gap-5 md:pl-[8px] print:grid print:grid-cols-3 print:items-stretch print:pl-[27px]">
          <div className="text-[11px]">
            <p className="mb-1 font-semibold underline">Grading System</p>
            <div>
              <p>A - Excellent: [ 90 - 100 ]</p>
              <p>B - Good: [ 80 - 89 ]</p>
              <p>C - Fair: [ 70 - 79 ]</p>
              <p>D - Poor: [ 0 - 69 ]</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
