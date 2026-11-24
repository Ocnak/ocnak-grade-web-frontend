"use client";

import { LiveStatusMain } from "@/components/student-tracking/live-status-main";
import { useTeacherScope } from "@/components/student-tracking/use-teacher-scope";

export default function TeacherLiveStatusPage() {
  const { scope, isLoading } = useTeacherScope();
  return <LiveStatusMain scope={scope} scopeLoading={isLoading} />;
}
