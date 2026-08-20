import sectionImage from "@/public/images/oncak1.jpeg";
import starImage1 from "@/public/images/star-circle-svgrepo-com.svg";
import starImage2 from "@/public/images/star-circle-svgrepo-com1.svg";
import starImage3 from "@/public/images/star-circle-svgrepo-com2.svg";
import { Fredoka } from "next/font/google";
import Image from "next/image";

const fredoka = Fredoka({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export default function HeroSection() {
  return (
    <div className="mt-7 flex flex-col items-center gap-12 md:flex-row md:gap-5">
      <div className="relative z-0 shrink-0">
        {/* Main circular image */}
        <div className="relative size-72 overflow-hidden rounded-full md:size-89">
          <Image
            src={sectionImage}
            alt="student image"
            quality={75}
            priority
            placeholder="blur"
            sizes="356px"
            fill
            className="z-0 object-cover"
          />
          <div className="absolute inset-0 z-10 rounded-full bg-black/20" />
        </div>

        {/* Star top-left */}
        <Image
          src={starImage1}
          alt="red star icon"
          width={50}
          height={50}
          priority
          className="absolute top-20 -left-2 z-50 brightness-125 drop-shadow-lg saturate-150"
        />

        {/* Star top-right */}
        <Image
          src={starImage2}
          alt="yellow star icon"
          width={50}
          height={50}
          priority
          className="absolute top-20 -right-2 z-50 brightness-125 drop-shadow-lg saturate-150"
        />

        {/* Star bottom-center */}
        <Image
          src={starImage3}
          alt="sky blue star icon"
          width={70}
          height={70}
          priority
          className="absolute -bottom-8 left-1/2 z-50 -translate-x-1/2 brightness-125 drop-shadow-lg saturate-150"
        />
      </div>

      <div className="space-y-4 md:space-y-6">
        <h1
          className={`${fredoka.className} text-[29px] leading-8.5 font-semibold md:text-[32px] md:leading-normal`}
        >
          OCNAK: Welcome To Our Platform
        </h1>

        <p className="text-[16px] font-light text-gray-600">
          We are excited to introduce OCNAK, the school’s modern grade tracking
          system linking parents, students, and teachers through one unified
          platform. Teachers can enter grades directly, and the system
          automatically calculates averages, generates honor roll and
          principal’s lists, and more. Parents can easily view their children’s
          progress anytime, ensuring transparency and engagement. With new
          features in development, OCNAK continues to strengthen the connection
          between home and school.
        </p>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-2">
          <div className="flex items-center gap-2">
            <Image
              src={starImage1}
              alt="red star icon"
              width={40}
              height={40}
              priority
            />
            <p className="text-[14px] font-medium">Real-Time Grades</p>
          </div>

          <div className="flex items-center gap-2">
            <Image
              src={starImage2}
              alt="yellow star icon"
              width={40}
              height={40}
              priority
            />
            <p className="text-[14px] font-medium">Average Calculation</p>
          </div>

          <div className="flex items-center gap-2">
            <Image
              src={starImage3}
              alt="red star icon"
              width={40}
              height={40}
              priority
            />
            <p className="text-[14px] font-medium">Progress Visibility</p>
          </div>
        </div>

        <div className="text mt-4 inline-block rounded-md bg-yellow-600 p-3 shadow">
          <h4
            className={`${fredoka.className} text-[17px] font-medium text-white`}
          >
            Our Children Nursery and Kindergarden
          </h4>
        </div>
      </div>
    </div>
  );
}
