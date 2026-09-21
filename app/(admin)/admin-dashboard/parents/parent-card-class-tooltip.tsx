import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { FaChalkboardTeacher } from "react-icons/fa";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface ParentStudent {
  id: string;
  firstName: string;
  lastName: string;
  location: string | null;
  classId: string | null;
  className: string | null;
}

interface ParentTypes {
  students: ParentStudent[];
}

export default function ParentCardStudentTooltip(props: ParentTypes) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="cursor-pointer rounded border border-gray-400 text-[13px]"
        >
          Students
        </Button>
      </PopoverTrigger>
      <PopoverContent className="data-[state=open]:zoom-in-0! data-[state=closed]:zoom-out-0! w-[260px] origin-center rounded-[10px] border border-gray-300 duration-200">
        <div className="grid gap-3">
          <div className="flex flex-col items-center gap-1">
            <FaChalkboardTeacher className="size-8" />
            <div className="flex flex-col items-center text-center">
              <span className="text-sm font-semibold">Enrolled Children</span>
            </div>
          </div>

          <Separator />
          <div className="from-border/20 via-border to-border/20 mx-auto bg-linear-to-r" />
          <div className="grid grid-cols-2 items-start gap-1.5">
            {props.students.map((student) => (
              <Badge
                key={student.id}
                className="h-8 w-full justify-center rounded text-center"
              >
                {student.firstName} {student.lastName}
              </Badge>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
