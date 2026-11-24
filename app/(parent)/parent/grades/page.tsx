import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { getSessionCookie } from "@/lib/prefreshing-components/get-session-cookie";
import {
  fetchParentMe,
  PARENT_ME_QUERY_KEY,
} from "@/lib/prefreshing-components/fetch-parents";
import GradesMain from "./grades-main";

export default async function ParentGradesPage() {
  const queryClient = new QueryClient();
  const cookie = await getSessionCookie();

  // the parent and their children; a failure just means the client fetches it instead
  await queryClient.prefetchQuery({
    queryKey: PARENT_ME_QUERY_KEY,
    queryFn: () => fetchParentMe(cookie),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <GradesMain />
    </HydrationBoundary>
  );
}
