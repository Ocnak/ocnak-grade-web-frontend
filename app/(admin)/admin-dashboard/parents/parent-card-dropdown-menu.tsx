"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { BsThreeDots } from "react-icons/bs";
import { Crimson_Text, Outfit } from "next/font/google";
import UpdateParentModal from "./update-parent-modal";
import DeleteParentModal from "./delete-parent-modal";
import { useState } from "react";
import { FaEdit } from "react-icons/fa";
import { MdDelete } from "react-icons/md";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

const crimson_text = Crimson_Text({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
});

interface ParentCardDropdownMenuProps {
  parentId: string;
  userId: string;
}
export default function ParentCardDropdownMenu(
  props: ParentCardDropdownMenuProps,
) {
  const [editOpen, setEditOpen] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div className="absolute cursor-pointer right-5">
            <BsThreeDots className="size-8 cursor-pointer text-gray-400" />
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className={`${outfit.className} data-[state=closed]:slide-out-to-left-0 data-[state=open]:slide-in-from-left-0 data-[state=closed]:slide-out-to-bottom-20 data-[state=open]:slide-in-from-bottom-20 data-[state=closed]:zoom-out-100 mr-[40px] w-40 duration-200 md:mr-[90px]`}
        >
          <DropdownMenuLabel className="font-semibold">
            <h2
              className={`text-[17px] font-bold tracking-tight ${crimson_text.className}`}
            >
              Card Detail
            </h2>
          </DropdownMenuLabel>
          <DropdownMenuGroup className="text-slate-800">
            <DropdownMenuItem
              className="gap-2 cursor-pointer"
              onSelect={() => setEditOpen(true)}
            >
              <FaEdit className="size-6 text-slate-600" />
              <span className="text-[15px] tracking-tight">Edit</span>
            </DropdownMenuItem>

            <DropdownMenuItem
              className="justify-between cursor-pointer"
              onSelect={(event) => event.preventDefault()}
            >
              <DeleteParentModal parentId={props.parentId} />
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      <UpdateParentModal
        userId={props.userId}
        parentId={props.parentId}
        open={editOpen}
        onOpenChange={setEditOpen}
      />
    </>
  );
}
