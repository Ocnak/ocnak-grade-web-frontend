"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FaEdit } from "react-icons/fa";
import { Fredoka } from "next/font/google";
import UpdateStudentForm from "./update-student-form";
import { useState } from "react";

const fredoka = Fredoka({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

interface UpdateStudentModalTypes {
  studentId: string;
}

export default function UpdateStudentModal(props: UpdateStudentModalTypes) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <button className="flex w-46 h-full  cursor-pointer items-center gap-2 text-slate-600">
            <FaEdit className="size-6 text-slate-600" />
            <span className=" text-[15px] tracking-tight">
              Edit Student Info
            </span>
          </button>
        </DialogTrigger>

        <DialogContent className="data-[state=open]:zoom-in-0! flex h-full max-w-full flex-col rounded-none px-3 py-4 data-[state=open]:duration-200 sm:max-w-138 sm:h-auto md:max-h-[85vh] md:max-w-165 lg:max-w-185 sm:rounded-md md:p-6">
          <DialogHeader>
            <DialogTitle className="text-center md:text-left">
              <span
                className={`${fredoka.className} md:mt-auto text-[25px] font-semibold`}
              >
                Update Student Information
              </span>
            </DialogTitle>
            <DialogDescription className="text-center md:text-left">
              Edit student information below
            </DialogDescription>
          </DialogHeader>
          <UpdateStudentForm
            studentId={props.studentId}
            onClose={() => setIsOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
