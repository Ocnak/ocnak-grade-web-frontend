"use client";

import { LiveStatusMain } from "@/components/student-tracking/live-status-main";
import { useTeacherScope } from "@/components/student-tracking/use-teacher-scope";

export default function TeacherLiveStatus() {
  const { scope, isLoading } = useTeacherScope();
  return <LiveStatusMain scope={scope} scopeLoading={isLoading} />;
}
