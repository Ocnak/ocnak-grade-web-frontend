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

import { Outfit } from "next/font/google";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

export default function StudentaHistorySelectLocation() {
  const { location, setFilter } = useFilterStore();
  return (
    <Select
      value={location}
      onValueChange={(value) =>
        setFilter("location", value === "all" ? "" : value)
      }
    >
      <SelectTrigger
        className={`w-full rounded border-2 border-slate-700 ${outfit.className}`}
        style={{ height: "48px", width: "100%" }}
      >
        <SelectValue placeholder="Filter By Location" />
      </SelectTrigger>
      <SelectContent
        className={`${outfit.className} data-[state=open]:slide-in-from-bottom-8 data-[state=open]:zoom-in-100 duration-300`}
      >
        <SelectGroup>
          <SelectLabel>Locations</SelectLabel>
          <SelectItem value="all">All</SelectItem>
          <SelectItem value="Old Road">Old Road</SelectItem>
          <SelectItem value="Town Hall">Town Hall</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
