"use client";

import { useMemo } from "react";
import Image from "next/image";
import { Fredoka } from "next/font/google";
import { Spinner } from "@/components/ui/spinner";
import { useFilterStore } from "@/store/filterStore";
import { useFetchTeachers } from "@/hooks/use-teacher";
import InputSearch from "./input-search";
import TeacherSelectClass from "./teacher-select-class";
import TeacherSelectLocation from "./teacher-select-location";
import TeacherCard from "./teacher-card";
import CreateTeacherModal from "./create-teacher-modal";

const fredoka = Fredoka({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export default function TeachersMain() {
  const { isLoading, data: teacherData, error } = useFetchTeachers();
  // the store calls it "className", but it holds the class id
  const { className, name, location } = useFilterStore();

  // filter and sort on screen, so changing a filter is instant
  const sortedTeachers = useMemo(() => {
    const term = name.trim().toLowerCase();

    return (teacherData ?? [])
      .filter((teacher) => {
        const fullName =
          `${teacher.firstName} ${teacher.lastName}`.toLowerCase();
        const matchesName = term ? fullName.includes(term) : true;
        const matchesClass = className
          ? teacher.classes.some((cls) => cls?.id === className)
          : true;
        const matchesLocation = location ? teacher.location === location : true;

        return matchesName && matchesClass && matchesLocation;
      })
      .sort(
        (a, b) =>
          a.firstName.toLowerCase().localeCompare(b.firstName.toLowerCase()) ||
          a.lastName.toLowerCase().localeCompare(b.lastName.toLowerCase()),
      );
  }, [teacherData, className, name, location]);

  const hasTeachers = Array.isArray(teacherData) && teacherData.length > 0;

  return (
    <>
      <div className="mt-10.25 grid w-full grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="w-full lg:max-w-108">
          <InputSearch />
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-2">
          <TeacherSelectLocation />
          <TeacherSelectClass />

          <div className="col-span-2 grid">
            <CreateTeacherModal />
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex min-h-[60vh] items-center justify-center">
          <Spinner className="size-19" />
        </div>
      ) : error ? (
        <p className="mt-7.5 text-sm text-red-600">Failed to load teachers.</p>
      ) : !hasTeachers ? (
        <div
          className={`mt-10 flex w-full flex-col items-center justify-center gap-2 text-slate-800 ${fredoka.className}`}
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
            Don&apos;t have any teacher data, add some now
          </h1>
        </div>
      ) : sortedTeachers.length === 0 ? (
        <p className="mt-7.5 text-sm text-gray-500">
          No teachers match these filters.
        </p>
      ) : (
        <div className="mt-7.5 grid grid-cols-1 gap-5 sm:grid-cols-2 md:gap-3 lg:grid-cols-4">
          {sortedTeachers.map((teacher) => (
            <TeacherCard
              key={teacher.id}
              teacherId={teacher.id}
              firstName={teacher.firstName}
              lastName={teacher.lastName}
              email={teacher.email}
              classes={teacher.classes}
              location={teacher.location}
            />
          ))}
        </div>
      )}
    </>
  );
}
