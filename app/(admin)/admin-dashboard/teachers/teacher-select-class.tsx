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

type ClassOption = { id: string; name: string };

const getGradeNum = (name: string) => {
  const match = name.match(/\d+/);
  return match ? parseInt(match[0]) : 0;
};

export default function StudentSelectClass() {
  const { data } = useFetchClasses();
  // the store calls this "className", but it holds the class id
  const { className: classId, setFilter } = useFilterStore();

  const classes: ClassOption[] = data?.classes ?? [];
  const sortedClasses = [...classes].sort(
    (a, b) => getGradeNum(a.name) - getGradeNum(b.name),
  );

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
              {sortedClasses.map((cls) => (
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
