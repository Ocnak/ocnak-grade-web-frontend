// "use client";

// import { Outfit, Crimson_Text } from "next/font/google";
// import AppHeaderDropdownMenu from "../admin/app-header-dropdown-menu";

// import ReponsiveSidebar from "./teachers/reponsive-sidebar";
// import { useSession } from "@/hooks/use-session";
// import { useFetchUserData } from "@/hooks/use-users-info";

// const crimson_text = Crimson_Text({
//   subsets: ["latin"],
//   weight: ["400", "600", "700"],
//   display: "swap",
// });

// const outfit = Outfit({
//   subsets: ["latin"],
//   weight: ["300", "400", "500", "600", "700", "800"],
//   display: "swap",
// });

// export default function AppHeader() {
//   const { data: session, isLoading: sessionLoading } = useSession();

//   const { data: userData, isLoading: userDataLoading } = useFetchUserData();

//   console.log("session data:", session);
//   console.log("user data:", userData);

//   // Capitalize the first letter of a string
//   const capitalize = (str?: string) =>
//     str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : "";

//   const firstName = capitalize(session?.user.firstName ?? undefined);
//   const userRole = capitalize(session?.user.userRole ?? undefined);

//   const initials =
//     session?.user.firstName && session?.user.lastName
//       ? `${session.user.firstName.charAt(0).toUpperCase()}${session.user.lastName
//           .charAt(0)
//           .toUpperCase()}`
//       : "";

//   return (
//     <div className="fixed top-0 right-0 left-0 z-40 h-20 w-full border-none bg-white/70 px-2.5 shadow-md backdrop-blur-lg md:left-62 md:w-[calc(100%-15.5rem)] md:px-0">
//       <header className="flex h-full w-full items-center justify-end px-3 text-slate-800 md:px-5">
//         <div className="hidden items-center gap-2 md:flex">
//           <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-800">
//             {sessionLoading ? (
//               <div className="h-12 w-12 animate-pulse rounded-full bg-slate-300" />
//             ) : (
//               <p
//                 className={`text-lg font-semibold ${crimson_text.className} text-white`}
//               >
//                 {initials || "?"}
//               </p>
//             )}
//           </div>
//           <div className="flex items-center gap-2 text-[14px] font-semibold text-[#344054]">
//             <div>
//               {sessionLoading ? (
//                 <>
//                   <div className="mb-1 h-3 w-16 animate-pulse rounded bg-slate-200" />
//                   <div className="h-3.5 w-20 animate-pulse rounded bg-slate-200" />
//                 </>
//               ) : (
//                 <>
//                   <p className="text-[13px] font-medium">{userRole || "—"}</p>
//                   <p>Hey {firstName || "there"}</p>
//                 </>
//               )}
//             </div>
//             <AppHeaderDropdownMenu />
//           </div>
//         </div>

//         <div className="block md:hidden">
//           <ReponsiveSidebar />
//         </div>
//       </header>
//     </div>
//   );
// }

"use client";

import { Outfit, Crimson_Text } from "next/font/google";
import AppHeaderDropdownMenu from "@/app/(admin)/admin/app-header-dropdown-menu";
import { useSession } from "@/hooks/use-session";
import ReponsiveSidebar from "./teachers/reponsive-sidebar";
import { useFetchUserData } from "@/hooks/use-users-info";

const crimson_text = Crimson_Text({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

export default function AppHeader() {
  const { isLoading: sessionLoading } = useSession();
  const { data: userData, isLoading: userDataLoading } = useFetchUserData();

  const isLoading = sessionLoading || userDataLoading;

  // Capitalize the first letter of a string
  const capitalize = (str?: string) =>
    str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : "";

  const firstName = capitalize(userData?.user.firstName ?? undefined);
  const userRole = capitalize(userData?.user.userRole ?? undefined);

  const initials =
    userData?.user.firstName && userData?.user.lastName
      ? `${userData.user.firstName.charAt(0).toUpperCase()}${userData.user.lastName
          .charAt(0)
          .toUpperCase()}`
      : "";

  return (
    <header
      className={`h-20 border-b  bg-white px-3.76 py-6 shadow md:px-8.75 ${outfit.className}`}
    >
      <div className="flex items-center justify-end mx-auto max-w-285">
        <div className="hidden items-center gap-2 md:flex ">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-800">
            {isLoading ? (
              <div className="h-12 w-12 animate-pulse rounded-full bg-slate-300" />
            ) : (
              <p
                className={`text-lg font-semibold ${crimson_text.className} text-white`}
              >
                {initials || "?"}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 text-[14px] font-semibold text-[#344054]">
            <div>
              {isLoading ? (
                <>
                  <div className="mb-1 h-3 w-16 animate-pulse rounded bg-slate-200" />
                  <div className="h-3.5 w-20 animate-pulse rounded bg-slate-200" />
                </>
              ) : (
                <>
                  <p className="text-[13px] font-medium">{userRole || "—"}</p>
                  <p>Hey {firstName || "there"}</p>
                </>
              )}
            </div>
            <AppHeaderDropdownMenu />
          </div>
        </div>

        <div className="block md:hidden  px-3.75">
          <ReponsiveSidebar />
        </div>
      </div>
    </header>
  );
}
