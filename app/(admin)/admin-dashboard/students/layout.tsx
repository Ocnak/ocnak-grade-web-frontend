import StudentClassMenu from "./student-class-menu";
import { Crimson_Text, Fredoka } from "next/font/google";
import StudentInputSearch from "./student-input-search";
import CreateStudentModal from "./create-student-modal";
import DeleteStudentModal from "./delete-student-modal";
import ArchiveStudentModal from "./archive-student-modal";
import StudentSelectLocation from "./student-select-location";
import { CirclePlus } from "lucide-react";

const fredoka = Fredoka({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export default function StudentRootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className=" text-slate-800 antialiased">
      <main className="h-full w-full bg-[#f9faf8] px-3.75 py-3 md:px-6.25 md:py-6">
        <div className="flex w-full items-end justify-end ">
          <CreateStudentModal />
        </div>
        <h1
          className={`${fredoka.className} text-[29px] font-semibold md:text-[35px]`}
        >
          Students
        </h1>

        <StudentClassMenu />

        <div className="mt-11.25 grid w-full grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="w-full space-x-4 space-y-4">
            <StudentInputSearch />
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-2">
            <StudentSelectLocation />
            <DeleteStudentModal />
            <div className="grid col-span-2">
              <ArchiveStudentModal />
            </div>
          </div>
        </div>
        {children}
      </main>
    </div>
  );
}
