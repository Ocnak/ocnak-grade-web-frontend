import type { Metadata } from "next";
import Footer from "@/components/footer/Footer";
import PreviewHeader from "./header/header";

export const metadata: Metadata = {
  title: "Ocnak Daycare: Grades Tracking System",
  description: "A student grades tracking platform",
};

export default function PreviewLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div
      className={`flex min-h-screen flex-col bg-gray-100 text-slate-800 antialiased`}
    >
      <PreviewHeader />
      <div className="flex-1">{children}</div>
      <Footer />
    </div>
  );
}
