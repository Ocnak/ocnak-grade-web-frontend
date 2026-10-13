"use client";

import { useMemo } from "react";
import { useFilterStore } from "@/store/filterStore";
import { useGradesByPeriod } from "@/hooks/use-student-grades";
import { useFetchStudents } from "@/hooks/use-students";
import PublishStudentGradeModal from "./publish-student-grades-modal";
import UnPublishStudentGradeModal from "./unpublish-student-grades-modal";

export default function OverallPublishAction() {
  const { className: classId, periodId, location } = useFilterStore();

  const { data: periodGrades, isLoading: gradesLoading } = useGradesByPeriod(
    periodId,
    classId,
  );
  const { data: studentData, isLoading: studentsLoading } = useFetchStudents();

  const isApproved = useMemo(() => {
    if (!periodGrades || !studentData) return false;

    // Students in the selected class (and location, if one is selected).
    // An empty location means "All".
    const scopedStudentIds = new Set<string>(
      studentData
        .map((item: any) => item.students ?? item)
        .filter(
          (s: any) =>
            s?.classesId === classId &&
            (!location ||
              (s?.location ?? "").toLowerCase() === location.toLowerCase()),
        )
        .map((s: any) => s.id),
    );

    const scopedGrades = periodGrades.filter((g: any) =>
      scopedStudentIds.has(g.studentId),
    );

    return (
      scopedGrades.length > 0 &&
      scopedGrades.every((g: any) => g.status === "approved")
    );
  }, [periodGrades, studentData, classId, location]);

  if (gradesLoading || studentsLoading) {
    return <div className="h-12 rounded-md bg-gray-400 animate-pulse" />;
  }

  return isApproved ? (
    <UnPublishStudentGradeModal />
  ) : (
    <PublishStudentGradeModal />
  );
}
