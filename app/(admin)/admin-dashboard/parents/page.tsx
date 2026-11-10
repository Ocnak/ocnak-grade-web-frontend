import { Fredoka } from "next/font/google";
import ParentMain from "./parent-main";

const fredoka = Fredoka({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export default function ParentsPage() {
  return (
    <main className="h-full w-full bg-[#f9faf8] px-3.75 py-3 md:px-6.25 md:py-6">
      <h1
        className={`${fredoka.className} text-[29px] font-semibold md:text-[35px]`}
      >
        Parents Details
      </h1>

      <ParentMain />
    </main>
  );
}
