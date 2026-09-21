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
import UpdateStudentModal from "./update-student-modal";
import { useStudentIdStore } from "@/store/studentIdStore";
import { useRouter } from "next/navigation";
import { useSession } from "@/hooks/use-session";
import { Crimson_Text } from "next/font/google";
import { useState } from "react";
import { FaEdit } from "react-icons/fa";

const crimson_text = Crimson_Text({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
});

interface StudentCardDropdownMenuProps {
  studentId: string;
}
export default function StudentCardDropdownMenu(
  props: StudentCardDropdownMenuProps,
) {
  const router = useRouter();
  const { setStudentId } = useStudentIdStore();
  const { data: session, isLoading: sessionLoader } = useSession();
  const userRole = session?.user.userRole;
  let viewLink = "";

  if (userRole === "admin") {
    viewLink = `/admin-dashboard/view-student-grade?studentId=${props.studentId}`;
  }

  if (userRole === "teacher") {
    viewLink = `/view-student-grade?studentId=${props.studentId}`;
  }

  const [editOpen, setEditOpen] = useState(false);

  return (
    <div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="link" className="cursor-pointer rounded">
            <BsThreeDots className="size-8 cursor-pointer text-gray-400" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="data-[state=closed]:slide-out-to-left-0 data-[state=open]:slide-in-from-left-0 data-[state=closed]:slide-out-to-bottom-20 data-[state=open]:slide-in-from-bottom-20 data-[state=closed]:zoom-out-100 mr-5.75 w-50 duration-300 md:mr-18.75">
          <DropdownMenuLabel
            className={`${crimson_text.className} text-[18px] tracking-tight font-bold`}
          >
            Student Detail
          </DropdownMenuLabel>
          <DropdownMenuGroup className="text-slate-800">
            <DropdownMenuItem
              className="gap-2 cursor-pointer"
              onSelect={() => setEditOpen(true)}
            >
              <FaEdit className="size-6 text-slate-600" />
              <span className="text-[15px] tracking-tight">
                Edit Student Info
              </span>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      <UpdateStudentModal
        studentId={props.studentId}
        open={editOpen}
        onOpenChange={setEditOpen}
      />
    </div>
  );
}
