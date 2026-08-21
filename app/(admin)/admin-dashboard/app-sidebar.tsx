"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { GiTeacher } from "react-icons/gi";
import { PiStudent } from "react-icons/pi";
import { FaHistory } from "react-icons/fa";
import { FaRankingStar } from "react-icons/fa6";
import { SiGoogleclassroom } from "react-icons/si";
import { Outfit, Fredoka } from "next/font/google";
import { usePathname } from "next/navigation";
import { CirclePile } from "lucide-react";
import Image from "next/image";

const fredoka = Fredoka({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

// menu items
const items = [
  {
    title: "Teachers",
    url: "/admin-dashboard/teachers",
    icon: GiTeacher,
  },
  {
    title: "Students",
    url: "/admin-dashboard/students",
    icon: PiStudent,
  },

  {
    title: "Academic History",
    url: "/admin-dashboard/academic-history",
    icon: FaHistory,
  },

  {
    title: "Overall Grade",
    url: "/admin-dashboard/overall-grade",
    icon: CirclePile,
  },
  {
    title: "Classes & Subjects",
    url: "/admin-dashboard/classes",
    icon: SiGoogleclassroom,
  },
  {
    title: "Star Students Board",
    url: "/admin-dashboard/star-students-board",
    icon: FaRankingStar,
  },
];

export default function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar
      className={`border-none border-gray-300 z-50 bg-white shadow-md ${outfit.className}`}
    >
      <SidebarContent className="bg-white">
        <SidebarGroup>
          <SidebarGroupLabel>
            <div className="mt-3 flex items-center gap-2">
              <Image
                src="/images/ocnak-logo.jpeg"
                alt="ocnak logo"
                width={3000}
                height={3000}
                className="h-7 w-7"
              ></Image>

              <h2
                className={`font-semibold ${fredoka.className} text-[25px] text-slate-800 uppercase`}
              >
                Ocnak Daycare
              </h2>
            </div>
          </SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu className="mt-10">
              {items.map((item) => {
                const isActive = pathname.startsWith(item.url);
                return (
                  <SidebarMenuItem key={item.title} className="cursor-pointer">
                    <SidebarMenuButton
                      className={` rounded h-14 transition-all duration-300 hover:bg-slate-800 hover:text-white ${
                        isActive ? "bg-slate-800 text-white" : ""
                      }`}
                    >
                      <a
                        href={item.url}
                        className="h-14 flex  items-center  gap-4 w-full text-[15px] font-semibold"
                      >
                        <item.icon
                          style={{
                            width: "30px",
                            height: "30px",
                          }}
                        />

                        <span>{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
