"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { BsThreeDots } from "react-icons/bs";
import UpdateTeacherModal from "./update-teacher-modal";
import DeleteTeacherModal from "./delete-teacher-modal";
import { Crimson_Text, Outfit } from "next/font/google";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

const crimson_text = Crimson_Text({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
});

interface TeacherCardDropdownMenuProps {
  teacherId: string;
  userId: string;
}
export default function TeacherCardDropdownMenu(
  props: TeacherCardDropdownMenuProps,
) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="absolute cursor-pointer right-5">
          <BsThreeDots className="size-8 cursor-pointer text-gray-400" />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className={`${outfit.className} data-[state=closed]:slide-out-to-left-0 data-[state=open]:slide-in-from-left-0 data-[state=closed]:slide-out-to-bottom-20 data-[state=open]:slide-in-from-bottom-20 data-[state=closed]:zoom-out-100 mr-[40px] w-40 duration-200 md:mr-[90px]`}
      >
        <DropdownMenuLabel className="font-semibold">
          <h2
            className={`text-[17px] font-bold tracking-tight ${crimson_text.className}`}
          >
            Card Detail
          </h2>
        </DropdownMenuLabel>
        <DropdownMenuGroup className="text-slate-800">
          <DropdownMenuItem
            className="justify-between"
            onSelect={(event) => event.preventDefault()}
          >
            <UpdateTeacherModal
              teacherId={props.teacherId}
              userId={props.userId}
            />
          </DropdownMenuItem>
          <DropdownMenuItem
            className="justify-between"
            onSelect={(event) => event.preventDefault()}
          >
            <DeleteTeacherModal
              teacherId={props.teacherId}
              // userId={props.userId}
            />
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
