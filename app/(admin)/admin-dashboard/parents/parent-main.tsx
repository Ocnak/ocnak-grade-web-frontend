"use client";

import { useMemo } from "react";
import Image from "next/image";
import { Fredoka } from "next/font/google";
import { Spinner } from "@/components/ui/spinner";
import { useFilterStore } from "@/store/filterStore";
import { useFetchParentsWithStudents } from "@/hooks/use-parent";
import InputSearch from "./input-search";
import ParentCard from "./parent-card";
import ParentSelectLocation from "./parent-select-location";
import ParentSelectClass from "./parent-select-class";

const fredoka = Fredoka({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export default function ParentMain() {
  const {
    isLoading: parentDataLoader,
    data: parentData,
    error: parentDataError,
  } = useFetchParentsWithStudents();

  // the store calls it "className", but it holds the class id
  const { className, name, location } = useFilterStore();

  // filter and sort on screen, so changing a filter is instant
  const sortedParents = useMemo(() => {
    const term = name.trim().toLowerCase();

    return (parentData ?? [])
      .filter((parent) => {
        const fullName = `${parent.firstName} ${parent.lastName}`.toLowerCase();
        const matchesName = term ? fullName.includes(term) : true;
        // match if any of the parent's kids are in that class
        const matchesClass = className
          ? parent.students.some((s) => s.classId === className)
          : true;
        // location comes from the kids: match if any kid is at that location
        const matchesLocation = location
          ? parent.locations.includes(location)
          : true;

        return matchesName && matchesClass && matchesLocation;
      })
      .sort(
        (a, b) =>
          a.firstName.toLowerCase().localeCompare(b.firstName.toLowerCase()) ||
          a.lastName.toLowerCase().localeCompare(b.lastName.toLowerCase()),
      );
  }, [parentData, className, name, location]);

  const hasParents = Array.isArray(parentData) && parentData.length > 0;

  return (
    <>
      <div className="mt-10.25 grid w-full grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="w-full lg:max-w-108">
          <InputSearch />
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-2">
          <ParentSelectLocation />
          <ParentSelectClass />
        </div>
      </div>

      {parentDataLoader ? (
        <div className="flex min-h-[60vh] items-center justify-center">
          <Spinner className="size-19" />
        </div>
      ) : parentDataError ? (
        <p className="mt-7.5 text-sm text-red-600">Failed to load parents.</p>
      ) : !hasParents ? (
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
            Don&apos;t have any parent data, add some now
          </h1>
        </div>
      ) : sortedParents.length === 0 ? (
        <p className="mt-7.5 text-sm text-gray-500">
          No parents match these filters.
        </p>
      ) : (
        <div className="mt-7.5 grid grid-cols-1 gap-5 sm:grid-cols-2 md:gap-3 lg:grid-cols-4">
          {sortedParents.map((parent) => (
            <ParentCard
              key={parent.id}
              parentId={parent.id}
              firstName={parent.firstName}
              lastName={parent.lastName}
              email={parent.email}
              locations={parent.locations}
              students={parent.students}
            />
          ))}
        </div>
      )}
    </>
  );
}
