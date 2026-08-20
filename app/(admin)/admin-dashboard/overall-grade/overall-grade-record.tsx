"use client";

import { Tinos } from "next/font/google";
import { Crimson_Text } from "next/font/google";
import LoadingCircleSpinner from "@/components/animation/LoadingCircleSpinner";
import { useFetchStudents } from "@/hooks/use-students";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useFetchSubjectsByClass } from "@/hooks/use-subjects";
import { useGradesByPeriod } from "@/hooks/use-student-grades";
import Image from "next/image";

const tinos = Tinos({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

const crimson_text = Crimson_Text({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
});

interface GradesRecordType {
  classId: string;
  periodId: string;
}

export default function OverallGradesRecord(props: GradesRecordType) {
  const {
    data: subjects,
    isLoading: subjectLoader,
    error: subjectError,
  } = useFetchSubjectsByClass(props.classId);

  const {
    data: studentData,
    isLoading: studentLoader,
    error: studentError,
  } = useFetchStudents();

  const {
    data: gradesData,
    isLoading: gradesLoader,
    error: gradesError,
  } = useGradesByPeriod(props.periodId, props.classId);

  if (subjectLoader || studentLoader || gradesLoader) {
    return (
      <div className="min-h-64 flex w-full items-center justify-center">
        <LoadingCircleSpinner />
      </div>
    );
  }

  if (subjectError)
    return <div>Error fetching data: {subjectError.message}</div>;

  if (studentError)
    return <div>Error fetching data: {studentError.message}</div>;

  if (gradesError) return <div>Error fetching data: {gradesError.message}</div>;

  const normalizedStudents =
    studentData?.map((item: any) => ({
      ...(item.students ?? item),
      gradingType: item.classes?.gradingType,
    })) ?? [];

  const filteredStudents = normalizedStudents.filter(
    (student: any) => student?.classesId === props.classId,
  );

  // Sort alphabetically by firstName, then lastName as tiebreaker
  const sortedStudents = [...filteredStudents].sort((a, b) => {
    const firstNameCompare = (a.firstName ?? "")
      .toLowerCase()
      .localeCompare((b.firstName ?? "").toLowerCase());
    if (firstNameCompare !== 0) return firstNameCompare;
    return (a.lastName ?? "")
      .toLowerCase()
      .localeCompare((b.lastName ?? "").toLowerCase());
  });

  const gradingType = sortedStudents[0]?.gradingType ?? "letter";

  const capitalizeName = (str?: string) =>
    str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : "";

  //  Empty state: no grades have been entered yet for this class/period
  if (!gradesData || gradesData.length === 0) {
    return (
      <div
        className={`flex w-full flex-col items-center justify-center gap-2 py-10 text-[22px] font-semibold text-slate-800 ${crimson_text.className}`}
      >
        <Image
          src="/images/undraw_no-data_ig65.svg"
          alt="empty rooster image"
          width={300}
          height={300}
          className="size-48"
          priority
          quality={75}
          sizes="(max-width: 768px) 100vw, 50vw"
        />

        <h1 className="text-center text-[22px] font-semibold md:text-[26px]">
          No grades submitted yet for this period.
        </h1>
      </div>
    );
  }

  return (
    <div
      className={`${tinos.className} w-full overflow-x-auto rounded-md border border-gray-200`}
    >
      <Table className="print-scroll-area w-full min-w-max text-[#4a4442]">
        <TableHeader>
          <TableRow className="*:border-border [&>:not(:last-child)]:border-r">
            <TableHead className="sticky-col bg-white text-[16px] font-semibold text-[#4a4442]">
              Subject
            </TableHead>

            {sortedStudents.map((student: any) => (
              <TableHead
                key={student.id}
                className="font-sm w-0 px-0 py-2 text-[16px]"
              >
                <p
                  style={{
                    writingMode: "vertical-rl",
                    transform: "rotate(180deg)",
                    whiteSpace: "nowrap",
                  }}
                >
                  {`${capitalizeName(student.firstName)} ${capitalizeName(student.lastName)}`}
                </p>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>

        <TableBody>
          {subjects?.map((subject) => (
            <TableRow
              key={subject.id}
              className="*:border-border [&>:not(:last-child)]:border-r"
            >
              <TableCell className="sticky-col bg-white capitalize font-medium shadow-md">
                {subject.name}
              </TableCell>

              {sortedStudents.map((student: any) => {
                const gradeEntry = gradesData?.find(
                  (g: any) =>
                    g.subjectId === subject.id &&
                    g.studentId === student.id &&
                    g.periodId === props.periodId,
                );

                const displayGrade =
                  gradingType === "letter"
                    ? (gradeEntry?.letterGrade ?? "-")
                    : (gradeEntry?.numericGrade ?? "-");

                const isFailing =
                  (gradingType !== "letter" &&
                    typeof displayGrade === "number" &&
                    displayGrade < 70) ||
                  (gradingType === "letter" && displayGrade === "F");

                return (
                  <TableCell
                    key={student.id}
                    className={`text-center uppercase ${isFailing ? "text-red-600" : ""}`}
                  >
                    {displayGrade}
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
