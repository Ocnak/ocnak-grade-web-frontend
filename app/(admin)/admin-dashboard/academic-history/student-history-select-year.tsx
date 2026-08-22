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
import { useFilterStore } from "@/store/filterStore";
import { useEffect } from "react";
import { useFetchAcademicYears } from "@/hooks/use-archived-students";

// Current academic year as a single year, e.g. "2026"
function getCurrentAcademicYear() {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  return currentMonth < 8 ? String(currentYear) : String(currentYear + 1);
}

export default function StudentaHistorySelectYear() {
  const { studentYears, setFilter } = useFilterStore();

  const { data: academicYears, isLoading } = useFetchAcademicYears();

  useEffect(() => {
    if (academicYears && academicYears.length > 0 && !studentYears) {
      const currentYear = getCurrentAcademicYear();

      // Use current year if it exists in the list, otherwise fall back to the most recent one
      const defaultYear = academicYears.includes(currentYear)
        ? currentYear
        : academicYears[0];

      setFilter("studentYears", defaultYear);
    }
  }, [academicYears, studentYears, setFilter]);

  return (
    <Select
      value={studentYears}
      onValueChange={(value) => setFilter("studentYears", value)}
      disabled={isLoading}
    >
      <SelectTrigger
        className="w-full rounded-md border-2 border-slate-700 cursor-pointer"
        style={{ height: "48px", width: "100%" }}
      >
        <SelectValue placeholder="Filter By Academic Year" />
      </SelectTrigger>
      <SelectContent
        position="popper"
        side="bottom"
        avoidCollisions={false}
        className="data-[state=open]:slide-in-from-bottom-8 data-[state=open]:zoom-in-100 p-0 duration-300"
      >
        <SelectGroup>
          <SelectLabel>Academic Years</SelectLabel>
          {academicYears?.map((year) => (
            <SelectItem key={year} value={year}>
              {year}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
