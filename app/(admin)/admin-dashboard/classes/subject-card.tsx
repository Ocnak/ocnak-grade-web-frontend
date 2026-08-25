import { MdCancel } from "react-icons/md";
import { useRemoveSubjectFromClass } from "@/hooks/use-classes";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Spinner } from "@/components/ui/spinner";

interface SubjectCardProps {
  subjectId: string;
  subjectName: string;
  classId: string;
}

interface DeleteValues {
  subjectId: string;
  classId: string;
}

export default function SubjectCard(props: SubjectCardProps) {
  const { mutate, isPending } = useRemoveSubjectFromClass();

  const onHandleDelete = (values: DeleteValues) => {
    mutate(values, {
      onSuccess: () => {
        toast.success("Subject removed successfully!", {
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
    <div
      key={props.subjectId}
      className="cursor-pointer rounded border border-gray-200 p-2 shadow-sm"
    >
      <Tooltip>
        <TooltipTrigger>
          {isPending ? (
            <Spinner className="text-muted-foreground size-5" />
          ) : (
            <MdCancel
              onClick={() =>
                onHandleDelete({
                  subjectId: props.subjectId,
                  classId: props.classId,
                })
              }
              className="size-5 cursor-pointer transition-all duration-300 hover:text-red-700"
            />
          )}
        </TooltipTrigger>
        <TooltipContent>
          <p>Remove this subject</p>
        </TooltipContent>
      </Tooltip>
      <p className="text-[11px] font-semibold capitalize">
        {props.subjectName}
      </p>
    </div>
  );
}
