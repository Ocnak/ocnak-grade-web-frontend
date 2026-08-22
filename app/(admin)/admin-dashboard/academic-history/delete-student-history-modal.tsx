"use client";

import { TriangleAlertIcon } from "lucide-react";
import { MdDelete } from "react-icons/md";
import { Loader } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useDeleteArchivedStudents } from "@/hooks/use-archived-students";
import { useStudentSelectionStore } from "@/store/studentSelectionStore";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useState } from "react";
import { Outfit } from "next/font/google";
import { Spinner } from "@/components/ui/spinner";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

export default function DeleteStudentHistoryModal() {
  const [isOpen, setIsOpen] = useState(false);

  const { selectedIds, clearSelection } = useStudentSelectionStore();
  const {
    mutate: deleteStudent,
    error: deleteStudentError,
    isPending,
  } = useDeleteArchivedStudents();

  const closeModal = () => setIsOpen(false);

  const handleDelete = () => {
    deleteStudent(selectedIds, {
      onSuccess: () => {
        clearSelection();
        toast.success(`Student account successfully deleted!`, {
          position: "top-right",
          style: {
            "--normal-bg":
              "color-mix(in oklab, light-dark(var(--color-green-600), var(--color-green-400)) 10%, var(--background))",
            "--normal-text":
              "light-dark(var(--color-green-600), var(--color-green-400))",
            "--normal-border":
              "light-dark(var(--color-green-600), var(--color-green-400))",
          } as React.CSSProperties,
        });
        closeModal();
      },
      onError: (error) => {
        toast.error(error.message, {
          position: "top-right",
        });
      },
    });
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button
          disabled={selectedIds.length === 0 || isPending}
          className="h-12 cursor-pointer rounded-md bg-red-600 text-white hover:bg-red-600"
          variant="destructive"
        >
          <MdDelete className="size-5" />
          Delete
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="data-[state=open]:zoom-in-0! data-[state=open]:duration-300 sm:max-w-138.75">
        <AlertDialogHeader className="items-center">
          <div className="bg-destructive/10 mx-auto mb-2 flex size-12 items-center justify-center rounded-full">
            <TriangleAlertIcon className="text-destructive size-6" />
          </div>
          <AlertDialogTitle className="text-center">
            Are you absolutely sure you want to delete this data?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center">
            This action cannot be undone. This will permanently delete this
            account.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="h-10 px-5 cursor-pointer rounded-sm">
            Cancel
          </AlertDialogCancel>
          <Button
            disabled={isPending}
            onClick={handleDelete}
            className="h-10 px-5 cursor-pointer rounded-sm bg-red-600 text-white hover:bg-red-600"
          >
            {isPending ? (
              <Spinner className="size-6" />
            ) : (
              <span className="text-[13px]">Delete</span>
            )}
          </Button>
        </AlertDialogFooter>
        {deleteStudentError && (
          <div className="rounded border-l-4 border-red-400 bg-red-50 p-4 transition-all duration-75">
            <div className="flex">
              <div className="ml-3">
                <p className="text-[14px] font-medium tracking-wide text-red-700">
                  {deleteStudentError.message}
                </p>
              </div>
            </div>
          </div>
        )}
      </AlertDialogContent>
    </AlertDialog>
  );
}
