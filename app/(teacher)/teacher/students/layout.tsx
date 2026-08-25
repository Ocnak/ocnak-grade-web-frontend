import StudentClassMenu from "./student-class-menu";
import { Fredoka } from "next/font/google";
import StudentInputSearch from "./student-input-search";
import CreateStudentModal from "./create-student-modal";
import DeleteStudentModal from "./delete-student-modal";

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
    <div className="text-slate-800 antialiased">
      <section className="h-full w-full mx-auto max-w-285 bg-[#f9faf8] px-3.75 py-3 md:px-6.25 md:py-6">
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
          <div className="w-full">
            <StudentInputSearch />
          </div>
          <div className="grid grid-cols-2 gap-4 ">
            <DeleteStudentModal />
          </div>
        </div>
        {children}
      </section>
    </div>
  );
}
