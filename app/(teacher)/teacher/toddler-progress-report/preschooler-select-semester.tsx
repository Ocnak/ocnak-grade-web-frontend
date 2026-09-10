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

export default function PreschoolerSelectSemester() {
  const { preschoolerSemester, setFilter } = useFilterStore();

  return (
    <div>
      <Select
        value={preschoolerSemester || "Semester 1"}
        onValueChange={(value) => setFilter("preschoolerSemester", value)}
      >
        <SelectTrigger className="h-12.5! text-[16px] font-medium w-full cursor-pointer rounded-md border-2 border-slate-700">
          <SelectValue />
        </SelectTrigger>
        <SelectContent
          position="popper"
          side="bottom"
          sideOffset={4}
          className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0 data-[state=open]:zoom-in-90 data-[state=closed]:zoom-out-95 origin-center duration-200"
        >
          <SelectGroup>
            <SelectLabel>Semester</SelectLabel>
            <SelectItem value="Semester 1">Semester 1</SelectItem>
            <SelectItem value="Semester 2">Semester 2</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}
