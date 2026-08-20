import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
} from "@/components/ui/dialog";

import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import ViewStudentGrade from "./view-student/view-student-grades";
import { FaPrint } from "react-icons/fa6";
import { useReactToPrint } from "react-to-print";
import { useRef } from "react";

interface StudentProps {
  studentId: string;
}

export default function ViewStudentAcademicHistoryViewModal(
  props: StudentProps,
) {
  const contentRef = useRef<HTMLDivElement>(null);

  const onHandlePrint = useReactToPrint({
    contentRef,
    documentTitle: "Student Grades",
  });

  return (
    <Dialog>
      <form>
        <DialogTrigger asChild>
          <Button
            variant="default"
            className="h-11 cursor-pointer rounded-sm text-sm px-4"
          >
            View Grade
          </Button>
        </DialogTrigger>

        <DialogContent
          className="fixed! inset-0! top-0! left-0! h-screen! w-screen! max-w-none!
                     translate-x-0! translate-y-0! flex flex-col overflow-hidden
                     rounded-none! p-0 data-open:zoom-in-0! data-open:duration-200"
        >
          <DialogHeader className="contents space-y-0 text-left">
            <ScrollArea className="min-h-0 flex-1">
              <div
                ref={contentRef}
                className="min-w-160 sm:min-w-177.5 w-full p-6 print:min-w-177.5"
              >
                <ViewStudentGrade
                  contentRef={contentRef}
                  studentId={props.studentId}
                />
              </div>
              <ScrollBar orientation="vertical" />
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </DialogHeader>

          <DialogFooter className="shrink-0 border-t px-6 py-4">
            <DialogClose asChild>
              <Button
                variant="outline"
                className=" h-10.5 cursor-pointer rounded px-6"
              >
                Cancel
              </Button>
            </DialogClose>
            <Button
              onClick={onHandlePrint}
              type="submit"
              className="cursor-pointer rounded px-6 h-10.5"
            >
              <FaPrint className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" />
              Print Record
            </Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  );
}
