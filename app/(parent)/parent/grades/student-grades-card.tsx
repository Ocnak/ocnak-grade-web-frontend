import { RippleButton } from "@/components/ui/ripple-button";
import { Fredoka } from "next/font/google";
import Link from "next/link";

const fredoka = Fredoka({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

interface StudentGradesCardProps {
  id: string;
  firstName: string;
  lastName: string;
  location: string | null;
  classId: string | null;
  className: string | null;
}

export default function StudentGradesCard(props: StudentGradesCardProps) {
  const initials = (
    props.firstName.charAt(0) + props.lastName.charAt(0)
  ).toUpperCase();

  return (
    <div className="bg-white flex flex-col items-center justify-center gap-2 shadow-md rounded-xl p-4 border border-gray-300">
      <div className="flex size-14 items-center justify-center rounded-full bg-slate-100 border border-gray-300 text-[17px] font-semibold text-slate-800 shadow-sm">
        {initials}
      </div>

      <div className="space-y-1">
        <h1 className={`${fredoka.className} text-[17px] font-semibold`}>
          {props.firstName} {props.lastName}
        </h1>

        <p
          className={`text-[11px] text-center font-semibold ${
            props.location === "Town Hall" ? "text-red-700" : "text-cyan-700"
          }`}
        >
          {props.location}
        </p>

        <p className="text-[12px] text-slate-800 font-medium">
          - {props.className ?? "No class assigned"} -
        </p>
      </div>

      <Link
        className="w-full"
        href={`/parent/view-student-grade?studentId=${props.id}`}
      >
        <RippleButton className="h-12  w-full rounded-sm cursor-pointer">
          View Grades
        </RippleButton>
      </Link>
    </div>
  );
}
