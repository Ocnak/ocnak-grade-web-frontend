// import { Fredoka } from "next/font/google";
// import TeachersMain from "./teachers-main";

// const fredoka = Fredoka({
//   subsets: ["latin"],
//   weight: ["300", "400", "500", "600", "700"],
//   display: "swap",
// });

// export default function TeachersPage() {
//   return (
//     <main className="h-full w-full bg-[#f9faf8] px-3.75 py-3 md:px-6.25 md:py-6">
//       <h1
//         className={`${fredoka.className} text-[29px] font-semibold md:text-[35px]`}
//       >
//         Teachers
//       </h1>

//       <TeachersMain />
//     </main>
//   );
// }

import { cookies } from "next/headers";
import { Fredoka } from "next/font/google";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import {
  fetchTeachers,
  TEACHERS_QUERY_KEY,
} from "@/lib/prefreshing-components/fetch-teachers";
import TeachersMain from "./teachers-main";

const fredoka = Fredoka({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export default async function TeachersPage() {
  const queryClient = new QueryClient();

  // forward only the session cookies, not every cookie the browser has
  const cookieStore = await cookies();
  const sessionCookie = cookieStore
    .getAll()
    .filter((c) => c.name.startsWith("ocnak."))
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");

  // if this fails (signed out, cookie not visible here), nothing is passed down
  // and the client fetches the list as before
  await queryClient.prefetchQuery({
    queryKey: TEACHERS_QUERY_KEY,
    queryFn: () => fetchTeachers(sessionCookie),
  });

  return (
    <main className="h-full w-full bg-[#f9faf8] px-3.75 py-3 md:px-6.25 md:py-6">
      <h1
        className={`${fredoka.className} text-[29px] font-semibold md:text-[35px]`}
      >
        Teachers
      </h1>

      <HydrationBoundary state={dehydrate(queryClient)}>
        <TeachersMain />
      </HydrationBoundary>
    </main>
  );
}
