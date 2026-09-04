"use client";

import InputSearch from "./input-search";
import TeacherSelectClass from "./teacher-select-class";
import TeacherCard from "./teacher-card";
import CreateTeacherModal from "./create-teacher-modal";
import { useFetchTeachers } from "@/hooks/use-teacher";
import { useFilterStore } from "@/store/filterStore";
import Image from "next/image";
import LoadingCircleSpinner from "@/components/animation/LoadingCircleSpinner";
import { Fredoka } from "next/font/google";
import TeacherSelectLocation from "./teacher-select-location";

const fredoka = Fredoka({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export default function TeachersPage() {
  const { isLoading, data: teacherData, error } = useFetchTeachers();
  const { className, name, location } = useFilterStore();

  const filteredTeachers =
    teacherData?.filter((teacher) => {
      const fullName = `${teacher.firstName} ${teacher.lastName}`.toLowerCase();

      const matchesName = name ? fullName.includes(name.toLowerCase()) : true;

      const matchesClass = className
        ? teacher.classes.some((cls) => cls?.id === className)
        : true;
      const matchesLocation = location ? teacher.location === location : true;

      return matchesName && matchesClass && matchesLocation;
    }) ?? [];

  const sortedTeachers = [...filteredTeachers].sort((a, b) => {
    const firstNameCompare = a.firstName
      .toLowerCase()
      .localeCompare(b.firstName.toLowerCase());
    if (firstNameCompare !== 0) return firstNameCompare;
    return a.lastName.toLowerCase().localeCompare(b.lastName.toLowerCase());
  });

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingCircleSpinner />
      </div>
    );
  }

  if (error) return <p>Failed to load teachers.</p>;
  return (
    <>
      <main className="h-full  w-full bg-[#f9faf8] px-3.75 py-3 md:px-6.25 md:py-6">
        <h1
          className={`${fredoka.className} text-[29px] font-semibold md:text-[35px]`}
        >
          Teachers
        </h1>

        <div className="mt-10.25 grid w-full grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="w-full lg:max-w-108">
            <InputSearch />
          </div>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-2">
            <TeacherSelectLocation />
            <TeacherSelectClass />

            <div className="grid col-span-2">
              <CreateTeacherModal />
            </div>
          </div>
        </div>

        {Array.isArray(teacherData) && teacherData.length > 0 ? (
          <div className="mt-7.5 grid grid-cols-1 gap-5 sm:grid-cols-2  md:gap-3 lg:grid-cols-4">
            {sortedTeachers.map((teacher) => {
              teacher.classes.map((cls) => cls?.id).filter(Boolean) ?? [];

              return (
                <TeacherCard
                  key={teacher.id}
                  teacherId={teacher.id}
                  firstName={teacher.firstName}
                  lastName={teacher.lastName}
                  email={teacher.email}
                  classes={teacher.classes}
                  location={teacher.location}
                />
              );
            })}
          </div>
        ) : (
          <div
            className={`mt-10 flex w-full flex-col items-center justify-center gap-2 text-slate-800 ${fredoka.className}`}
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
              Don&apos;t have any teacher data, add some now
            </h1>
          </div>
        )}
      </main>
    </>
  );
}
