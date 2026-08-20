"use client";

import LoadingCircleSpinner from "@/components/animation/LoadingCircleSpinner";
import { Crimson_Text } from "next/font/google";
import OverallClassSelect from "./overall-class-select";
import OverallPeriodSelect from "./overall-period-select";
import OverallGradesRecord from "./overall-grade-record";
import { useFilterStore } from "@/store/filterStore";
import Image from "next/image";

const crimson_text = Crimson_Text({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
});

export default function OverallGradePage() {
  const { className: classId, periodId } = useFilterStore();
  return (
    <>
      <section className="h-full w-full bg-[#f9faf8] px-3.75 py-3 md:px-6.25 md:py-6">
        <h1 className={`${crimson_text.className} text-[29px] font-semibold`}>
          Overall Grade
        </h1>

        <div className="gap-2 flex w-full sm:w-[65%] mt-4">
          <OverallClassSelect />
          <OverallPeriodSelect />
        </div>

        {!classId ? (
          <div
            className={`mt-15 flex w-full flex-col items-center justify-center gap-2 text-[22px] font-semibold text-slate-800 ${crimson_text.className}`}
          >
            <Image
              src="/images/undraw_my-answer_au1h.svg"
              alt="empty rooster image"
              width={300}
              height={300}
              className="size-48"
              priority
              quality={75}
              sizes="(max-width: 768px) 100vw, 50vw"
            />

            <h1 className="text-center text-[22px] font-semibold md:text-[26px]">
              Select a class to view student grades and roster.
            </h1>
          </div>
        ) : (
          <div className="my-4 rounded-md border border-gray-300 shadow-md">
            <OverallGradesRecord classId={classId} periodId={periodId} />
          </div>
        )}
      </section>
    </>
  );
}
