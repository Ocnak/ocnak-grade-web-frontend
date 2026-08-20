import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { FaChalkboardTeacher } from "react-icons/fa";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface TeacherClass {
  id: string;
  name: string;
}

interface TeacherTypes {
  classNames: TeacherClass[];
}

export default function TeacherCardClassTooltip(props: TeacherTypes) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="cursor-pointer rounded border border-gray-400 text-[13px]"
        >
          Classes
        </Button>
      </PopoverTrigger>
      <PopoverContent className="data-[state=open]:zoom-in-0! data-[state=closed]:zoom-out-0! w-[260px] origin-center rounded-[10px] border border-gray-300 duration-200">
        <div className="grid gap-3">
          <div className="flex flex-col items-center gap-1">
            <FaChalkboardTeacher className="size-8" />
            <div className="flex flex-col items-center text-center">
              <span className="text-sm font-semibold">
                Teacher Assigned Class
              </span>
            </div>
          </div>

          <Separator />
          <div className="from-border/20 via-border to-border/20 mx-auto bg-linear-to-r" />
          <div className="grid grid-cols-3 items-start gap-1.5">
            {props.classNames.map((cls) => (
              <Badge
                key={cls.id}
                className="h-8 w-full justify-center rounded text-center"
              >
                {cls.name}
              </Badge>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
