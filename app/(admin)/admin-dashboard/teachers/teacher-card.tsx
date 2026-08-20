import { Crimson_Text } from "next/font/google";
import TeacherCardDropdownMenu from "./teacher-card-dropdown-menu";
import TeacherCardTooltip from "./teacher-card-tooltip";
import TeacherCardClassTooltip from "./teacher-card-class-tooltip";

const crimson_text = Crimson_Text({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
});

interface TeacherCardProps {
  teacherId: string;
  firstName: string;
  lastName: string;
  email: string;
  classes: { id: string; name: string }[];
}

export default function TeacherCard(props: TeacherCardProps) {
  const capitalizeName = (str?: string) =>
    str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : "";

  const fullName = `${capitalizeName(props.firstName)} ${capitalizeName(
    props.lastName,
  )}`;

  return (
    <div
      key={props.teacherId}
      className="relative flex w-full flex-col items-center space-y-4 rounded-xl border border-gray-200 bg-white py-7 shadow-md"
    >
      <TeacherCardDropdownMenu
        teacherId={props.teacherId}
        userId={props.teacherId}
      />{" "}
      <div className="flex size-14 items-center justify-center rounded-full bg-slate-100 text-[18px] font-semibold text-slate-800 shadow-sm">
        {props.firstName.charAt(0).toUpperCase() +
          props.lastName.charAt(0).toUpperCase()}
      </div>
      <h1
        className={`${crimson_text.className} text-[18px] leading-2 font-semibold`}
      >
        {fullName}
      </h1>
      <div className="flex items-center gap-2">
        <div className="text-center font-semibold">
          <TeacherCardClassTooltip classNames={props.classes} />
        </div>
        <TeacherCardTooltip email={props.email} />
      </div>
    </div>
  );
}
