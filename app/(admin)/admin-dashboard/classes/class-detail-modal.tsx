import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useModalStore } from "@/store/modalStore";
import { Crimson_Text } from "next/font/google";
import { useClassStore } from "@/store/classStore";
import { RippleButton } from "@/components/ui/ripple-button";
import SubjectCard from "./subject-card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useFetchSubjectsByClass } from "@/hooks/use-subjects";
import DeleteClassModal from "./delete-class-modal";
import Image from "next/image";

const crimson_text = Crimson_Text({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
});

export default function ClassDetailModal() {
  const { isOpen, setOpen } = useModalStore();
  const { selectedClass } = useClassStore();

  const {
    data: subjects,
    isPending: subjectsLoader,
    error: subjectsError,
  } = useFetchSubjectsByClass(selectedClass?.classId as string);

  if (subjectsLoader) {
    return <div></div>;
  }

  if (subjectsError)
    return <div>Error fetching students: {subjectsError.message}</div>;

  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      <form>
        <DialogContent className="data-[state=open]:zoom-in-0! max-w-full px-3 data-[state=open]:duration-200 md:h-auto md:max-w-126.75 md:p-6">
          <DialogHeader>
            <DialogTitle>
              <span
                className={`${crimson_text.className} text-[25px] font-semibold`}
              >
                Class Details of {selectedClass?.className || ""}
              </span>
            </DialogTitle>
            <DialogDescription>
              Provide the required information below to update the class.
            </DialogDescription>
          </DialogHeader>

          <h4 className="text-[16px] font-semibold">Subjects</h4>
          <ScrollArea className="h-35 rounded-md border p-3">
            {subjects.length > 0 ? (
              <div className="grid grid-cols-2 gap-5 border-none md:grid-cols-3 md:gap-3">
                {subjects.map((subject) => (
                  <SubjectCard
                    key={subject.id}
                    subjectId={subject.id}
                    subjectName={subject.name}
                    classId={selectedClass?.classId as string}
                  />
                ))}
              </div>
            ) : (
              <div
                className={`mt-3 flex w-full flex-col items-center justify-center gap-2 font-semibold text-slate-800 ${crimson_text.className}`}
              >
                <Image
                  src="/images/undraw_no-data_ig65.svg"
                  alt="teacher image"
                  width={300}
                  height={300}
                  className="size-16"
                  priority
                  quality={75}
                  sizes="(max-width: 768px) 100vw, 50vw"
                />

                <p className="text-center text-[14px] font-medium text-[#777]">
                  You&apos;ve not added any subject yet
                </p>
              </div>
            )}
          </ScrollArea>

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

            <DeleteClassModal
              onDeleted={() => setOpen(false)}
              classId={selectedClass?.classId as string}
            />
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  );
}
