"use client";

import { LiveStatusMain } from "@/components/student-tracking/live-status-main";
import { useScannerScope } from "@/components/student-tracking/use-scanner-scope";

export default function ScannerLiveStatus() {
  const { scope, isLoading } = useScannerScope();
  return <LiveStatusMain scope={scope} scopeLoading={isLoading} />;
}
