"use client";

import { useId, useState } from "react";
import { CheckIcon, ChevronsUpDownIcon, XIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useFetchClasses } from "@/hooks/use-classes";

interface Props {
  value: string[];
  onChange: (value: string[]) => void;
}

export default function MutipleClassSelectOption(props: Props) {
  const { data } = useFetchClasses();
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

  const id = useId();
  const [open, setOpen] = useState(false);

  const toggleClass = (classId: string) => {
    if (props.value.includes(classId)) {
      props.onChange(props.value.filter((v) => v !== classId));
    } else {
      props.onChange([...props.value, classId]);
    }
  };

  const removeClass = (classId: string) => {
    props.onChange(props.value.filter((v) => v !== classId));
  };

  return (
    <div className="w-full space-y-2">
      {/* Trigger button */}
      <Button
        type="button"
        id={id}
        variant="outline"
        role="combobox"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className="h-12 w-full cursor-pointer justify-between rounded-md text-[13px] hover:bg-transparent"
      >
        <div className="flex flex-wrap items-center gap-1 pr-2.5">
          {props.value.length > 0 ? (
            <>
              {props.value.slice(0, 3).map((val) => {
                const classItem = classes?.find((c: any) => c.id === val);
                if (!classItem) return null;
                return (
                  <Badge key={val} variant="outline" className="h-6 rounded">
                    {classItem.name}
                    <span
                      className="ml-1 cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeClass(val);
                      }}
                    >
                      <XIcon className="size-3" />
                    </span>
                  </Badge>
                );
              })}
              {props.value.length > 3 && (
                <Badge variant="secondary" className="h-6 rounded">
                  +{props.value.length - 3} more
                </Badge>
              )}
            </>
          ) : (
            <span className="text-muted-foreground">Select Classes...</span>
          )}
        </div>
        <ChevronsUpDownIcon
          className="text-muted-foreground/80 shrink-0"
          aria-hidden="true"
        />
      </Button>

      {/* Modal */}
      <CommandDialog open={open} onOpenChange={setOpen}>
        <Command>
          <CommandInput placeholder="Search Classes..." />
          <CommandList className="max-h-50 overflow-y-auto">
            {" "}
            <CommandEmpty>No classes found.</CommandEmpty>
            <CommandGroup>
              {sortedClasses?.map((classItem: any) => {
                const isSelected = props.value.includes(classItem.id);
                return (
                  <CommandItem
                    key={classItem.id}
                    value={classItem.name}
                    onSelect={() => toggleClass(classItem.id)}
                    className="h-10 cursor-pointer rounded"
                  >
                    <span className="truncate">{classItem.name}</span>
                    {isSelected && <CheckIcon size={16} className="ml-auto" />}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </CommandDialog>
    </div>
  );
}
