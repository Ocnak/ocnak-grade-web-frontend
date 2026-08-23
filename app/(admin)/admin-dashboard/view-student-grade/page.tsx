"use client";

import { Tinos } from "next/font/google";
import GradesRecord from "./grades-record";
import { useSearchParams } from "next/navigation";
import { useFetchStudentById } from "@/hooks/use-students";
import LoadingCircleSpinner from "@/components/animation/LoadingCircleSpinner";
import * as motion from "motion/react-client";
import { ArrowLeftIcon, PrinterCheck, UserPen } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";
import { toast } from "sonner";
import { useInputGrades } from "@/hooks/use-students";
import { useFetchClasses } from "@/hooks/use-classes";
import { Spinner } from "@/components/ui/spinner";
import Image from "next/image";

const tinos = Tinos({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

export default function ViewStudentGrade() {
  const [isEditing, setIsEditing] = useState(false);

  const contentRef = useRef<HTMLDivElement>(null);

  const onHandlePrint = useReactToPrint({
    contentRef: contentRef,
    documentTitle: "Student Grades",
  });

  const router = useRouter();
  const searchParams = useSearchParams();
  const studentId = searchParams.get("studentId");

  const gradesRecordRef = useRef<{ save: () => void } | null>(null);

  const { mutate: saveGrades, isPending: isSaving } = useInputGrades();

  const {
    data: studentData,
    error: studentDataError,
    isLoading: studentDataLoader,
  } = useFetchStudentById(studentId);

  const { data, isLoading: classesLoader } = useFetchClasses();

  const classes = data?.classes;

  if (studentDataLoader || classesLoader) {
    return (
      <div className="mt-32.5 flex w-full items-center justify-center">
        <LoadingCircleSpinner />
      </div>
    );
  }

  if (studentDataError)
    return <div>Error fetching students: {studentDataError.message}</div>;

  const onHandleEditGrade = () => {
    if (isEditing) {
      gradesRecordRef.current?.save();
    }
    setIsEditing((prev) => !prev);
  };

  const classId = studentData?.students.classesId;

  // Derive current class name from existing data
  const className = classes?.find(
    (cls: { id: string; name: string }) => cls.id === classId,
  )?.name;

  return (
    <main
      className={`mt-18 ${tinos.className} h-full bg-[#f9faf8] px-1.5 py-3 text-[#4a4442] antialiased md:px-[25px] md:py-6`}
    >
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-2 md:grid-cols-3">
        <motion.button
          whileTap={{ scale: 0.85 }}
          onClick={() => router.back()}
          className="font-medium text-[15px] bg-black text-white flex items-center justify-center gap-2 h-12 cursor-pointer rounded-md transition-none"
        >
          <ArrowLeftIcon
            strokeWidth={2.25}
            className="transition-transform duration-200 group-hover:translate-x-0.5 size-5 "
          />
          Go Back
        </motion.button>

        <motion.button
          className="font-medium text-[15px] bg-black text-white flex items-center justify-center gap-2 h-12 cursor-pointer rounded-md transition-none"
          whileTap={{ scale: 0.85 }}
          onClick={onHandlePrint}
        >
          <PrinterCheck
            strokeWidth={2.25}
            className="transition-transform duration-200 group-hover:translate-x-0.5 size-5"
          />
          Print Record
        </motion.button>

        <motion.button
          className={`font-medium text-[15px] text-white h-12 cursor-pointer rounded-md flex items-center justify-center gap-2 transition-all duration-150 ${
            isEditing
              ? "bg-green-700 hover:bg-green-600"
              : "bg-cyan-700 hover:bg-cyan-600"
          }`}
          whileTap={{ scale: 0.85 }}
          disabled={isSaving}
          onClick={onHandleEditGrade}
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
        </motion.button>
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
            <p className="text-[14px]">Cell# 0888925022 / 0888925022 </p>
            <p className="text-[14px] font-bold">
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
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
