import type { Metadata } from "next";
import { Toaster } from "@/components/ui/sonner";
import { ReactLenis } from "@/utils/lenis";
import "./globals.css";
import QueryProvider from "@/components/QueryProvider";
import { Outfit } from "next/font/google";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Ocnak Daycare: Grades Tracking System",
  description: "A student grades tracking platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body
        className={`flex h-full flex-col justify-center text-slate-800 antialiased ${outfit.className}`}
      >
        <ReactLenis root>
          <QueryProvider>
            {children}
            <Toaster />
          </QueryProvider>
        </ReactLenis>
      </body>
    </html>
  );
}
