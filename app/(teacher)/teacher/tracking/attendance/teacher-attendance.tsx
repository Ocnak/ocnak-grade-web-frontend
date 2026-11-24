"use client";

import { AttendanceMain } from "@/components/student-tracking/attendance-main";
import { useTeacherScope } from "@/components/student-tracking/use-teacher-scope";

export default function TeacherAttendance() {
  const { scope, isLoading } = useTeacherScope();
  return <AttendanceMain scope={scope} scopeLoading={isLoading} />;
}
