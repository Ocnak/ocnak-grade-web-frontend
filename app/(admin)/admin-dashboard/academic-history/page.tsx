import StudentAcademicHistoryDataTable from "./[classId]/student-academic-history-data-table";
import Image from "next/image";
import { Fredoka } from "next/font/google";

const fredoka = Fredoka({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
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
        className={`mt-15 flex w-full flex-col items-center justify-center gap-2 text-[22px] font-semibold text-slate-800 ${fredoka.className}`}
      >
        <Image
          src="/images/undraw_my-answer_au1h.svg"
          alt="empty rooster image"
          width={300}
          height={300}
          className="h-auto w-56 md:w-64 lg:size-66"
          priority
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
    <>
      <section className="h-full bg-[#f9faf8] py-6">
        <StudentAcademicHistoryDataTable classId={classId} />
      </section>
    </>
  );
}
