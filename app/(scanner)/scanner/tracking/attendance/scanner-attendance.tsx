"use client";

import { AttendanceMain } from "@/components/student-tracking/attendance-main";
import { useScannerScope } from "@/components/student-tracking/use-scanner-scope";

export default function ScannerAttendance() {
  const { scope, isLoading } = useScannerScope();
  return <AttendanceMain scope={scope} scopeLoading={isLoading} />;
}
