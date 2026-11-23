import RemoveSubjectModal from "./remove-subject-modal";

interface SubjectCardProps {
  subjectId: string;
  subjectName: string;
  classId: string;
}

export default function SubjectCard(props: SubjectCardProps) {
  return (
    <div
      key={props.subjectId}
      className="rounded border border-gray-200 p-2 shadow-sm"
    >
      {/* the ✕ asks for confirmation before removing the subject */}
      <RemoveSubjectModal
        subjectId={props.subjectId}
        subjectName={props.subjectName}
        classId={props.classId}
      />
      <p className="text-[11px] font-semibold capitalize">
        {props.subjectName}
      </p>
    </div>
  );
}
