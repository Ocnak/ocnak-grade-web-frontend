"use client";

import { useEffect, useId, useState } from "react";
import { LoaderCircleIcon, SearchIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useFilterStore } from "@/store/filterStore";

export default function InputSearch() {
  const [isLoading, setIsLoading] = useState(false);
  const { name: teacher, setFilter } = useFilterStore();

  const id = useId();

  useEffect(() => {
    if (!teacher) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);

    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [teacher]);

  return (
    <div className="w-full">
      <div className="relative">
        <div className="text-muted-foreground pointer-events-none absolute inset-y-0 left-0 flex items-center justify-center pl-3 peer-disabled:opacity-50">
          <SearchIcon className="size-4" />
          <span className="sr-only">Search</span>
        </div>
        <Input
          id={id}
          type="search"
          placeholder="Find teacher..."
          value={teacher}
          onChange={(e) => setFilter("name", e.target.value)}
          className="peer h-12 rounded bg-white px-9 md:rounded-full [&::-webkit-search-cancel-button]:appearance-none [&::-webkit-search-decoration]:appearance-none [&::-webkit-search-results-button]:appearance-none [&::-webkit-search-results-decoration]:appearance-none"
        />
        {isLoading && (
          <div className="text-muted-foreground pointer-events-none absolute inset-y-0 right-0 flex items-center justify-center pr-3 peer-disabled:opacity-50">
            <LoaderCircleIcon className="size-4 animate-spin" />
            <span className="sr-only">Loading...</span>
          </div>
        )}
      </div>
    </div>
  );
}
