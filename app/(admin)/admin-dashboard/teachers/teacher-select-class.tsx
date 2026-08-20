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
import { useFetchClasses } from "@/hooks/use-classes";
import { useFilterStore } from "@/store/filterStore";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function TeacherSelectClass() {
  const { data } = useFetchClasses();
  const { className, setFilter } = useFilterStore();

  const classes = data?.classes;

  const sortedClasses = classes
    ? [...classes].sort((a, b) => {
        const getGradeNum = (name: string) => {
          const match = name.match(/\d+/);
          return match ? parseInt(match[0]) : 0;
        };
        return getGradeNum(a.name) - getGradeNum(b.name);
      })
    : [];

  return (
    <div>
      <Select
        value={className}
        onValueChange={(value) =>
          setFilter("className", value === "all" ? "" : value)
        }
      >
        <SelectTrigger
          className="h-12 w-full cursor-pointer rounded border-2 border-slate-700"
          style={{ height: "48px", width: "100%" }}
        >
          <SelectValue placeholder="Filter By Class" />
        </SelectTrigger>
        <SelectContent
          position="popper"
          side="bottom"
          avoidCollisions={false}
          className="data-[state=open]:slide-in-from-bottom-8 data-[state=open]:zoom-in-100 p-0 duration-300"
        >
          <ScrollArea className="h-60 w-full">
            <SelectGroup>
              <SelectLabel>Classes</SelectLabel>
              <SelectItem value="all">All</SelectItem>
              {sortedClasses.map((cls: any) => (
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
