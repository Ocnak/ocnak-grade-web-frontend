"use client";

import { useFilterStore } from "@/store/filterStore";
import { useEffect } from "react";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectLabel,
} from "@/components/ui/select";

export default function SelectHonorListing() {
  const { academicListing, setFilter } = useFilterStore();

  useEffect(() => {
    // Only set to Principal List if it's currently empty
    if (!academicListing) {
      setFilter("academicListing", "principals_list");
    }
  }, []);

  return (
    <div className="w-full space-y-2">
      <Select
        value={academicListing}
        onValueChange={(value) => setFilter("academicListing", value)}
      >
        <SelectTrigger className="h-12! w-full border border-gray-300 cursor-pointer rounded bg-white text-slate-800! [&_svg]:text-slate-800!">
          <div className="text-slate-800">
            <SelectValue placeholder="Select listing" />
          </div>
        </SelectTrigger>
        <SelectContent
          position="popper"
          side="bottom"
          sideOffset={4}
          className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0 data-[state=open]:zoom-in-90 data-[state=closed]:zoom-out-95 origin-center duration-200"
        >
          <SelectGroup>
            <SelectLabel>Listings</SelectLabel>
            <SelectItem value="principals_list">Principal List</SelectItem>
            <SelectItem value="honor_roll">Honor Roll</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}
