import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CircleUser, LogOut } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useSession } from "@/hooks/use-session";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { authClient } from "@/lib/auth-client";
import { Spinner } from "@/components/ui/spinner";
import { Crimson_Text } from "next/font/google";

const crimson_text = Crimson_Text({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
});

export default function AppHeaderMenu() {
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const queryClient = useQueryClient();
  const { data: session, isLoading: sessionLoader } = useSession();
  const capitalizeName = (str?: string) =>
    str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : "";

  const fullName = `${capitalizeName(session?.user.firstName ?? undefined)} ${capitalizeName(session?.user.lastName ?? undefined)}`;

  const onHandleSignOut = async () => {
    setIsSigningOut(true);
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["session"] });
          router.push("/"); // redirect after sign out
        },
        onError: (ctx) => {
          console.error("Sign out failed:", ctx.error.message);
          setIsSigningOut(false);
        },
      },
    });
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        {/* <div className="px-2">
          <CircleUser className="size-10 text-slate-800" />
        </div> */}

        <div className="px-2">
          <button className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-800">
            <p
              className={`text-[16px] font-medium ${crimson_text.className} text-white`}
            >
              {session?.user.firstName?.charAt(0).toUpperCase()}
              {session?.user.lastName?.charAt(0).toUpperCase()}
            </p>
          </button>
        </div>
      </PopoverTrigger>
      <PopoverContent className="data-[state=open]:zoom-in-0! rounded-sm w-48 data-[state=closed]:zoom-out-0! mt-2 mr-2.5 origin-center duration-200 md:mr-7.5">
        <div className="w-full duration-200">
          <div>
            {" "}
            <div className="mb-2">
              <p>{fullName}</p>
              <p className="text-[12px] text-gray-500">
                {session?.user.email}
              </p>{" "}
            </div>
          </div>
          <Separator />
          <div>
            <button
              onClick={onHandleSignOut}
              className="w-full cursor-pointer rounded py-1.5 font-semibold tracking-wide text-gray-700 shadow-none"
            >
              <div className="flex items-center justify-center gap-2 rounded text-[12px]">
                {isSigningOut ? (
                  <Spinner />
                ) : (
                  <>
                    <LogOut size={19} color="#374151" /> Logout
                  </>
                )}
              </div>
            </button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
