"use client";

import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { Tinos } from "next/font/google";
import { useFetchSubjectsByClass } from "@/hooks/use-subjects";
import { useStudentGrades } from "@/hooks/use-student-grades";
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
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const tinos = Tinos({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

interface GradeData {
  studentId: string;
  subjectId: string;
  periodId: string;
  classId: string;
  letterGrade?: string | null;
  numericGrade?: number | null;
}

interface GradesRecordType {
  studentId: string;
  classId: string;
  isEditing?: boolean;
  onSave?: (grades: GradeData[]) => void;
  onEnterSave?: () => void;
}

type EditableKey = `${string}-${string}`;

type EditableMap = Record<
  EditableKey,
  {
    subject_id: string;
    period_id: string;
    numeric_grade?: number | null;
    letter_grade?: string | null;
  }
>;

export type GradesRecordHandle = {
  save: () => void;
};

const GradesRecord = forwardRef<GradesRecordHandle, GradesRecordType>(
  (props, ref) => {
    const {
      data: subjects,
      isLoading: subjectLoader,
      error: subjectError,
    } = useFetchSubjectsByClass(props.classId);

    const {
      data: studentGrades,
      isLoading: studentGradesLoader,
      error: studentGradesError,
    } = useStudentGrades(props.studentId);

    const {
      data: periodData,
      isLoading: periodLoader,
      error: periodError,
    } = useFetchPeriods();

    const { data, isLoading: classesLoader } = useFetchClasses();

    const classes = data?.classes;

    const classId = props.classId;

    const className = classes?.find(
      (cls: { id: string; name: string }) => cls.id === classId,
    )?.name;

    const [editableGrades, setEditableGrades] = useState<EditableMap>({});

    const isNursery = className === "Nursery" || className === "Pre-Nursery";

    const periodOrder =
      periodData
        ?.sort((a: any, b: any) => a.period - b.period)
        .map((item: any) => item.id) ?? [];

    useEffect(() => {
      if (!studentGrades || Object.keys(editableGrades).length > 0) return;

      const next: EditableMap = {};
      studentGrades.forEach((g: any) => {
        const key: EditableKey = `${g.subjectId}-${g.periodId}`;
        next[key] = {
          subject_id: g.subjectId,
          period_id: g.periodId,
          numeric_grade: g.numericGrade ?? null,
          letter_grade: g.letterGrade ?? null,
        };
      });

      setEditableGrades(next);
    }, [studentGrades]);

    // expose save() to parent via ref
    useImperativeHandle(ref, () => ({
      save() {
        if (!props.onSave) return;

        // Check if any grade has actually changed
        const hasChanges = Object.values(editableGrades).some((g) => {
          const original = studentGrades?.find(
            (sg: any) =>
              sg.subjectId === g.subject_id && sg.periodId === g.period_id,
          );

          if (isNursery) {
            return (g.letter_grade ?? null) !== (original?.letterGrade ?? null);
          }
          return (g.numeric_grade ?? null) !== (original?.numericGrade ?? null);
        });

        if (!hasChanges) return;

        if (!isNursery) {
          const invalidGrades = Object.values(editableGrades).filter(
            (g) => typeof g.numeric_grade === "number" && g.numeric_grade < 60,
          );

          if (invalidGrades.length > 0) {
            toast.warning("All grades must be 60 or above before saving.", {
              style: {
                "--normal-bg": "var(--background)",
                "--normal-text":
                  "light-dark(var(--color-amber-600), var(--color-amber-400))",
                "--normal-border":
                  "light-dark(var(--color-amber-600), var(--color-amber-400))",
              } as React.CSSProperties,
              position: "top-right",
            });

            setEditableGrades((prev) => {
              const next = { ...prev };
              invalidGrades.forEach((g) => {
                const key: EditableKey = `${g.subject_id}-${g.period_id}`;
                const original = studentGrades?.find(
                  (sg: any) =>
                    sg.subject_id === g.subject_id &&
                    sg.period_id === g.period_id,
                );
                next[key] = {
                  subject_id: g.subject_id,
                  period_id: g.period_id,
                  numeric_grade: original?.numeric_grade ?? null,
                  letter_grade: original?.letter_grade ?? null,
                };
              });
              return next;
            });

            return;
          }
        }

        const payload: GradeData[] = Object.values(editableGrades)
          .filter((g) => sortedSubjects?.some((s) => s.id === g.subject_id))
          .map((g) => ({
            studentId: props.studentId,
            subjectId: g.subject_id,
            periodId: g.period_id,
            classId: props.classId,
            numericGrade: isNursery ? null : (g.numeric_grade ?? null),
            letterGrade: isNursery ? (g.letter_grade ?? null) : null,
          }));

        if (payload.length) {
          props.onSave(payload);
        }
      },
    }));

    const sortedSubjects = subjects
      ? [...subjects].sort((a, b) => a.name.localeCompare(b.name))
      : subjects;

    if (subjectLoader || studentGradesLoader || periodLoader || classesLoader) {
      return (
        <div className="mt-32.5 flex w-full items-center justify-center">
          <LoadingCircleSpinner />
        </div>
      );
    }

    if (subjectError)
      return <div>Error fetching students: {subjectError.message}</div>;
    if (studentGradesError)
      return <div>Error fetching students: {studentGradesError.message}</div>;
    if (periodError)
      return <div>Error fetching students: {periodError.message}</div>;

    const periodAverages = periodOrder.map((periodId: any) => {
      if (isNursery) return "-";

      // collect numeric grades for this period from editableGrades
      const numericGrades: number[] = [];

      Object.values(editableGrades).forEach((g) => {
        if (g.period_id === periodId && typeof g.numeric_grade === "number") {
          numericGrades.push(g.numeric_grade);
        }
      });

      if (numericGrades.length === 0) return "-";

      const average =
        numericGrades.reduce((sum, grade) => sum + grade, 0) /
        numericGrades.length;

      return average.toFixed(1);
    });

    const onHandleChange = (
      subjectId: string,
      periodId: string,
      value: string,
    ) => {
      if (isNursery) {
        const upper = value.toUpperCase();
        const validLetters = ["A", "B", "C", "D", "F"];
        // Only allow if empty or the last typed character is a valid letter
        if (upper !== "" && !validLetters.includes(upper)) return;
      }
      const key: EditableKey = `${subjectId}-${periodId}`;
      setEditableGrades((prev) => {
        const prevEntry = prev[key] ?? {
          subject_id: subjectId,
          period_id: periodId,
          numeric_grade: null,
          letter_grade: null,
        };

        return {
          ...prev,
          [key]: {
            ...prevEntry,
            ...(isNursery
              ? { letter_grade: value.toUpperCase() || null }
              : {
                  numeric_grade: value === "" ? null : Number.parseFloat(value),
                }),
          },
        };
      });
    };

    return (
      <div className={`md:w-195 ${tinos.className} print:mx-5`}>
        <Table className="px-3 text-[#4a4442]">
          <TableHeader>
            <TableRow className="*:border-border [&>:not(:last-child)]:border-r">
              <TableHead className="w-34.25 font-semibold text-[#4a4442]">
                Subject
              </TableHead>
              <TableHead className="font-semibold">
                <p>
                  1<span className="font-semibold text-[#4a4442]">st</span>
                </p>
              </TableHead>
              <TableHead>
                <p>
                  2<span className="font-semibold text-[#4a4442]">nd</span>
                </p>
              </TableHead>
              <TableHead>
                <p>
                  3<span className="font-semibold text-[#4a4442]">rd</span>
                </p>
              </TableHead>
              <TableHead>
                <p>
                  4<span className="font-semibold text-[#4a4442]">th</span>
                </p>
              </TableHead>
              <TableHead>
                <p>
                  5<span className="font-semibold text-[#4a4442]">th</span>
                </p>
              </TableHead>
              <TableHead>
                <p>
                  6<span className="font-semibold text-[#4a4442]">th</span>
                </p>
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {sortedSubjects?.map((subject) => {
              const gradesForSubject = studentGrades?.filter(
                (grade: any) => grade.subjectId === subject.id,
              );

              return (
                <TableRow
                  key={subject.id}
                  className="*:border-border [&>:not(:last-child)]:border-r"
                >
                  <TableCell className="font-medium capitalize">
                    {subject.name}
                  </TableCell>

                  {periodOrder.map((periodId: any) => {
                    const key: EditableKey = `${subject.id}-${periodId}`;
                    const original = gradesForSubject?.find(
                      (g: any) => g.periodId === periodId,
                    );
                    const editEntry = editableGrades[key];

                    const displayGrade = isNursery
                      ? (editEntry?.letter_grade ?? original?.letterGrade ?? "")
                      : (editEntry?.numeric_grade ??
                        original?.numericGrade ??
                        "");

                    return (
                      <TableCell
                        key={periodId}
                        className="h-9 text-center uppercase md:w-10"
                      >
                        {props.isEditing ? (
                          <Input
                            type={isNursery ? "text" : "number"}
                            defaultValue={displayGrade ?? ""}
                            className={`h-9 w-10 rounded border border-gray-300 text-center shadow md:w-18 ${
                              (!isNursery &&
                                typeof displayGrade === "number" &&
                                displayGrade < 70) ||
                              (isNursery && displayGrade === "F")
                                ? "text-red-600"
                                : ""
                            }`}
                            maxLength={isNursery ? 1 : undefined}
                            onChange={(e) =>
                              onHandleChange(
                                subject.id,
                                periodId,
                                e.target.value,
                              )
                            }
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                (e.target as HTMLInputElement).blur();
                                props.onEnterSave?.();
                              }
                            }}
                          />
                        ) : displayGrade === "" || displayGrade == null ? (
                          "-"
                        ) : (
                          <span
                            className={
                              (!isNursery &&
                                typeof displayGrade === "number" &&
                                displayGrade < 70) ||
                              (isNursery && displayGrade === "F")
                                ? "text-red-600"
                                : ""
                            }
                          >
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

          {!isNursery && (
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
    );
  },
);

GradesRecord.displayName = "GradesRecord";
export default GradesRecord;
