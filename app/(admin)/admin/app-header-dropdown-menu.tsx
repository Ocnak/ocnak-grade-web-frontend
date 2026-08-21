import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { IoIosArrowDown } from "react-icons/io";
import { useState } from "react";
import { LogOut } from "lucide-react";
import { Outfit } from "next/font/google";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { authClient } from "@/lib/auth-client";
import { Spinner } from "@/components/ui/spinner";
import { useSession } from "@/hooks/use-session";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

export default function AppHeaderDropdownMenu() {
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const queryClient = useQueryClient();
  const { data: session, isLoading: sessionLoader } = useSession();

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

  const capitalizeName = (str?: string) =>
    str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : "";

  const fullName = `${capitalizeName(session?.user.firstName ?? undefined)} ${capitalizeName(session?.user.lastName ?? undefined)}`;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <DropdownMenuTrigger>
          <IoIosArrowDown className="cursor-pointer text-[17px] font-semibold text-gray-700" />
        </DropdownMenuTrigger>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className={`${outfit.className} data-[state=closed]:slide-out-to-left-0 data-[state=open]:slide-in-from-left-0 data-[state=closed]:slide-out-to-bottom-20 data-[state=open]:slide-in-from-bottom-20 data-[state=closed]:zoom-out-100 mt-5 mr-5.25 w-50 duration-300`}
      >
        <DropdownMenuLabel>
          {" "}
          <div className="mb-2">
            <p>{fullName}</p>
            <p className="text-[12px] text-gray-500">
              {session?.user.email}
            </p>{" "}
          </div>{" "}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
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
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
