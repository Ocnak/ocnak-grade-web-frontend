import { Fredoka } from "next/font/google";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { getSessionCookie } from "@/lib/prefreshing-components/get-session-cookie";
import {
  fetchScanners,
  SCANNERS_QUERY_KEY,
} from "@/lib/prefreshing-components/fetch-scanners";
import ScannersMain from "./scanners-main";

const fredoka = Fredoka({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export default async function ScannersPage() {
  const queryClient = new QueryClient();
  const cookie = await getSessionCookie();

  // if this fails (signed out, cookie not visible here), nothing is passed down
  // and the client fetches the list instead
  await queryClient.prefetchQuery({
    queryKey: SCANNERS_QUERY_KEY,
    queryFn: () => fetchScanners(cookie),
  });

  return (
    <main className="h-full w-full bg-[#f9faf8] px-3.75 py-3 md:px-6.25 md:py-6">
      <h1
        className={`${fredoka.className} text-[29px] font-semibold md:text-[35px]`}
      >
        Scanners
      </h1>

      <HydrationBoundary state={dehydrate(queryClient)}>
        <ScannersMain />
      </HydrationBoundary>
    </main>
  );
}
