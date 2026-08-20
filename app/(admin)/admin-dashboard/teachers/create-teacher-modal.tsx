"use client";

import { Button } from "@/components/ui/button";
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
import { createTeacherSchema } from "./teacher-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader } from "lucide-react";
import * as z from "zod";
import { useCreateTeacher } from "@/hooks/use-teacher";
import { useState } from "react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RippleButton } from "@/components/ui/ripple-button";
import MutipleClassSelectOption from "../classes/mutiple-class-select-option";

import { Crimson_Text } from "next/font/google";

const crimson_text = Crimson_Text({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
});

type formSchema = z.infer<typeof createTeacherSchema>;

export default function CreateTeacherModal() {
  const { mutate, error, isPending } = useCreateTeacher();
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<formSchema>({
    resolver: zodResolver(createTeacherSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      class_ids: [],
      user_role: "teacher",
    },
  });

  const classIds = watch("class_ids");

  const onSubmit = async (values: formSchema) => {
    mutate(
      {
        firstName: values.first_name,
        lastName: values.last_name,
        email: values.email,
        classIds: values.class_ids,
      },
      {
        onSuccess: () => {
          reset();
          queryClient.invalidateQueries({ queryKey: ["teachers"] });
          toast.success("Teacher account successfully created!", {
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
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <RippleButton className="h-12 cursor-pointer rounded text-white">
          <FaPlus
            style={{
              width: "13px",
              height: "13px",
            }}
          />{" "}
          Add Teacher
        </RippleButton>
      </DialogTrigger>

      <DialogContent className="data-[state=open]:zoom-in-0! h-auto rounded-lg border-none bg-white px-3 data-[state=open]:duration-300 md:max-w-143.75 md:rounded-[15px] md:p-6">
        <DialogHeader>
          <DialogTitle>
            <span
              className={`${crimson_text.className} text-[25px] font-semibold`}
            >
              Add a New Teacher
            </span>
          </DialogTitle>
          <DialogDescription>
            Provide the required information below to add a new teacher.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          onKeyDown={(e) => {
            if (
              e.key === "Enter" &&
              !(e.target instanceof HTMLTextAreaElement)
            ) {
              handleSubmit(onSubmit)();
            }
          }}
        >
          <ScrollArea className="mt-0 h-87.5 w-full space-y-75 rounded-[6px] border border-gray-300 p-3 shadow md:h-auto">
            <div className="space-y-3">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Field data-invalid={!!errors.first_name}>
                  <FieldLabel className="text-[13px] font-bold text-[#777]">
                    First Name
                  </FieldLabel>
                  <Input
                    placeholder="Jessica"
                    className="h-10 rounded-md bg-white text-[13px]"
                    {...register("first_name")}
                  />
                  {errors.first_name && (
                    <FieldError>{errors.first_name.message}</FieldError>
                  )}
                </Field>

                <Field data-invalid={!!errors.last_name}>
                  <FieldLabel className="text-[13px] font-bold text-[#777]">
                    Last Name
                  </FieldLabel>
                  <Input
                    placeholder="Morris"
                    className="h-10 rounded-md bg-white text-[13px]"
                    {...register("last_name")}
                  />
                  {errors.last_name && (
                    <FieldError>{errors.last_name.message}</FieldError>
                  )}
                </Field>
              </div>

              <Field data-invalid={!!errors.email}>
                <FieldLabel className="text-[13px] font-bold text-[#777]">
                  Email
                </FieldLabel>
                <Input
                  placeholder="example@gmail.com"
                  className="h-10 rounded-md bg-white text-[13px]"
                  type="email"
                  {...register("email")}
                />
                {errors.email && (
                  <FieldError>{errors.email.message}</FieldError>
                )}
              </Field>

              <Field data-invalid={!!errors.class_ids}>
                <FieldLabel className="text-[13px] font-bold text-[#777]">
                  Choose Classes
                </FieldLabel>
                <MutipleClassSelectOption
                  value={classIds}
                  onChange={(val) =>
                    setValue("class_ids", val, { shouldValidate: true })
                  }
                />
                {errors.class_ids && (
                  <FieldError>{errors.class_ids.message}</FieldError>
                )}
              </Field>
            </div>
          </ScrollArea>

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
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="h-11 cursor-pointer rounded-lg px-6"
            >
              Cancel
            </Button>

            <Button
              disabled={isPending}
              type="submit"
              className="h-11 cursor-pointer rounded-lg px-6"
            >
              {isPending ? (
                <Loader size={22} className="animate-spin" />
              ) : (
                <span className="text-[13px]">Save changes</span>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
