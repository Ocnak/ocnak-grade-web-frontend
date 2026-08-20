"use client";

import { UploadIcon } from "lucide-react";
import { Loader } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { LuArchiveRestore } from "react-icons/lu";
import { useArchiveStudents } from "@/hooks/use-archived-students";
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

export default function ArchiveStudentModal() {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();
  const { selectedIds, clearSelection } = useStudentSelectionStore();
  const {
    mutate: archiveStudent,
    error: archiveStudentError,
    isPending,
  } = useArchiveStudents();

  const closeModal = () => setIsOpen(false);

  const handleArchive = () => {
    archiveStudent(selectedIds, {
      onSuccess: () => {
        clearSelection();
        queryClient.invalidateQueries({ queryKey: ["students"] });
        toast.success(`Students account successfull archived!`, {
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
        setTimeout(() => {
          window.location.reload();
        }, 500);
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
          className="h-12 cursor-pointer rounded"
          variant="outline"
        >
          <LuArchiveRestore
            style={{
              width: "18px",
              height: "18px",
            }}
          />
          Archive Data
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="data-[state=open]:zoom-in-0! data-[state=open]:duration-200 sm:max-w-106.75!">
        <AlertDialogHeader>
          <div className="w-full  flex items-center justify-center">
            <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-sky-600/10 sm:mx-0 dark:bg-sky-400/10">
              <UploadIcon className="size-6 text-sky-600 dark:text-sky-400" />
            </div>
          </div>
          <AlertDialogTitle className="text-center text-[16px]">
            Are you absolutely sure you want to archived this data?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center">
            This action cannot be undone. This will archived the selected
            students account.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="cursor-pointer rounded-sm h-10 px-5">
            Cancel
          </AlertDialogCancel>
          <Button
            disabled={isPending}
            onClick={handleArchive}
            className="cursor-pointer rounded-sm h-10 px-5 bg-sky-600 text-white duration-300 hover:bg-sky-600 focus-visible:ring-sky-600 dark:bg-sky-300 dark:hover:bg-sky-300 dark:focus-visible:ring-sky-300"
          >
            {isPending ? (
              <Loader size={22} className="animate-spin" />
            ) : (
              <span className="text-[13px]">Archive Data</span>
            )}
          </Button>
        </AlertDialogFooter>
        {archiveStudentError && (
          <div className="rounded border-l-4 border-red-400 bg-red-50 p-4 transition-all duration-75">
            <div className="flex">
              <div className="ml-3">
                <p className="text-[14px] font-medium tracking-wide text-red-700">
                  {archiveStudentError.message}
                </p>
              </div>
            </div>
          </div>
        )}
      </AlertDialogContent>
    </AlertDialog>
  );
}
