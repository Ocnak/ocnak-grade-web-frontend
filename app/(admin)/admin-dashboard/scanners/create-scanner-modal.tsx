"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
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
import { createScannerSchema } from "./scanner-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useCreateScanner } from "@/hooks/use-scanner";
import { useState } from "react";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RippleButton } from "@/components/ui/ripple-button";
import { Fredoka } from "next/font/google";
import TeacherFormLocationSelect from "../teachers/teacher-form-location-select";
import { Spinner } from "@/components/ui/spinner";

const fredoka = Fredoka({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

type formSchema = z.infer<typeof createScannerSchema>;

const emptyValues: formSchema = {
  first_name: "",
  last_name: "",
  email: "",
  location: "",
};

export default function CreateScannerModal() {
  const { mutate, error, isPending } = useCreateScanner();
  const [open, setOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<formSchema>({
    resolver: zodResolver(createScannerSchema),
    defaultValues: emptyValues,
  });

  const onSubmit = async (values: formSchema) => {
    mutate(
      {
        firstName: values.first_name,
        lastName: values.last_name,
        email: values.email,
        location: values.location,
      },
      {
        onSuccess: () => {
          reset(emptyValues);
          toast.success("Scanner account successfully created!", {
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
        <RippleButton className="h-12 cursor-pointer rounded-sm text-white">
          <FaPlus
            style={{
              width: "13px",
              height: "13px",
            }}
          />{" "}
          Add Scanner
        </RippleButton>
      </DialogTrigger>

      <DialogContent className="data-[state=open]:zoom-in-0! h-auto rounded-lg border-none bg-white px-3 data-[state=open]:duration-200 md:max-w-143.75 md:rounded-[15px] md:p-6">
        <DialogHeader>
          <DialogTitle>
            <span className={`${fredoka.className} text-[25px] font-semibold`}>
              Add a New Scanner
            </span>
          </DialogTitle>
          <DialogDescription>
            Provide the required information below to add a new scanner.
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
          <ScrollArea className="mt-0 h-auto w-full rounded-[6px] border border-gray-300 p-3 shadow">
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

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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

                <Field data-invalid={!!errors.location}>
                  <FieldLabel className="text-[13px] font-bold text-[#777]">
                    Location
                  </FieldLabel>
                  <TeacherFormLocationSelect
                    value={watch("location")}
                    onChange={(val) =>
                      setValue("location", val, { shouldValidate: true })
                    }
                  />
                  {errors.location && (
                    <FieldError>{errors.location.message}</FieldError>
                  )}
                </Field>
              </div>
            </div>
          </ScrollArea>

          {error && (
            <div className="mt-4 rounded border-l-4 border-red-400 bg-red-50 p-4">
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
                <Spinner className="size-7" />
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
