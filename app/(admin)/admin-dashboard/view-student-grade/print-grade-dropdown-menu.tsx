"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PrinterCheck } from "lucide-react";
import * as motion from "motion/react-client";

interface PrintGradeDropDownMenuProps {
  onPrintCurrentStudent: () => void;
  onPrintAllClassmates: () => void;
  isPrintingAll?: boolean;
}

export default function PrintGradeDropDownMenu({
  onPrintCurrentStudent,
  onPrintAllClassmates,
  isPrintingAll,
}: PrintGradeDropDownMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="w-full" disabled={isPrintingAll}>
        <motion.button
          className="cursor-pointer w-full tracking-wide flex items-center justify-center gap-2"
          whileTap={{ scale: 0.85 }}
        >
          <Button
            disabled={isPrintingAll}
            className="h-12.5 w-full text-[16px] font-medium cursor-pointer rounded-md bg-slate-800 transition-none"
          >
            <PrinterCheck
              strokeWidth={2.25}
              className="transition-transform duration-200 group-hover:translate-x-0.5 size-5"
            />
            {isPrintingAll ? "Preparing..." : "Print Record"}
          </Button>
        </motion.button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="center"
        className="data-open:slide-in-from-left-0 data-open:data-[side=bottom]:slide-in-from-bottom-20 data-open:data-[side=top]:slide-in-from-bottom-20 data-closed:slide-out-to-bottom-20 data-closed:slide-out-to-left-0 data-closed:zoom-out-100 w-56 duration-400"
      >
        <DropdownMenuGroup>
          <DropdownMenuLabel>Print Record Menu</DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuGroup>
          <DropdownMenuItem
            className="text- font-medium cursor-pointer h-10"
            onSelect={onPrintAllClassmates}
          >
            Print Whole Class
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text- font-medium cursor-pointer h-10"
            onSelect={onPrintCurrentStudent}
          >
            Print This Student
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
