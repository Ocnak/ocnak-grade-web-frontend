"use client";

import LoadingCircleSpinner from "@/components/animation/LoadingCircleSpinner";

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
      <LoadingCircleSpinner />
    </div>
  );
}
