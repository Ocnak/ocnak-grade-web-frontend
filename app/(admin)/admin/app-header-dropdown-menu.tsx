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
import { useFetchUserData } from "@/hooks/use-users-info";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

export default function AppHeaderDropdownMenu() {
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const queryClient = useQueryClient();
  const { data: userData } = useFetchUserData();

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

  const fullName = `${capitalizeName(userData?.user.firstName ?? undefined)} ${capitalizeName(userData?.user.lastName ?? undefined)}`;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Account menu"
        className="cursor-pointer rounded p-1 outline-none focus-visible:ring-2 focus-visible:ring-gray-400"
      >
        <IoIosArrowDown className="text-[17px] text-gray-700" />
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className={`${outfit.className} mt-5 w-50 duration-200 data-[state=closed]:zoom-out-100 data-[state=closed]:slide-out-to-top-2 data-[state=open]:slide-in-from-top-2`}
      >
        <DropdownMenuLabel>
          <div className="mb-2">
            <p>{fullName}</p>
            <p className="text-[12px] text-gray-500">{userData?.user.email}</p>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          disabled={isSigningOut}
          onSelect={(e) => {
            e.preventDefault(); // keep menu open so the spinner shows
            onHandleSignOut();
          }}
          className="flex cursor-pointer h-10 items-center justify-center gap-2 py-1.5 text-[12px] font-semibold tracking-wide text-gray-700"
        >
          {isSigningOut ? (
            <Spinner className="size-6" />
          ) : (
            <>
              <LogOut size={19} color="#374151" /> Logout
            </>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
