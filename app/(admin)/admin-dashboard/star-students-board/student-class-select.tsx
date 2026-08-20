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
import { Spinner } from "@/components/ui/spinner";
import { useFetchClasses } from "@/hooks/use-classes";
import { useFilterStore } from "@/store/filterStore";

export default function StudentClassSelect() {
  const { className, setFilter } = useFilterStore();

  const { data, isLoading: classesLoader } = useFetchClasses();
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
    <div className="w-full space-y-2">
      <Select
        value={className}
        onValueChange={(value) => setFilter("className", value)}
      >
        <SelectTrigger className="h-12! w-full cursor-pointer rounded bg-slate-800 text-white! [&_svg]:text-white!">
          {classesLoader ? (
            <Spinner />
          ) : (
            <SelectValue placeholder="Select Class" />
          )}
        </SelectTrigger>
        <SelectContent
          position="popper"
          side="bottom"
          sideOffset={4}
          className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0 data-[state=open]:zoom-in-90 data-[state=closed]:zoom-out-95 origin-center duration-200"
        >
          <SelectGroup>
            <SelectLabel className="text-[12px] text-gray-400">
              Classes
            </SelectLabel>
            {sortedClasses.map((cls: { id: string; name: string }) => (
              <SelectItem key={cls.id} value={cls.id}>
                {cls.name}
              </SelectItem>
            ))}

            {sortedClasses.length === 0 && !classesLoader && (
              <div className="text-muted-foreground px-2 py-1.5 text-sm">
                No classes found
              </div>
            )}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}
