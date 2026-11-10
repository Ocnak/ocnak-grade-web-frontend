"use client";

import { useMemo } from "react";
import Image from "next/image";
import { Fredoka } from "next/font/google";
import { Spinner } from "@/components/ui/spinner";
import { useFetchClasses } from "@/hooks/use-classes";
import ClassCard from "./class-card";
import CreateClassModal from "./create-class-modal";
import ClassDetailModal from "./class-detail-modal";
import AddSubjectsToClassModal from "./add-subjects-to-class-modal";

const fredoka = Fredoka({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

// "Grade 3" sorts by 3; classes without a number (Nursery, K) come first
const getGradeNum = (name: string) => {
  const match = name.match(/\d+/);
  return match ? parseInt(match[0], 10) : 0;
};

export default function ClassesMain() {
  const {
    data,
    isLoading: classesLoader,
    error: classesError,
  } = useFetchClasses();

  const sortedClasses = useMemo(
    () =>
      [...(data?.classes ?? [])].sort(
        (a, b) => getGradeNum(a.name) - getGradeNum(b.name),
      ),
    [data],
  );

  return (
    <>
      <div className="mt-10.25 grid w-full grid-cols-1 gap-2 md:grid-cols-2">
        <div className="grid grid-cols-2 gap-3">
          <CreateClassModal />
          <AddSubjectsToClassModal />
        </div>
      </div>

      <ClassDetailModal />

      {classesLoader ? (
        <div className="flex min-h-[60vh] items-center justify-center">
          <Spinner className="size-19" />
        </div>
      ) : classesError ? (
        <p className="mt-7.5 text-sm text-red-600">
          Failed to load the classes.
        </p>
      ) : sortedClasses.length > 0 ? (
        <div className="mt-7.5 grid w-full grid-cols-2 gap-5 md:grid-cols-3 md:gap-3 lg:grid-cols-6">
          {sortedClasses.map((cls) => (
            <ClassCard key={cls.id} classId={cls.id} className={cls.name} />
          ))}
        </div>
      ) : (
        <div
          className={`mt-10 flex w-full flex-col items-center justify-center gap-2 text-[22px] font-semibold text-slate-800 ${fredoka.className}`}
        >
          <Image
            src="/images/undraw_no-data_ig65.svg"
            alt="empty rooster image"
            width={300}
            height={300}
            className="size-48"
            preload
            quality={75}
            sizes="(max-width: 768px) 100vw, 50vw"
          />
          <h1 className="text-center text-[22px] font-semibold md:text-[26px]">
            Don&apos;t have any classes yet, add some now
          </h1>
        </div>
      )}
    </>
  );
}
