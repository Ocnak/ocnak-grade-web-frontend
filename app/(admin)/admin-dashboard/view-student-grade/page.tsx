"use client";

import { Tinos } from "next/font/google";
import GradesRecord from "./grades-record";
import { usePathname, useSearchParams } from "next/navigation";
import {
  useFetchStudentById,
  useFetchStudentsByClass,
} from "@/hooks/use-students";
import { Spinner } from "@/components/ui/spinner";
import * as motion from "motion/react-client";
import { ArrowLeftIcon, ArrowRightIcon, House, UserPen } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";
import { toast } from "sonner";
import { useInputGrades } from "@/hooks/use-students";
import { useFetchClasses } from "@/hooks/use-classes";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import PrintGradeDropDownMenu from "./print-grade-dropdown-menu";
import { useGradesByClass } from "@/hooks/use-student-grades";

const tinos = Tinos({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

export default function ViewStudentGrade() {
  const [isEditing, setIsEditing] = useState(false);
  const [isPrintingAll, setIsPrintingAll] = useState(false);
  const [readyStudentIds, setReadyStudentIds] = useState<Set<string>>(
    new Set(),
  );

  const contentRef = useRef<HTMLDivElement>(null);
  const allClassmatesRef = useRef<HTMLDivElement>(null);
  const hasPrintedRef = useRef(false);

  const onHandlePrint = useReactToPrint({
    contentRef: contentRef,
    documentTitle: "Student Grades",
  });

  const onHandlePrintAllClassmates = () => {
    hasPrintedRef.current = false;
    setReadyStudentIds(new Set());
    setIsPrintingAll(true);
  };

  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const studentId = searchParams.get("studentId");

  const pageParam = searchParams.get("page") ?? "0";
  const pageSizeParam = searchParams.get("pageSize") ?? "5";
  const pageSizeNum = Number(pageSizeParam) || 5;

  const gradesRecordRef = useRef<{ save: () => void } | null>(null);

  const { mutate: saveGrades, isPending: isSaving } = useInputGrades();

  const {
    data: studentData,
    error: studentDataError,
    isLoading: studentDataLoader,
  } = useFetchStudentById(studentId);

  const { data, isLoading: classesLoader } = useFetchClasses();

  const classes = data?.classes;

  const classId = studentData?.students.classesId;

  const classIdFromParams = searchParams.get("classId") ?? classId;

  const { data: classmatesData, isLoading: classmatesLoader } =
    useFetchStudentsByClass(classId ?? null);

  const classmates = classmatesData ?? [];

  // Bulk fetch: every period's grades, for every classmate, in one request.
  // Only enabled while actually printing the whole class — costs nothing
  // on the normal single-student view/edit page.
  const { data: classGrades, isLoading: classGradesLoading } = useGradesByClass(
    isPrintingAll ? (classId ?? "") : "",
  );

  const onHandlePrintAll = useReactToPrint({
    // NEW
    contentRef: allClassmatesRef,
    documentTitle: "Class Grades",
    onAfterPrint: () => setIsPrintingAll(false),
  });

  const gradesByStudent = useMemo(() => {
    const map = new Map<string, NonNullable<typeof classGrades>>();
    for (const g of classGrades ?? []) {
      const bucket = map.get(g.studentId);
      if (bucket) {
        bucket.push(g);
      } else {
        map.set(g.studentId, [g]);
      }
    }
    return map;
  }, [classGrades]);

  const sortedClassmates = [...classmates].sort((a: any, b: any) => {
    const firstCompare = a.firstName.localeCompare(b.firstName);
    if (firstCompare !== 0) return firstCompare;
    return a.lastName.localeCompare(b.lastName);
  });

  const normalizeLocation = (value?: string | null) =>
    (value ?? "").trim().toLowerCase();

  const currentLocation = normalizeLocation(studentData?.students?.location);

  // Same class (already guaranteed by useFetchStudentsByClass) + same location
  const printableClassmates = useMemo(
    () =>
      sortedClassmates.filter(
        (s: any) => normalizeLocation(s.location) === currentLocation,
      ),
    [classmates, currentLocation],
  );

  const onHandleGoHome = () => {
    if (!classIdFromParams || !studentId) {
      console.warn(
        "[onHandleGoHome] missing classIdFromParams or studentId, aborting",
        {
          classIdFromParams,
          studentId,
        },
      );
      return;
    }

    const params = new URLSearchParams();
    params.set("page", pageParam);
    params.set("pageSize", pageSizeParam);
    params.set("scrollTo", studentId);

    const target = `/admin-dashboard/students/${classIdFromParams}?${params.toString()}`;

    router.push(target);
  };

  // Ready to print once: the bulk grade fetch has resolved AND every
  // classmate's record has rendered
  useEffect(() => {
    if (!isPrintingAll || hasPrintedRef.current) return;
    if (classGradesLoading) return;
    if (printableClassmates.length === 0) return;
    if (readyStudentIds.size >= printableClassmates.length) {
      hasPrintedRef.current = true;
      onHandlePrintAll();
    }
  }, [
    isPrintingAll,
    classGradesLoading,
    readyStudentIds,
    printableClassmates.length,
  ]);

  // Safety net: don't get stuck forever if a record never reports ready.
  // Scales with class size since it should basically never fire now that
  // grades come from one bulk request instead of N parallel ones.
  useEffect(() => {
    if (!isPrintingAll) return;
    const fallback = setTimeout(
      () => {
        if (!hasPrintedRef.current) {
          hasPrintedRef.current = true;
          toast.warning("Some records didn't finish loading — printed anyway.");
          onHandlePrintAll();
        }
      },
      Math.max(15000, classmates.length * 1000),
    );
    return () => clearTimeout(fallback);
  }, [isPrintingAll, printableClassmates.length]);

  if (studentDataLoader || classesLoader || classmatesLoader) {
    return (
      <div className="mt-32.5 flex w-full items-center justify-center">
        <Spinner className="size-19" />
      </div>
    );
  }

  if (studentDataError)
    return <div>Error fetching students: {studentDataError.message}</div>;

  const onHandleEditGrade = () => {
    if (isEditing) {
      // Kill focus first so nothing scrolls itself back into view
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }

      gradesRecordRef.current?.save();

      // Wait a frame (or two) for the re-render/remount to finish, then scroll
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          window.scrollTo({ top: 0, behavior: "smooth" });
        });
      });
    }
    setIsEditing((prev) => !prev);
  };

  const onHandleStudentReady = (id: string) =>
    setReadyStudentIds((prev) => {
      if (prev.has(id)) return prev; // avoid unnecessary re-renders
      const next = new Set(prev);
      next.add(id);
      return next;
    });

  // Derive current class name from existing data
  const className = classes?.find(
    (cls: { id: string; name: string }) => cls.id === classId,
  )?.name;

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

  return (
    <main
      className={` ${tinos.className} h-full bg-[#f9faf8] px-1.5 py-3 text-[#4a4442] antialiased md:px-[25px] md:py-6`}
    >
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

        <div className="cursor-pointer w-full">
          <PrintGradeDropDownMenu
            onPrintCurrentStudent={onHandlePrint}
            onPrintAllClassmates={onHandlePrintAllClassmates}
            isPrintingAll={isPrintingAll}
          />
        </div>

        <motion.div
          className="cursor-pointer w-full tracking-wide flex items-center justify-center gap-2"
          whileTap={{ scale: 0.85 }}
        >
          <Button
            disabled={isSaving}
            onClick={onHandleEditGrade}
            className={`font-medium text-[16px] text-white h-12.5 w-full cursor-pointer rounded-md flex items-center justify-center gap-2 transition-all duration-150 ${
              isEditing
                ? "bg-green-700 hover:bg-green-600"
                : "bg-cyan-700 hover:bg-cyan-600"
            }`}
          >
            {!isSaving && (
              <UserPen
                strokeWidth={2.25}
                className="transition-transform duration-200 group-hover:translate-x-0.5 size-5"
              />
            )}

            {isSaving ? (
              <Spinner className="size-7" />
            ) : isEditing ? (
              "Save Changes"
            ) : (
              "Edit Record"
            )}
          </Button>
        </motion.div>
      </div>
      <div
        ref={contentRef}
        className="my-5 w-full gap-0 border px-1.5 md:w-221.75 mx-auto md:rounded-[15px] md:border-gray-300 md:p-6 md:shadow-lg"
      >
        <div className="mt-3 flex items-center px-3">
          <div className="flex w-full flex-col items-center justify-center">
            <h1 className="text-center text-[18px] font-semibold">
              OUR CHILDREN NURSERY AND KINDERGARTEN
            </h1>
            <p className="text-[14px]">Monrovia, Liberia</p>
            <p className="text-[14px]">Cell# +231881117906 </p>
            <p className="text-[14px] font-bold capitalize">
              {className} -{" "}
              <span>
                {studentData.students.firstName} {studentData.students.lastName}
              </span>
            </p>
          </div>
          <Image
            src="/images/ocnak-logo.jpeg"
            alt="ocnak logo"
            width={3000}
            height={3000}
            priority
            quality={75}
            className="height-[60px] w-15"
          />
        </div>

        {studentId && (
          <section className="mt-3 items-center justify-center md:flex">
            <GradesRecord
              key={studentId}
              ref={gradesRecordRef}
              studentId={studentId}
              classId={studentData?.students?.classesId}
              isEditing={isEditing}
              onEnterSave={onHandleEditGrade}
              onSave={(payload) =>
                saveGrades(payload, {
                  onSuccess: () => {
                    toast.success("Grades saved successfully!", {
                      position: "top-right",
                      style: {
                        "--normal-bg":
                          "color-mix(in oklab, light-dark(var(--color-green-600), var(--color-green-400)) 10%, var(--background))",
                        "--normal-text":
                          "light-dark(var(--color-green-600), var(--color-green-400))",
                        "--normal-border":
                          "light-dark(var(--color-green-600), var(--color-green-400))",
                      } as React.CSSProperties,
                    });
                  },
                })
              }
            />
          </section>
        )}

        <section className="my-4 grid w-fit grid-cols-1 items-stretch gap-5 font-medium tracking-wide md:grid-cols-3 md:pl-[37px] print:grid print:grid-cols-3 print:items-stretch print:pl-[33px]">
          <div className="text-[11px]">
            <p className="mb-1 font-semibold underline">Grading System</p>
            <div>
              <p>A - Excellent: [ 90 - 100 ]</p>
              <p>B - Good: [ 80 - 89 ]</p>
              <p>C - Fair: [ 70 - 79 ]</p>
              <p>D - Poor: [ 0 - 69 ]</p>
            </div>
          </div>
          <div className="flex gap-2">
            <div className="text-[11px]">
              <p className="mb-1 font-semibold underline">Student Overview</p>
              Conduct:{" "}
              <span className="capitalize">
                {studentData.students.conduct &&
                studentData.students.conduct.trim() !== ""
                  ? studentData.students.conduct
                  : "Not provided yet"}
              </span>
              <p>
                Days Absent:{" "}
                {studentData.students.daysAbsent ?? "Not provided yet"}
              </p>
              <p>
                Times Sick: {studentData.students.sick ?? "Not provided yet"}
              </p>
              <p>
                Times Tardy:{" "}
                {studentData.students.timesTardy ?? "Not provided yet"}
              </p>
            </div>
          </div>
        </section>
      </div>

      {isPrintingAll && (
        <div className="hidden print:block" ref={allClassmatesRef}>
          {printableClassmates.map((cm: any) => (
            <div
              key={cm.id}
              className="my-5 w-full gap-0 border px-1.5 md:w-221.75 mx-auto md:rounded-[15px] md:border-gray-300 md:p-6 md:shadow-lg break-after-page"
            >
              <div className="mt-3 flex items-center px-3">
                <div className="flex w-full flex-col items-center justify-center">
                  <h1 className="text-center text-[18px] font-semibold">
                    OUR CHILDREN NURSERY AND KINDERGARTEN
                  </h1>
                  <p className="text-[14px]">Monrovia, Liberia</p>
                  <p className="text-[14px]">Cell# +231881117906</p>
                  <p className="text-[14px] font-bold">
                    {className} -{" "}
                    <span>
                      {cm.firstName} {cm.lastName}
                    </span>
                  </p>
                </div>

                <Image
                  src="/images/ocnak-logo.jpeg"
                  alt="ocnak logo"
                  width={3000}
                  height={3000}
                  priority
                  quality={75}
                  sizes="(max-width: 640px) 80px, (max-width: 1024px) 100px, 120px"
                  className="h-16 w-16 sm:h-20 sm:w-20"
                />
              </div>

              <section className="mt-3 items-center justify-center md:flex">
                <GradesRecord
                  studentId={cm.id}
                  classId={classId}
                  isEditing={false}
                  preloadedGrades={gradesByStudent.get(cm.id) ?? []}
                  onReady={() => onHandleStudentReady(cm.id)}
                />
              </section>

              <section className="my-4 grid w-fit grid-cols-1 items-stretch gap-5 font-medium tracking-wide md:grid-cols-3 md:pl-[37px] print:grid print:grid-cols-3 print:items-stretch print:pl-[33px]">
                <div className="text-[11px]">
                  <p className="mb-1 font-semibold underline">Grading System</p>
                  <div>
                    <p>A - Excellent: [ 90 - 100 ]</p>
                    <p>B - Good: [ 80 - 89 ]</p>
                    <p>C - Fair: [ 70 - 79 ]</p>
                    <p>D - Poor: [ 0 - 69 ]</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="text-[11px]">
                    <p className="mb-1 font-semibold underline">
                      Student Overview
                    </p>
                    Conduct:{" "}
                    <span className="capitalize">
                      {cm.conduct && cm.conduct.trim() !== ""
                        ? cm.conduct
                        : "Not provided yet"}
                    </span>
                    <p>Days Absent: {cm.daysAbsent ?? "Not provided yet"}</p>
                  </div>
                </div>
              </section>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
