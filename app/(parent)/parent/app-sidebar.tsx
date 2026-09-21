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
import { Outfit, Fredoka } from "next/font/google";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { FileSpreadsheet } from "lucide-react";

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

const items = [
  {
    title: "Grades",
    url: "/parent/grades",
    icon: FileSpreadsheet,
  },
];

export default function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar
      className={` border border-gray-300 z-50 bg-white shadow-sm ${outfit.className}`}
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
                priority
                quality={75}
              />

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
