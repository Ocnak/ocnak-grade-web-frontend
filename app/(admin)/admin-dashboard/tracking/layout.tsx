import { Fredoka } from "next/font/google";
import StudentInputSearch from "./student-input-search";
import StudentSelectLocation from "./student-select-location";
import StudentTrackingMenu from "./student-tracking-menu";
import StudentSelectClass from "../teachers/teacher-select-class";

const fredoka = Fredoka({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export default function AdminRootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="text-slate-800 antialiased">
      <div className="w-full  bg-[#f9faf8] px-3.75 py-3 md:px-6.25 md:py-6">
        <div>
          <h1
            className={`${fredoka.className} text-[29px] font-semibold md:text-[35px]`}
          >
            Student Monitoring
          </h1>

          <div>
            <StudentTrackingMenu />
          </div>
        </div>

        <div className="mt-11.25 mb-8 grid w-full grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="w-full space-x-4 space-y-4">
            <StudentInputSearch />
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-2">
            <StudentSelectLocation />
            <StudentSelectClass />
            {/* <div className="grid col-span-2"></div> */}
          </div>
        </div>

        {children}
      </div>
    </div>
  );
}
