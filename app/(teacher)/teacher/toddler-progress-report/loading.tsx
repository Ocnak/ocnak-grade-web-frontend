"use client";

import { Spinner } from "@/components/ui/spinner";

export default function PreviewLoadingPage() {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        width: "100%",
      }}
    >
      <Spinner className="size-19" />
    </div>
  );
}
