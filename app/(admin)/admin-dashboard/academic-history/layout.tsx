import StudentHistoryInputSearch from "./student-history-input-search";
import { Crimson_Text } from "next/font/google";
import DeleteStudentHistoryModal from "./delete-student-history-modal";
import StudentaHistorySelectYear from "./student-history-select-year";
import StudentHistoryClassMenu from "./student-history-class-menu";

const crimson_text = Crimson_Text({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
});

export default function AcademicHistoryLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="text-slate-800 antialiased">
      <section className="h-full w-full bg-[#f9faf8] px-3.75 py-3 md:px-6.25 md:py-6">
        <h1
          className={`${crimson_text.className} mb-3 text-[29px] font-semibold`}
        >
          Academic History
        </h1>

        <div className="w-full sm:max-w-75">
          <StudentHistoryClassMenu />
        </div>

        <div className="mt-11.25 grid w-full grid-cols-1 gap-4 md:grid-cols-2">
          <div className="w-full md:max-w-106">
            <StudentHistoryInputSearch />
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <DeleteStudentHistoryModal />
            <StudentaHistorySelectYear />
          </div>
        </div>
        {children}
      </section>
    </div>
  );
}
