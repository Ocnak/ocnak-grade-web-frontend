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

export default function TeacherSelectLocation() {
  const { location, setFilter } = useFilterStore();
  return (
    <div>
      <Select
        value={location}
        onValueChange={(value) =>
          setFilter("location", value === "all" ? "" : value)
        }
      >
        <SelectTrigger
          className="w-full rounded-sm border-2 border-slate-700 cursor-pointer"
          style={{ height: "48px", width: "100%" }}
        >
          <SelectValue placeholder="Filter By Location" />
        </SelectTrigger>
        <SelectContent
          position="popper"
          side="bottom"
          avoidCollisions={false}
          className="data-[state=open]:slide-in-from-bottom-8 data-[state=open]:zoom-in-100 p-0 duration-300"
        >
          <SelectGroup>
            <SelectLabel>Locations</SelectLabel>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="Old Road">Old Road</SelectItem>
            <SelectItem value="Town Hall">Town Hall</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}
