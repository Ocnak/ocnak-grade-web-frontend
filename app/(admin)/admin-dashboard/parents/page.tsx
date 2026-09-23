"use client";

import InputSearch from "./input-search";
import ParentCard from "./parent-card";
import { useFetchTeachers } from "@/hooks/use-teacher";
import { useFilterStore } from "@/store/filterStore";
import Image from "next/image";
import { Spinner } from "@/components/ui/spinner";
import { Fredoka } from "next/font/google";
import ParentSelectLocation from "./parent-select-location";
import ParentSelectClass from "./parent-select-class";
import { useFetchParentsWithStudents } from "@/hooks/use-parent";

const fredoka = Fredoka({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export default function ParentsPage() {
  const {
    isLoading: parentDataLoader,
    data: parentData,
    error: parentDataError,
  } = useFetchParentsWithStudents();

  const { className, name, location } = useFilterStore();

  const filteredParents =
    parentData?.filter((parent) => {
      const fullName = `${parent.firstName} ${parent.lastName}`.toLowerCase();

      const matchesName = name ? fullName.includes(name.toLowerCase()) : true;

      // className filter holds a classId — match if any of the parent's kids are in that class
      const matchesClass = className
        ? parent.students.some((s) => s.classId === className)
        : true;

      // location now comes from the kids, not the parent — match if any kid is at that location
      const matchesLocation = location
        ? parent.locations.includes(location)
        : true;

      return matchesName && matchesClass && matchesLocation;
    }) ?? [];

  const sortedParents = [...filteredParents].sort((a, b) => {
    const firstNameCompare = a.firstName
      .toLowerCase()
      .localeCompare(b.firstName.toLowerCase());
    if (firstNameCompare !== 0) return firstNameCompare;
    return a.lastName.toLowerCase().localeCompare(b.lastName.toLowerCase());
  });

  if (parentDataLoader) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner className="size-19" />
      </div>
    );
  }

  if (parentDataError) return <p>Failed to load parents.</p>;

  return (
    <>
      <main className="h-full  w-full bg-[#f9faf8] px-3.75 py-3 md:px-6.25 md:py-6">
        <h1
          className={`${fredoka.className} text-[29px] font-semibold md:text-[35px]`}
        >
          Parents Details
        </h1>

        <div className="mt-10.25 grid w-full grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="w-full lg:max-w-108">
            <InputSearch />
          </div>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-2">
            <ParentSelectLocation />
            <ParentSelectClass />
          </div>
        </div>

        {Array.isArray(parentData) && parentData.length > 0 ? (
          <div className="mt-7.5 grid grid-cols-1 gap-5 sm:grid-cols-2  md:gap-3 lg:grid-cols-4">
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
              Don&apos;t have any parent data, add some now
            </h1>
          </div>
        )}
      </main>
    </>
  );
}
