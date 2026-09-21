"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Fredoka } from "next/font/google";
import UpdateStudentForm from "./update-student-form";

const fredoka = Fredoka({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

interface UpdateStudentModalTypes {
  studentId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function UpdateStudentModal(props: UpdateStudentModalTypes) {
  return (
    <div>
      <Dialog open={props.open} onOpenChange={props.onOpenChange}>
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
            onClose={() => props.onOpenChange(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
