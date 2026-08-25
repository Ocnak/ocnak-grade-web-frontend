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
// import { FaPlus } from "react-icons/fa";
import { Fredoka } from "next/font/google";
import CreateStudentModalTabs from "./create-student-modal-tabs";
import { useModalStore } from "@/store/modalStore";
import { useClassStore } from "@/store/classStore";
import { CirclePlus } from "lucide-react";
import * as motion from "motion/react-client";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const fredoka = Fredoka({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export default function CreateStudentModal() {
  const { isOpen, setOpen } = useModalStore();
  const selectedClass = useClassStore((s) => s.selectedClass);
  const isDisabled = !selectedClass;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !isDisabled && setOpen(open)}>
      <Tooltip>
        <TooltipTrigger>
          <DialogTrigger asChild disabled={isDisabled}>
            <motion.div
              role="button"
              aria-disabled={isDisabled}
              whileTap={isDisabled ? undefined : { scale: 0.85, rotate: 45 }}
              whileHover={isDisabled ? undefined : { scale: 1.08 }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
              className={
                isDisabled
                  ? "cursor-not-allowed text-gray-300"
                  : "cursor-pointer hover:text-red-700"
              }
              onClick={(e) => {
                if (isDisabled) e.preventDefault();
              }}
            >
              <CirclePlus className="size-16" />
            </motion.div>
          </DialogTrigger>
        </TooltipTrigger>
        <TooltipContent>
          <p>{isDisabled ? "Select a class first" : "Add new student"}</p>
        </TooltipContent>
      </Tooltip>

      <DialogContent className="data-[state=open]:zoom-in-0! flex h-full max-w-full flex-col rounded-none px-3 py-4 data-[state=open]:duration-200 sm:max-w-138 sm:h-auto md:max-h-[85vh] md:max-w-165 lg:max-w-185 sm:rounded-md md:p-6">
        <DialogHeader className="m-0 space-y-0 p-0  mb-22! sm:mb-10! md:mb-0!">
          <DialogTitle className="text-center md:text-left">
            <span
              className={`text-center md:text-left ${fredoka.className} text-[25px] font-semibold`}
            >
              Add a New Student
            </span>
          </DialogTitle>
          <DialogDescription className="mt-0 text-center md:text-left">
            Provide the required information below to add a new student.
          </DialogDescription>
        </DialogHeader>

        <div className="-mt-20 sm:mt-0">
          <CreateStudentModalTabs />
        </div>
      </DialogContent>
    </Dialog>
  );
}
