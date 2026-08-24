import AppHeader from "./app-header";
import { Outfit } from "next/font/google";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

export default function TeacherRootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className={`text-slate-800 antialiased ${outfit.className}`}>
      <div className="w-full bg-[#f9faf8]">
        <AppHeader />
        {children}
      </div>
    </div>
  );
}
