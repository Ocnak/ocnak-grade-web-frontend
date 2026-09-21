import { SidebarProvider } from "@/components/ui/sidebar";
import AppSidebar from "./app-sidebar";
import AppHeader from "./app-header";
import { Outfit } from "next/font/google";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

export default function AdminRootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className={`text-slate-800 antialiased ${outfit.className}`}>
      <SidebarProvider
        style={
          {
            "--sidebar-width": "17.5rem",
          } as React.CSSProperties
        }
        defaultOpen={true}
      >
        <AppSidebar />
        <div className="w-full bg-[#f9faf8]">
          <AppHeader />
          {children}
        </div>
      </SidebarProvider>
    </div>
  );
}
