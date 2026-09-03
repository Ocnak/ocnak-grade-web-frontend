"use client";

import { Outfit, Crimson_Text } from "next/font/google";
import AppHeaderDropdownMenu from "../admin/app-header-dropdown-menu";

import ReponsiveSidebar from "./teachers/reponsive-sidebar";
import { useSession } from "@/hooks/use-session";

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
  const { data: session, isLoading: sessionLoader } = useSession();

  // Captilize the first letter of the first_name attribute
  const capitalizeName = (str?: string) =>
    str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : "";

  // const firstName = `${capitalizeName(session?.user.firstName)}`;
  const firstName = `${capitalizeName(session?.user.firstName ?? undefined)}`;

  // Captilize the first letter of the user_role attribute
  const capitalizeUserRole = (str?: string) =>
    str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : "";

  const userRole = `${capitalizeUserRole(session?.user.userRole ?? undefined)}`;

  return (
    <div className="fixed top-0 right-0 left-0 z-40 h-20 w-full border-none bg-white/70 px-2.5 shadow-md backdrop-blur-lg md:left-62 md:w-[calc(100%-15.5rem)] md:px-0">
      <header className="flex h-full w-full items-center justify-end px-3 text-slate-800 md:px-5">
        <div className="hidden items-center gap-2 md:flex">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-800">
            <p
              className={`text-[16px] font-medium ${crimson_text.className} text-white`}
            >
              {session?.user.firstName?.charAt(0).toUpperCase()}
              {session?.user.lastName?.charAt(0).toUpperCase()}
            </p>
          </div>
          <div className="flex items-center gap-2 text-[14px] font-semibold text-[#344054]">
            <div>
              <p className="text-[13px] font-medium">{userRole}</p>
              <p>Hey {firstName}</p>
            </div>
            <AppHeaderDropdownMenu />
          </div>
        </div>

        <div className="block md:hidden">
          <ReponsiveSidebar />
        </div>
      </header>
    </div>
  );
}
