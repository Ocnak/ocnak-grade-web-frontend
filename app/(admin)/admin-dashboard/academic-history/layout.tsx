import StudentHistoryInputSearch from "./student-history-input-search";
import { Fredoka } from "next/font/google";
import DeleteStudentHistoryModal from "./delete-student-history-modal";
import StudentaHistorySelectYear from "./student-history-select-year";
import StudentHistoryClassMenu from "./student-history-class-menu";
import UnArchiveStudentModal from "./unarchive-student-modal";
import StudentAcademicHistorySelectLocation from "./student-academic-history-select-location";

const fredoka = Fredoka({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export default function AcademicHistoryLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="text-slate-800 antialiased">
      <main className="h-full mt-18 w-full bg-[#f9faf8] px-3.75 py-3 md:px-6.25 md:py-6">
        <h1
          className={`${fredoka.className} text-[29px] font-semibold md:text-[35px]`}
        >
          Academic History
        </h1>

        <div className="w-full sm:max-w-75">
          <StudentHistoryClassMenu />
        </div>

        <div className="mt-11.25 grid w-full grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="w-full space-x-4 space-y-4">
            <StudentHistoryInputSearch />
            <StudentAcademicHistorySelectLocation />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <DeleteStudentHistoryModal />
            <StudentaHistorySelectYear />

            <div className="grid col-span-2">
              <UnArchiveStudentModal />
            </div>
          </div>
        </div>
        {children}
      </main>
    </div>
  );
}
