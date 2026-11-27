import type { Metadata } from "next";
import { Toaster } from "@/components/ui/sonner";
import { ReactLenis } from "@/utils/lenis";
import "./globals.css";
import QueryProvider from "@/components/QueryProvider";
import { Outfit, Geist } from "next/font/google";
import { cn } from "@/lib/utils";
import { Suspense } from "react";
import { NextHogProvider } from "@/app/providers/posthog-provider";
import PostHogPageView from "@/components/posthog-page-view";
import PostHogIdentify from "@/components/posthog-identify";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

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
    <html lang="en" data-scroll-behavior="smooth" className={cn("font-sans", geist.variable)}>
      <body
        className={`flex h-full flex-col justify-center text-slate-800 antialiased ${outfit.className}`}
      >
        <NextHogProvider>
          <ReactLenis root>
            <QueryProvider>
              <Suspense fallback={null}>
                <PostHogPageView />
              </Suspense>
              <PostHogIdentify />
              {children}
              <Toaster />
            </QueryProvider>
          </ReactLenis>
        </NextHogProvider>
      </body>
    </html>
  );
}
