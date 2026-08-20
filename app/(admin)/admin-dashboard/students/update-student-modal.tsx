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
import { Crimson_Text } from "next/font/google";
import UpdateStudentForm from "./update-student-form";
import { useState } from "react";
import { useModalStore } from "@/store/modalStore";

const crimson_text = Crimson_Text({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
});

interface UpdateStudentModalTypes {
  studentId: string;
}

export default function UpdateStudentModal(props: UpdateStudentModalTypes) {
  // const { isOpen, setOpen } = useModalStore();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <div className="flex items-center gap-2">
            <FaEdit
              style={{
                width: "17px",
                height: "17px",
              }}
            />
            <p className="text-[13px]">Edit Student Info</p>
          </div>
        </DialogTrigger>
        <DialogContent className="data-[state=open]:zoom-in-0! h-full max-w-full rounded-none px-3 data-[state=open]:duration-200 md:h-auto md:max-w-[595px] md:rounded-sm md:p-6">
          <DialogHeader>
            <DialogTitle className="text-center md:text-left">
              <span
                className={`${crimson_text.className} md:mt-auto text-[25px] font-semibold`}
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
