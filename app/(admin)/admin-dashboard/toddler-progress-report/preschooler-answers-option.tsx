import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/motion-radio-group";
import { useUpsertPreschoolerAnswers } from "@/hooks/use-preschooler";

type AssessmentStatus = "yes" | "working-on";

interface PreschoolerAnswersOptionProps {
  questionId: string;

  value?: AssessmentStatus;
  onChange: (value: AssessmentStatus) => void;
}

export default function PreschoolerAnswersOption(
  props: PreschoolerAnswersOptionProps,
) {
  const upsertAnswer = useUpsertPreschoolerAnswers();

  return (
    <RadioGroup
      value={props.value}
      onValueChange={(v) => {
        if (v === "yes" || v === "working-on") props.onChange(v);
      }}
      className="mt-2"
    >
      <div className="flex items-center gap-2">
        <RadioGroupItem value="yes" id={`answer-yes-${props.questionId}`} />
        <Label
          htmlFor={`answer-yes-${props.questionId}`}
          className="cursor-pointer text-[13px] font-normal"
        >
          Yes
        </Label>
      </div>

      <div className="flex items-center gap-2">
        <RadioGroupItem
          value="working-on"
          id={`answer-working-on-${props.questionId}`}
        />
        <Label
          htmlFor={`answer-working-on-${props.questionId}`}
          className="cursor-pointer text-[13px] font-normal"
        >
          Working on
        </Label>
      </div>
    </RadioGroup>
  );
}
