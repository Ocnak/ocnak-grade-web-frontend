"use client";

import { Fredoka } from "next/font/google";
import { Button } from "@/components/ui/button";
import * as motion from "motion/react-client";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import {
  useFetchStudentById,
  useFetchStudentsByClass,
} from "@/hooks/use-students";
import { useSession } from "@/hooks/use-session";
import { ArrowLeftIcon, ArrowRightIcon, House, UserPen } from "lucide-react";
import Image from "next/image";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import ReportCard from "./report-card";
import PreschoolerSelectSemester from "./preschooler-select-semester";
import EditReportCardSheet from "./edit-report-card-sheet";

const fredoka = Fredoka({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

// Toddler Progress Report is reached from a single shared route regardless
// of role (see StudentDataTable.getGradeLink), so the "go home" target has
// to be resolved per-role here rather than being one hardcoded path.
const ROLE_STUDENTS_LIST_PATH: Record<string, string> = {
  admin: "/admin-dashboard/students",
  teacher: "/teacher/students",
  "preschooler-teacher": "/preschooler-teacher/students",
};

export default function ToddlerProgressReport() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const studentId = searchParams.get("studentId");

  const { data: session } = useSession();
  const userRole = session?.user.userRole ?? undefined;

  const pageParam = searchParams.get("page") ?? "0";
  const pageSizeParam = searchParams.get("pageSize") ?? "5";
  const pageSizeNum = Number(pageSizeParam) || 5;

  const {
    data: studentData,
    error: studentDataError,
    isLoading: studentDataLoader,
  } = useFetchStudentById(studentId);

  const classId = studentData?.students?.classesId;
  const classIdFromParams = searchParams.get("classId") ?? classId;

  const { data: classmatesData, isLoading: classmatesLoader } =
    useFetchStudentsByClass(classId ?? null);

  const classmates = classmatesData ?? [];

  const sortedClassmates = [...classmates].sort((a: any, b: any) => {
    const firstCompare = a.firstName.localeCompare(b.firstName);
    if (firstCompare !== 0) return firstCompare;
    return a.lastName.localeCompare(b.lastName);
  });

  const currentIndex = sortedClassmates.findIndex(
    (s: any) => s.id === studentId,
  );
  const nextStudent =
    currentIndex !== -1 && currentIndex < sortedClassmates.length - 1
      ? sortedClassmates[currentIndex + 1]
      : null;
  const prevStudent =
    currentIndex > 0 ? sortedClassmates[currentIndex - 1] : null;

  const onHandleNextStudent = () => {
    if (!nextStudent) return;

    const newIndex = currentIndex + 1;
    const newPage = Math.floor(newIndex / pageSizeNum);

    const params = new URLSearchParams(searchParams.toString());
    params.set("studentId", nextStudent.id);
    params.set("page", String(newPage));

    router.push(`${pathname}?${params.toString()}`);
  };

  const onHandlePrevStudent = () => {
    if (!prevStudent) return;

    const newIndex = currentIndex - 1;
    const newPage = Math.floor(newIndex / pageSizeNum);

    const params = new URLSearchParams(searchParams.toString());
    params.set("studentId", prevStudent.id);
    params.set("page", String(newPage));

    router.push(`${pathname}?${params.toString()}`);
  };

  const onHandleGoHome = () => {
    if (!classIdFromParams || !studentId) {
      console.warn(
        "[onHandleGoHome] missing classIdFromParams or studentId, aborting",
        { classIdFromParams, studentId },
      );
      return;
    }

    const listPathPrefix = ROLE_STUDENTS_LIST_PATH[userRole ?? ""];
    if (!listPathPrefix) {
      console.warn("[onHandleGoHome] unknown userRole, aborting", { userRole });
      return;
    }

    const params = new URLSearchParams();
    params.set("page", pageParam);
    params.set("pageSize", pageSizeParam);
    params.set("scrollTo", studentId);

    router.push(`${listPathPrefix}/${classIdFromParams}?${params.toString()}`);
  };

  if (studentDataLoader || classmatesLoader) {
    return (
      <div className="mt-32.5 flex w-full items-center justify-center">
        <Spinner className="size-19" />
      </div>
    );
  }

  if (studentDataError)
    return <div>Error fetching students: {studentDataError.message}</div>;

  return (
    <main className="h-full  w-full bg-[#f9faf8] px-3.75 py-3 md:px-6.25 md:py-6">
      <h1
        className={`${fredoka.className} text-[29px] font-semibold md:text-[35px]`}
      >
        Toddler Progress Report
      </h1>

      <div className="flex w-full items-end justify-end  mb-4">
        <motion.button
          whileTap={{ scale: 0.85, rotate: 45 }}
          whileHover={{ scale: 1.08 }}
          transition={{ type: "spring", stiffness: 400, damping: 15 }}
          className="cursor-pointer hover:text-red-700"
          onClick={onHandleGoHome}
        >
          <House className="size-16" />
        </motion.button>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        <motion.div
          className="cursor-pointer w-full tracking-wide flex items-center justify-center gap-2"
          whileTap={{ scale: 0.85 }}
        >
          <Button
            onClick={onHandlePrevStudent}
            disabled={!prevStudent}
            className="h-12.5 w-full text-[16px] font-medium cursor-pointer rounded-md bg-slate-800 transition-none disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400 disabled:opacity-100"
          >
            <ArrowLeftIcon
              strokeWidth={2.25}
              className="transition-transform duration-200 group-hover:-translate-x-0.5 size-5"
            />
            Prev Student
          </Button>
        </motion.div>

        <motion.div
          className="cursor-pointer w-full tracking-wide flex items-center justify-center gap-2"
          whileTap={{ scale: 0.85 }}
        >
          <Button
            onClick={onHandleNextStudent}
            disabled={!nextStudent}
            className="h-12.5 w-full text-[16px] font-medium cursor-pointer rounded-md bg-slate-800 transition-none disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400 disabled:opacity-100"
          >
            <ArrowRightIcon
              strokeWidth={2.25}
              className="transition-transform duration-200 group-hover:translate-x-0.5 size-5 "
            />
            Next Student
          </Button>
        </motion.div>

        <EditReportCardSheet />
        <PreschoolerSelectSemester />
      </div>

      <div className="my-5  gap-0 border px-1.5 w-full rounded-lg md:border-gray-300 md:p-6 md:shadow-lg">
        <div className="mt-3 flex items-center px-3">
          <div className="flex w-full flex-col items-center justify-center">
            <h3
              className={`${fredoka.className} w-full text-center text-[18px]`}
            >
              OUR CHILDREN NURSERY AND KINDERGARTEN
            </h3>
            <h2
              className={`${fredoka.className} text-[22px] font-semibold text-center sm:text-[26px] lg:text-[32px]`}
            >
              Preschool Toddler Progress Report
            </h2>
            <p className="text-[14px]">Monrovia, Liberia</p>
            <p className="text-[14px]">Cell# 0886442080/8881117906</p>
            <p className="text-lg font-semibold">
              <span>
                {studentData.students.firstName} {studentData.students.lastName}
                : {studentData.classes.name}
              </span>
            </p>
          </div>

          <Image
            src="/images/ocnak-logo.jpeg"
            alt="ocnak logo"
            width={3000}
            height={3000}
            className="h-12 w-12 sm:h-16 sm:w-16 lg:size-20"
            priority
            quality={75}
          />
        </div>
      </div>

      <div className="w-full rounded py-3 text-center">
        <h2 className={`medium text-[20px] font-medium ${fredoka.className}`}>
          Developmental Skills Assessment
        </h2>

        <Separator className="mt-2 border border-black" />
      </div>

      {studentId && (
        <section className="mt-3 items-center justify-center md:flex">
          <ReportCard preschoolerId={studentId} />
        </section>
      )}
    </main>
  );
}
