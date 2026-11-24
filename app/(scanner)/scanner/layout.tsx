import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { getSessionCookie } from "@/lib/prefreshing-components/get-session-cookie";
import { prefetchCurrentUser } from "@/lib/prefreshing-components/fetch-user-data";
import AppHeader from "./app-header";
import { Outfit } from "next/font/google";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

// prefetch the signed-in user once here, so the header and the location scope render without a loading flash
export default async function ScannerRootLayout({
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
        <div className="w-full bg-[#f9faf8]">
          <AppHeader />
          {children}
        </div>
      </HydrationBoundary>
    </div>
  );
}
