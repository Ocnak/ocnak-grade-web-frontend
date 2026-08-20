"use client";

import { Button } from "@/components/ui/button";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FaPlus } from "react-icons/fa";
import { Crimson_Text } from "next/font/google";
import CreateStudentModalTabs from "./create-student-modal-tabs";
import { useModalStore } from "@/store/modalStore";
import { useClassStore } from "@/store/classStore";

const crimson_text = Crimson_Text({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
});

export default function CreateStudentModal() {
  const { isOpen, setOpen } = useModalStore();
  const selectedClass = useClassStore((s) => s.selectedClass);

  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          disabled={!selectedClass}
          className="h-12 cursor-pointer rounded w-full"
        >
          <FaPlus className="size-4" /> Add Students
        </Button>
      </DialogTrigger>
      <DialogContent className="data-[state=open]:zoom-in-0! h-full max-w-full rounded-none px-3 data-[state=open]:duration-200 md:h-auto md:max-w-[595px] md:rounded-sm md:p-6">
        <DialogHeader className="m-0 space-y-0 p-0">
          <DialogTitle className="text-center md:text-left">
            <span
              className={`text-center md:text-left ${crimson_text.className} text-[25px] font-semibold`}
            >
              Add a New Student
            </span>
          </DialogTitle>
          <DialogDescription className="mt-0 text-center md:text-left">
            Provide the required information below to add a new student.
          </DialogDescription>
        </DialogHeader>

        <div className="-mt-20 md:mt-0">
          <CreateStudentModalTabs />
        </div>
      </DialogContent>
    </Dialog>
  );
}
