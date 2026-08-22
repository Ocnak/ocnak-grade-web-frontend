"use client";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { FaPlus } from "react-icons/fa";
import { Fredoka } from "next/font/google";
import { createClassSchema } from "./create-class-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useCreateClass } from "@/hooks/use-classes";
import { useState } from "react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { RippleButton } from "@/components/ui/ripple-button";
import { Spinner } from "@/components/ui/spinner";

const fredoka = Fredoka({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

type formSchema = z.infer<typeof createClassSchema>;

export default function CreateClassModal() {
  const { mutate, error, isPending } = useCreateClass();
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<formSchema>({
    resolver: zodResolver(createClassSchema),
    defaultValues: {
      className: "",
    },
  });

  const onSubmit = async (values: formSchema) => {
    mutate(values.className, {
      onSuccess: () => {
        reset();
        // setOpen(false);
        queryClient.invalidateQueries({ queryKey: ["classes"] });
        toast.success("Class have been added successfully!", {
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
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <RippleButton className="h-12 cursor-pointer rounded-md">
          <FaPlus
            style={{
              width: "13px",
              height: "13px",
            }}
          />{" "}
          Add Class
        </RippleButton>
      </DialogTrigger>

      <DialogContent className="data-[state=open]:zoom-in-0! max-w-full px-3! data-[state=open]:duration-300 md:h-auto md:max-w-123.75 md:p-6">
        <DialogHeader>
          <DialogTitle>
            <span className={`${fredoka.className} text-[25px] font-semibold`}>
              Create A New Class
            </span>
          </DialogTitle>
          <DialogDescription>
            Provide the required information below to create a new class.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mt-0 w-full space-y-45 rounded-md md:h-auto">
            <div className="space-y-3 px-1.5 py-3">
              {/* className Field */}
              <Field data-invalid={!!errors.className}>
                <FieldLabel className="text-[13px] font-bold text-[#777]">
                  Class Name
                </FieldLabel>
                <Input
                  placeholder="1st Grade"
                  className="h-12 rounded-md bg-white"
                  {...register("className")}
                />
                {errors.className && (
                  <FieldError>{errors.className.message}</FieldError>
                )}
              </Field>
            </div>
          </div>

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

          <DialogFooter className="mt-4">
            <DialogClose asChild>
              <RippleButton
                type="button"
                variant="outline"
                className="h-11 cursor-pointer rounded-lg px-6"
              >
                Cancel
              </RippleButton>
            </DialogClose>
            <RippleButton
              disabled={isPending}
              type="submit"
              className="h-11 cursor-pointer rounded-lg px-6"
            >
              {isPending ? (
                <Spinner className="size-7" />
              ) : (
                <span className="text-[13px]">Add Class</span>
              )}
            </RippleButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
