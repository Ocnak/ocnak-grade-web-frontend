"use client";

import { TriangleAlertIcon } from "lucide-react";
import { MdDelete } from "react-icons/md";
import { useDeleteTeacher } from "@/hooks/use-teacher";
import { AlertDialog as AlertDialogPrimitive } from "radix-ui";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Fredoka, Outfit } from "next/font/google";
import { Spinner } from "@/components/ui/spinner";

interface DeleteTeacherModalProps {
  teacherId: string;
}

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

const fredoka = Fredoka({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export default function DeleteTeacherModal({
  teacherId,
}: DeleteTeacherModalProps) {
  const { mutate: deleteTeacher, error, isPending } = useDeleteTeacher();

  const handleDelete = () => {
    deleteTeacher(teacherId, {
      onSuccess: () => {
        toast.success("Teacher account successfully deleted!", {
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
      },
      onError: (error) => {
        toast.error(error.message || "An error occurred during deletion", {
          position: "top-right",
        });
      },
    });
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <div className="flex w-full cursor-pointer items-center gap-2">
          <MdDelete className="size-6 text-red-600" />

          <span className="flex-1 text-[15px] tracking-tight">Delete</span>
        </div>
      </AlertDialogTrigger>
      <AlertDialogContent
        className={`${outfit.className} data-[state=open]:zoom-in-0! data-[state=open]:duration-300 sm:max-w-104.75!`}
      >
        <AlertDialogHeader className="items-center">
          <div className="bg-destructive/10 mx-auto mb-2 flex size-12 items-center justify-center rounded-full">
            <TriangleAlertIcon className="text-destructive size-6" />
          </div>
          <AlertDialogTitle className={`${fredoka.className} text-center`}>
            Are you absolutely sure you want to delete this data?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center">
            This action cannot be undone. This will permanently delete this
            account.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogPrimitive.Cancel className="h-10 px-5 cursor-pointer rounded-sm border border-gray-300 bg-white  hover:bg-accent hover:text-accent-foreground">
            <span className="text-[13px] font-medium">Cancel</span>
          </AlertDialogPrimitive.Cancel>
          <Button
            disabled={isPending}
            onClick={handleDelete}
            className="bg-destructive dark:bg-destructive/60 focus-visible:ring-destructive h-10 px-5 cursor-pointer rounded-sm text-white duration-300 hover:bg-red-500"
          >
            {isPending ? (
              <Spinner className="size-6" />
            ) : (
              <span className="text-[13px] font-medium">Delete</span>
            )}
          </Button>
        </AlertDialogFooter>
        {error && (
          <div className="rounded border-l-4 border-red-400 bg-red-50 p-4">
            <div className="flex">
              <div className="ml-3">
                <p className="text-[14px] font-medium tracking-wide text-red-700">
                  {error.message}
                </p>
              </div>
            </div>
          </div>
        )}
      </AlertDialogContent>
    </AlertDialog>
  );
}
