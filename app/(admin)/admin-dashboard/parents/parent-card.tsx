import { Fredoka } from "next/font/google";
import { ArrowLeftRight } from "lucide-react";
import ParentCardStudentTooltip from "./parent-card-class-tooltip";
import ParentCardTooltip from "./parent-card-tooltip";
import ParentCardDropdownMenu from "./parent-card-dropdown-menu";

const fredoka = Fredoka({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

interface ParentCardStudent {
  id: string;
  firstName: string;
  lastName: string;
  location: string | null;
  classId: string | null;
  className: string | null;
}

interface ParentCardProps {
  parentId: string;
  firstName: string;
  lastName: string;
  email: string;
  locations: string[];
  students: ParentCardStudent[];
}

export default function ParentCard(props: ParentCardProps) {
  const capitalizeName = (str?: string) =>
    str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : "";

  const parentFirst = props.firstName?.trim() ?? "";
  const parentLast = props.lastName?.trim() ?? "";

  // Parent name is "not provided yet" if both first and last are empty
  const hasParentName = Boolean(parentFirst || parentLast);

  // Fall back to the first student's last name, e.g. "Kollie's Family"
  const studentLastName = capitalizeName(props.students[0]?.lastName?.trim());

  const fullName = hasParentName
    ? `${capitalizeName(parentFirst)} ${capitalizeName(parentLast)}`.trim()
    : studentLastName
      ? `${studentLastName}'s Family`
      : "Unnamed Family";

  // "NY" = Not Yet provided
  const initials = hasParentName
    ? (parentFirst.charAt(0) + parentLast.charAt(0)).toUpperCase()
    : "NY";

  const isMultiLocation = props.locations.length > 1;

  return (
    <div
      key={props.parentId}
      className="relative flex w-full flex-col items-center space-y-3 rounded-xl border border-gray-300 bg-white py-7 shadow-md"
    >
      <ParentCardDropdownMenu
        parentId={props.parentId}
        userId={props.parentId}
      />{" "}
      <div
        className={`flex size-14 items-center justify-center rounded-full text-[18px] font-semibold shadow-sm ${
          hasParentName
            ? "bg-slate-100 text-slate-800"
            : "bg-slate-50 text-slate-400 ring-1 ring-dashed ring-slate-300"
        }`}
        title={hasParentName ? undefined : "Parent name not provided yet"}
      >
        {initials}
      </div>
      <div className="space-y-1.5">
        <h1
          className={`${fredoka.className} text-[18px] leading-2 font-semibold`}
        >
          {fullName}
        </h1>

        {isMultiLocation ? (
          <div
            className="flex items-center justify-center text-purple-700 mt-1"
            title={props.locations.join(" & ")}
          >
            <ArrowLeftRight className="size-6" />
          </div>
        ) : (
          <div className="flex flex-wrap justify-center gap-1">
            {props.locations.map((loc) => (
              <span
                key={loc}
                className={`text-[11px] font-semibold ${
                  loc === "Town Hall" ? "text-red-700" : "text-cyan-700"
                }`}
              >
                {loc}
              </span>
            ))}
          </div>
        )}
      </div>
      <div className="flex items-center gap-2">
        <div className="text-center font-semibold">
          <ParentCardStudentTooltip students={props.students} />
        </div>

        <ParentCardTooltip email={props.email} />
      </div>
    </div>
  );
}
