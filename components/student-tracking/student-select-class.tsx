"use client";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useFetchClasses } from "@/hooks/use-classes";
import { useFilterStore } from "@/store/filterStore";
import { getGradeNum, useTeacherScope } from "./use-teacher-scope";

type ClassOption = { id: string; name: string };

// admins and scanners can filter by any class, teachers only by their own
export default function StudentSelectClass({
  role,
}: {
  role: "admin" | "teacher" | "scanner";
}) {
  return role === "teacher" ? <TeacherClassSelect /> : <AdminClassSelect />;
}

function AdminClassSelect() {
  const { data } = useFetchClasses();
  const classes: ClassOption[] = data?.classes ?? [];
  const sorted = [...classes].sort(
    (a, b) => getGradeNum(a.name) - getGradeNum(b.name),
  );
  return <ClassSelect classes={sorted} />;
}

function TeacherClassSelect() {
  const { classes } = useTeacherScope();
  return <ClassSelect classes={classes} />;
}

function ClassSelect({ classes }: { classes: ClassOption[] }) {
  // the store calls this "className", but it holds the class id
  const { className: classId, setFilter } = useFilterStore();

  return (
    <div>
      <Select
        value={classId}
        onValueChange={(value) =>
          setFilter("className", value === "all" ? "" : value)
        }
      >
        <SelectTrigger
          className="h-12 w-full cursor-pointer rounded-sm border-2 border-slate-700"
          style={{ height: "48px", width: "100%" }}
        >
          <SelectValue placeholder="Filter By Class" />
        </SelectTrigger>
        <SelectContent
          position="popper"
          side="bottom"
          avoidCollisions={false}
          className="data-[state=open]:slide-in-from-bottom-8 data-[state=open]:zoom-in-100 p-0 duration-200"
        >
          <ScrollArea className="h-auto w-full">
            <SelectGroup>
              <SelectLabel>Classes</SelectLabel>
              <SelectItem value="all">All</SelectItem>
              {classes.map((cls) => (
                <SelectItem key={cls.id} value={cls.id}>
                  {cls.name}
                </SelectItem>
              ))}
            </SelectGroup>
          </ScrollArea>
        </SelectContent>
      </Select>
    </div>
  );
}
