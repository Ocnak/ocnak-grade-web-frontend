"use client";

import { Spinner } from "@/components/ui/spinner";
import { Fredoka } from "next/font/google";
import StudentGradesCard from "./student-grades-card";
import { useFetchParent } from "@/hooks/use-parent";

const fredoka = Fredoka({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export default function GradesPage() {
  const { isLoading, data: parentData, error } = useFetchParent();

  const students = parentData?.students ?? [];

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner className="size-19" />
      </div>
    );
  }

  if (error) return <p>Failed to load parent details.</p>;
  return (
    <>
      <main className="h-full  w-full bg-[#f9faf8] px-3.75 py-3 md:px-6.25 md:py-6">
        <h1
          className={`${fredoka.className} text-[29px] font-semibold md:text-[35px]`}
        >
          Grades
        </h1>
        {students.length === 0 ? (
          <p className="mt-17 text-gray-600">No students found.</p>
        ) : (
          <div className="mt-17 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 md:gap-3 ">
            {students.map((student) => (
              <StudentGradesCard key={student.id} {...student} />
            ))}
          </div>
        )}
      </main>
    </>
  );
}
