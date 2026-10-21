"use client";

import Image from "next/image";
import { Fredoka } from "next/font/google";
import { useFilterStore } from "@/store/filterStore";
import OverallGradesRecord from "./overall-grade-record";

const fredoka = Fredoka({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export default function OverallMainContent() {
  const { className: classId, periodId } = useFilterStore();

  if (!classId) {
    return (
      <div
        className={`mt-15 flex w-full flex-col items-center justify-center gap-2 text-[22px] font-semibold text-slate-800 ${fredoka.className}`}
      >
        <Image
          src="/images/undraw_my-answer_au1h.svg"
          alt="empty rooster image"
          width={300}
          height={300}
          className="h-auto w-56 md:w-64 lg:size-66"
          preload
          quality={75}
          sizes="(max-width: 640px) 160px, (max-width: 768px) 224px, (max-width: 1024px) 256px, 264px"
        />

        <h1 className="text-center text-[22px] font-semibold md:text-[26px]">
          Choose a class to display the student roster.
        </h1>
      </div>
    );
  }

  return (
    <div className="my-4 lg:max-w-221 xl:max-w-310 rounded-md border border-gray-300 shadow-md">
      <OverallGradesRecord classId={classId} periodId={periodId} />
    </div>
  );
}
