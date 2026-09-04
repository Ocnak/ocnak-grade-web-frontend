"use client";

import { Fredoka } from "next/font/google";
import ClassCard from "./class-card";
import CreateClassModal from "./create-class-modal";
import { useFetchClasses } from "@/hooks/use-classes";
import LoadingCircleSpinner from "@/components/animation/LoadingCircleSpinner";
import Image from "next/image";
import ClassDetailModal from "./class-detail-modal";
import AddSubjectsToClassModal from "./add-subjects-to-class-modal";

const fredoka = Fredoka({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export default function ClassesPage() {
  const {
    data,
    isLoading: classesLoader,
    error: classesError,
  } = useFetchClasses();

  const classes = data?.classes;

  const sortedClasses = classes
    ? [...classes].sort((a, b) => {
        const getGradeNum = (name: string) => {
          const match = name.match(/\d+/);
          return match ? parseInt(match[0]) : 0;
        };
        return getGradeNum(a.name) - getGradeNum(b.name);
      })
    : [];

  if (classesLoader) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingCircleSpinner />
      </div>
    );
  }

  if (classesError) return <p>Failed to load the classes.</p>;

  return (
    <>
      <main className="h-full w-full bg-[#f9faf8] px-3.75 py-3 md:px-6.25 md:py-6">
        <div className="">
          <h1
            className={`${fredoka.className} text-[29px] font-semibold md:text-[35px]`}
          >
            Classes & Subjects
          </h1>

          <div className="mt-10.25 grid w-full grid-cols-1 gap-2 md:grid-cols-2">
            <div className="grid grid-cols-2 gap-3">
              <CreateClassModal />
              <AddSubjectsToClassModal />
            </div>
          </div>

          <ClassDetailModal />
        </div>

        {Array.isArray(sortedClasses) && sortedClasses.length > 0 ? (
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
              priority
              quality={75}
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            <h1 className="text-center text-[22px] font-semibold md:text-[26px]">
              Don&apos;t have any classes yet, add some now
            </h1>
          </div>
        )}
      </main>
    </>
  );
}
