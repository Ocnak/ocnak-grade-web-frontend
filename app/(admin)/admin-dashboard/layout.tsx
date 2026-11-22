import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { SidebarProvider } from "@/components/ui/sidebar";
import { getSessionCookie } from "@/lib/prefreshing-components/get-session-cookie";
import { prefetchCurrentUser } from "@/lib/prefreshing-components/fetch-user-data";
import AppSidebar from "./app-sidebar";
import AppHeader from "./app-header";
import { Outfit } from "next/font/google";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

// prefetch the signed-in user once here, so the header, dropdown and sidebars render without a loading flash
export default async function AdminRootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const queryClient = new QueryClient();
  const cookie = await getSessionCookie();
  await prefetchCurrentUser(queryClient, cookie);

  return (
    <div className={`text-slate-800 antialiased ${outfit.className}`}>
      <HydrationBoundary state={dehydrate(queryClient)}>
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
      </HydrationBoundary>
    </div>
  );
}
