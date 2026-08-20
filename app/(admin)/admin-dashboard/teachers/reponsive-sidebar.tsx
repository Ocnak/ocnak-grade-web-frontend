"use client";

import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import {
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { GiTeacher } from "react-icons/gi";
import { PiStudent } from "react-icons/pi";
import { FaHistory } from "react-icons/fa";
import { SiGoogleclassroom } from "react-icons/si";
import { Crimson_Text, Outfit } from "next/font/google";
import { usePathname } from "next/navigation";
// import { logout } from "@/app/auth/auth-actions";
import { useState, useTransition } from "react";
// import { useAuth } from "@/app/contexts/auth-context";
import { CirclePile, Loader, LogOut, Menu } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { authClient } from "@/lib/auth-client";
import { Spinner } from "@/components/ui/spinner";
import { useFetchUserData } from "@/hooks/use-users-info";
import { useSession } from "@/hooks/use-session";
import { FaRankingStar } from "react-icons/fa6";

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

// menu items
const items = [
  {
    title: "Teacher",
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

export default function ReponsiveSidebar() {
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const { data: session, isLoading: sessionLoader } = useSession();
  const { data: personalData } = useFetchUserData();

  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const queryClient = useQueryClient();

  const onHandleSignOut = async () => {
    setIsSigningOut(true);
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["session"] });
          router.push("/"); // redirect after sign out
        },
        onError: (ctx) => {
          console.error("Sign out failed:", ctx.error.message);
          setIsSigningOut(false);
        },
      },
    });
  };

  const capitalizeName = (str?: string) =>
    str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : "";

  const fullName = `${capitalizeName(session?.user.firstName ?? undefined)} ${capitalizeName(session?.user.lastName ?? undefined)}`;

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Menu strokeWidth={2.25} className="size-7  text-slate-800" />
      </SheetTrigger>
      <SheetContent className="w-85">
        <SheetHeader>
          <SheetTitle>
            <div className="flex items-center gap-2">
              {/* <Image
                src="/images/ocnak-logo.jpeg"
                alt="ocnak logo"
                width={3000}
                height={3000}
                className="h-7 w-7"
              ></Image> */}
              <p
                className={`font-bold ${crimson_text.className} mt-4 text-[17px] text-slate-800 uppercase`}
              >
                Grades Tracking System
              </p>
            </div>
          </SheetTitle>
          <SheetDescription className="hidden"></SheetDescription>
        </SheetHeader>

        <SidebarGroupContent className="px-2">
          <SidebarMenu className="">
            {items.map((item) => {
              const isActive = pathname.startsWith(item.url);
              return (
                <SidebarMenuItem key={item.title} className="cursor-pointer">
                  <SidebarMenuButton
                    asChild
                    className={`rounded transition-all duration-300 hover:bg-slate-800 hover:text-white ${
                      isActive ? "bg-slate-800 text-white" : ""
                    }`}
                  >
                    <a
                      href={item.url}
                      className="h-14 text-[15px] font-semibold"
                    >
                      <item.icon
                        style={{
                          width: "28px",
                          height: "28px",
                        }}
                      />{" "}
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroupContent>

        <SheetFooter>
          <SheetClose asChild>
            <div className={`${outfit.className} w-full duration-300`}>
              <div>
                {" "}
                <div className="mb-2">
                  <p>{fullName}</p>
                  <p className="text-[12px] text-gray-500">
                    {session?.user.email}
                  </p>{" "}
                </div>
              </div>
              <Separator />
              <div>
                <button
                  onClick={onHandleSignOut}
                  className="w-full cursor-pointer rounded py-2 font-semibold tracking-wide text-gray-700 shadow-none"
                >
                  <div className="flex items-center justify-center gap-1.5 rounded text-[14px]">
                    {isSigningOut ? (
                      <Spinner />
                    ) : (
                      <>
                        <LogOut size={19} color="#374151" /> Logout
                      </>
                    )}
                  </div>
                </button>
              </div>
            </div>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
