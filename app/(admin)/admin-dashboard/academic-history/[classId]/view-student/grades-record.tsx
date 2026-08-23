"use client";

import { Tinos } from "next/font/google";
import { useFetchSubjectsByClass } from "@/hooks/use-subjects";
import { useFetchClasses } from "@/hooks/use-classes";
import LoadingCircleSpinner from "@/components/animation/LoadingCircleSpinner";
import { useFetchPeriods } from "@/hooks/use-periods";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useMemo } from "react";
import { useFetchArchivedStudentGrades } from "@/hooks/use-archived-students";

const tinos = Tinos({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

interface GradesRecordType {
  studentId: string;
  classId: string;
}

export default function GradesRecord(props: GradesRecordType) {
  // Initializing the useFetchSubjectsByClass hook
  const {
    data: subjects,
    isLoading: subjectLoader,
    error: subjectError,
  } = useFetchSubjectsByClass(props.classId);

  // Initializing the studentGrades hook
  const {
    data: studentGrades,
    isLoading: studentGradesLoader,
    error: studentGradesError,
  } = useFetchArchivedStudentGrades(props.studentId);

  const {
    data: periodData,
    isLoading: periodLoader,
    error: periodError,
  } = useFetchPeriods();

  const {
    data,
    isLoading: classesLoader,
    error: classesError,
  } = useFetchClasses();

  const classes = data?.classes;

  // Find the full class record once, so we can pull both name and gradingType from it
  const classInfo = useMemo(() => {
    return classes?.find(
      (cls: { id: string; name: string; gradingType?: string }) =>
        cls.id === props.classId,
    );
  }, [classes, props.classId]);

  const className = classInfo?.name;

  const usesLetterGrades = useMemo(() => {
    return classInfo?.gradingType === "letter";
  }, [classInfo]);

  const sortedSubjects = subjects
    ? [...subjects].sort((a, b) => a.name.localeCompare(b.name))
    : subjects;

  if (subjectLoader || studentGradesLoader || periodLoader || classesLoader) {
    return (
      <div className="flex min-h-70 w-full items-center justify-center md:w-195">
        <LoadingCircleSpinner />
      </div>
    );
  }

  if (subjectError)
    return <div>Error fetching student data: {subjectError.message}</div>;

  if (studentGradesError)
    return <div>Error fetching student data: {studentGradesError.message}</div>;

  if (periodError)
    return <div>Error fetching student data: {periodError.message}</div>;

  if (classesError)
    return <div>Error fetching student data: {classesError.message}</div>;

  const periodOrder =
    periodData
      ?.sort((a: any, b: any) => a.period - b.period)
      .map((item: any) => item.id) ?? [];

  const periodAverages = periodOrder.map((periodId: any) => {
    const gradesForPeriod = studentGrades?.filter(
      (grade) => grade.periodId === periodId,
    );

    if (!gradesForPeriod || gradesForPeriod.length === 0) return "-";

    if (usesLetterGrades) {
      return "-";
    }

    const numericGrades = gradesForPeriod
      .map((g) => g.numericGrade)
      .filter((g) => typeof g === "number");

    if (numericGrades.length === 0) return "-";

    const average =
      numericGrades.reduce((sum, grade) => sum + grade, 0) /
      numericGrades.length;

    return average.toFixed(1);
  });

  return (
    <>
      <div className={`md:w-195 ${tinos.className} print:mx-5`}>
        <Table className="print-scroll-area mt-4 px-3 text-[#4a4442]">
          <TableHeader>
            <TableRow className="*:border-border [&>:not(:last-child)]:border-r">
              <TableHead className="w-60 text-[16px] font-semibold text-[#4a4442]">
                Subject
              </TableHead>
              <TableHead className="font-semibold">
                <p className="text-[16px]">
                  1
                  <span className="text-[13px] font-semibold text-[#4a4442]">
                    st
                  </span>
                </p>
              </TableHead>
              <TableHead>
                <p className="text-[16px]">
                  2
                  <span className="text-[13px] font-semibold text-[#4a4442]">
                    nd
                  </span>
                </p>
              </TableHead>
              <TableHead>
                <p className="text-[16px]">
                  3
                  <span className="text-[13px] font-semibold text-[#4a4442]">
                    rd
                  </span>
                </p>
              </TableHead>
              <TableHead>
                <p className="text-[16px]">
                  4
                  <span className="text-[13px] font-semibold text-[#4a4442]">
                    th
                  </span>
                </p>
              </TableHead>
              <TableHead>
                <p className="text-[16px]">
                  5
                  <span className="text-[13px] font-semibold text-[#4a4442]">
                    th
                  </span>
                </p>
              </TableHead>
              <TableHead>
                <p className="text-[16px]">
                  6
                  <span className="text-[13px] font-semibold text-[#4a4442]">
                    th
                  </span>
                </p>
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {sortedSubjects?.map((subject) => {
              const gradesForSubject = studentGrades?.filter(
                (grade) => grade.subjectId === subject.id,
              );

              return (
                <TableRow
                  key={subject.id}
                  className="*:border-border [&>:not(:last-child)]:border-r"
                >
                  {/* Subject column (wider) */}
                  <TableCell className="w-50 font-medium capitalize">
                    {subject.name}
                  </TableCell>

                  {/* Period columns */}
                  {periodOrder.map((periodId: any) => {
                    const gradeEntry = gradesForSubject?.find(
                      (g) => g.periodId === periodId,
                    );

                    const displayGrade = usesLetterGrades
                      ? gradeEntry?.letterGrade
                      : gradeEntry?.numericGrade;

                    const isFailing =
                      (!usesLetterGrades &&
                        typeof displayGrade === "number" &&
                        displayGrade < 70) ||
                      (usesLetterGrades && displayGrade === "F");

                    return (
                      // <TableCell
                      //   key={periodId}
                      //   className="text-center uppercase"
                      // >
                      //   {displayGrade ?? "-"}
                      // </TableCell>

                      <TableCell
                        key={periodId}
                        className="text-center uppercase"
                      >
                        {displayGrade == null || displayGrade === "" ? (
                          "-"
                        ) : (
                          <span className={isFailing ? "text-red-600" : ""}>
                            {displayGrade}
                          </span>
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              );
            })}
          </TableBody>

          {!usesLetterGrades && (
            <TableFooter>
              <TableRow className="*:border-border [&>:not(:last-child)]:border-r">
                <TableCell className="font-semibold">Average</TableCell>
                {periodAverages.map((avg: any, i: any) => (
                  <TableCell key={i} className="text-center font-semibold">
                    {avg}
                  </TableCell>
                ))}
              </TableRow>
            </TableFooter>
          )}
        </Table>
      </div>
    </>
  );
}
