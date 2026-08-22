"use client";

import { useEffect } from "react";

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
import { useFetchPeriods } from "@/hooks/use-periods";
import { useFilterStore } from "@/store/filterStore";

export default function StudentPeriodSelect() {
  const { data: periodData, isLoading: periodLoader } = useFetchPeriods();

  const { periodId, setFilter } = useFilterStore();

  useEffect(() => {
    if (!periodId && periodData) {
      const firstPeriod = periodData.find((p: any) => p.period === 1);
      if (firstPeriod) {
        setFilter("periodId", firstPeriod.id);
      }
    }
  }, [periodData, periodId, setFilter]);

  return (
    <div className="w-full space-y-2">
      <Select
        value={periodId}
        onValueChange={(value) => setFilter("periodId", value)}
      >
        <SelectTrigger className="h-12! w-full cursor-pointer rounded-md bg-slate-800 text-white! [&_svg]:text-white!">
          {periodLoader ? (
            <Spinner />
          ) : (
            <SelectValue placeholder="Select Period" />
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
              Periods
            </SelectLabel>

            {periodData?.map((period: any) => (
              <SelectItem key={period.id} value={period.id}>
                Period: {period.period}
              </SelectItem>
            ))}

            {periodData?.length === 0 && !periodLoader && (
              <div className="text-muted-foreground px-2 py-1.5 text-sm">
                No period found
              </div>
            )}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}
