import { Separator } from "@/components/ui/separator";
import siteLogo from "@/public/images/ocnak-logo.jpeg";
import Image from "next/image";
import Link from "next/link";
import { Fredoka } from "next/font/google";
import { FaFacebook, FaInstagram } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";

const fredoka = Fredoka({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export default function Footer() {
  const currentYear = new Date().getFullYear();
  return (
    <>
      <div className="">
        <footer className="px-2.5 pt-6 text-[17px]">
          <Separator className="my-5 border-t border-gray-300" />

          <div className="mx-auto grid w-full max-w-[1140px] grid-cols-1 md:grid-cols-2">
            {/* first grid div */}
            <div className="space-y-2">
              <Link href="/" className="flex items-center gap-1">
                <Image src={siteLogo} alt="navbar logo" className="size-10" />
                <p
                  className={`${fredoka.className} hidden text-[20px] leading-none font-semibold tracking-wide text-slate-800 sm:block`}
                >
                  OCNAK
                </p>
              </Link>

              <p
                className={`${fredoka.className} pl-2 text-[15px] font-light text-gray-700 md:pl-0`}
              >
                Copyright © {currentYear} ocnak. All rights reserved.
              </p>
            </div>

            {/* second grid div */}
            <div className="mt-1.5 md:mt-0">
              <div className="flex w-full flex-col items-end gap-4">
                <div className="mx-2 flex gap-5">
                  <Link
                    href="#"
                    className="transform cursor-pointer transition-all duration-400 hover:scale-150 hover:-rotate-5 hover:text-red-800"
                  >
                    <FaFacebook className="size-6" />
                  </Link>
                  <Link
                    href="#"
                    className="transform cursor-pointer transition-all duration-400 hover:scale-150 hover:-rotate-5 hover:text-red-800"
                  >
                    <FaInstagram className="size-6" />
                  </Link>

                  <Link
                    href="#"
                    className="transform cursor-pointer transition-all duration-400 hover:scale-150 hover:-rotate-5 hover:text-red-800"
                  >
                    <FaXTwitter className="size-6" />
                  </Link>
                </div>

                <div className="inline text-[17px]"></div>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
