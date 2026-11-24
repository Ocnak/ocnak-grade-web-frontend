import { Fredoka } from "next/font/google";
import ScannerCardDropdownMenu from "./scanner-card-dropdown-menu";
import TeacherCardTooltip from "../teachers/teacher-card-tooltip";

const fredoka = Fredoka({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

interface ScannerCardProps {
  scannerId: string;
  firstName: string;
  lastName: string;
  email: string;
  location: string | null;
}

export default function ScannerCard(props: ScannerCardProps) {
  const capitalizeName = (str?: string) =>
    str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : "";

  const fullName = `${capitalizeName(props.firstName)} ${capitalizeName(
    props.lastName,
  )}`;

  return (
    <div className="relative flex w-full flex-col items-center space-y-3 rounded-xl border border-gray-300 bg-white py-7 shadow-md">
      <ScannerCardDropdownMenu scannerId={props.scannerId} />
      <div className="flex size-14 items-center justify-center rounded-full bg-slate-100 text-[18px] font-semibold text-slate-800 shadow-sm">
        {props.firstName.charAt(0).toUpperCase() +
          props.lastName.charAt(0).toUpperCase()}
      </div>
      <div className="space-y-1.5">
        <h1
          className={`${fredoka.className} text-[18px] leading-2 font-semibold`}
        >
          {fullName}
        </h1>
        <p
          className={`text-center text-[11px] font-semibold ${
            props.location === "Town Hall" ? "text-red-700" : "text-cyan-700"
          }`}
        >
          {props.location ?? "No location"}
        </p>
      </div>
      <TeacherCardTooltip email={props.email} />
    </div>
  );
}
