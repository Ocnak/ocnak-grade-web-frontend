import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface StudentFormLocationSelectProps {
  value: string;
  onChange: (value: string) => void;
}

export default function StudentFormLocationSelect({
  value,
  onChange,
}: StudentFormLocationSelectProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="h-10! w-full cursor-pointer rounded-md! bg-white! text-[13px]!">
        <SelectValue placeholder="Select location" />
      </SelectTrigger>
      <SelectContent
        position="popper"
        side="bottom"
        avoidCollisions={false}
        className="data-[state=open]:slide-in-from-bottom-8 data-[state=open]:zoom-in-100 p-0 duration-300"
      >
        <SelectGroup>
          <SelectLabel>Locations</SelectLabel>
          <SelectItem value="Old Road">Old Road</SelectItem>
          <SelectItem value="Town Hall">Town Hall</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
