import StudentAcademicHistoryDataTable from "./[classId]/student-academic-history-data-table";
import Image from "next/image";
import { Crimson_Text } from "next/font/google";

const crimson_text = Crimson_Text({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
});

export default async function AcademicHistory({
  params,
}: {
  params: Promise<{ classId: string }>;
}) {
  const { classId } = await params;

  if (!classId) {
    return (
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
          Choose a class to display the student roster.
        </h1>
      </div>
    );
  }

  return (
    <>
      <section className="h-full bg-[#f9faf8] py-6">
        <StudentAcademicHistoryDataTable classId={classId} />
      </section>
    </>
  );
}
