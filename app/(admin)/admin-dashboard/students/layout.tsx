import StudentClassMenu from "./student-class-menu";
import { Crimson_Text } from "next/font/google";
import StudentInputSearch from "./student-input-search";
import CreateStudentModal from "./create-student-modal";
import DeleteStudentModal from "./delete-student-modal";
import ArchiveStudentModal from "./archive-student-modal";

const crimson_text = Crimson_Text({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
});
export default function StudentRootLayout({
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
          Student
        </h1>

        <StudentClassMenu />

        <div className="mt-11.25 grid w-full grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="w-full">
            <StudentInputSearch />
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <CreateStudentModal />
            <DeleteStudentModal />
            <div className="grid col-span-2">
              <ArchiveStudentModal />
            </div>
          </div>
        </div>
        {children}
      </section>
    </div>
  );
}
