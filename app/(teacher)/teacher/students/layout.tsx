// import StudentClassMenu from "./student-class-menu";
// import { Fredoka } from "next/font/google";
// import StudentInputSearch from "./student-input-search";
// import CreateStudentModal from "./create-student-modal";
// import DeleteStudentModal from "./delete-student-modal";

// const fredoka = Fredoka({
//   subsets: ["latin"],
//   weight: ["300", "400", "500", "600", "700"],
//   display: "swap",
// });

// export default function StudentRootLayout({
//   children,
// }: Readonly<{
//   children: React.ReactNode;
// }>) {
//   return (
//     <div className="text-slate-800 antialiased">
//       <section className="h-full w-full mx-auto max-w-285 bg-[#f9faf8] px-3.75 py-3 md:px-6.25 md:py-6">
//         <div className="flex w-full items-end justify-end ">
//           <CreateStudentModal />
//         </div>
//         <h1
//           className={`${fredoka.className} text-[29px] font-semibold md:text-[35px]`}
//         >
//           Students
//         </h1>

//         <StudentClassMenu />

//         <div className="mt-11.25 grid w-full grid-cols-1 gap-4 lg:grid-cols-2">
//           <div className="w-full">
//             <StudentInputSearch />
//           </div>
//           <div className="grid grid-cols-2 gap-4 ">
//             <DeleteStudentModal />
//           </div>
//         </div>
//         {children}
//       </section>
//     </div>
//   );
// }

import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { Fredoka } from "next/font/google";
import { getSessionCookie } from "@/lib/prefreshing-components/get-session-cookie";
import {
  fetchStudents,
  STUDENTS_QUERY_KEY,
} from "@/lib/prefreshing-components/fetch-students";
import {
  fetchClasses,
  CLASSES_QUERY_KEY,
} from "@/lib/prefreshing-components/fetch-classes";
import StudentClassMenu from "./student-class-menu";
import StudentInputSearch from "./student-input-search";
import CreateStudentModal from "./create-student-modal";
import DeleteStudentModal from "./delete-student-modal";

const fredoka = Fredoka({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

// a layout stays mounted while you switch classes, so this prefetch runs once, not on every class change
export default async function StudentRootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const queryClient = new QueryClient();
  const cookie = await getSessionCookie();

  // both requests run at the same time; a failure just means the client fetches it instead
  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: STUDENTS_QUERY_KEY,
      queryFn: () => fetchStudents(cookie),
    }),
    queryClient.prefetchQuery({
      queryKey: CLASSES_QUERY_KEY,
      queryFn: () => fetchClasses(cookie),
    }),
  ]);

  return (
    <div className="text-slate-800 antialiased">
      <HydrationBoundary state={dehydrate(queryClient)}>
        <section className="mx-auto h-full w-full max-w-285 bg-[#f9faf8] px-3.75 py-3 md:px-6.25 md:py-6">
          <div className="flex w-full items-end justify-end">
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
            <div className="grid grid-cols-2 gap-4">
              <DeleteStudentModal />
            </div>
          </div>

          {children}
        </section>
      </HydrationBoundary>
    </div>
  );
}
