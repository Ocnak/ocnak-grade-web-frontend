import { TbStarsFilled } from "react-icons/tb";
import { useModalStore } from "@/store/modalStore";
import { useClassStore } from "@/store/classStore";
import * as motion from "motion/react-client";

interface ClassCardProps {
  classId: string;
  className: string;
}

export default function ClassCard(props: ClassCardProps) {
  const { setOpen } = useModalStore();
  const setSelectedClass = useClassStore((state) => state.setSelectedClass);

  const onHandleClick = () => {
    setSelectedClass({ classId: props.classId, className: props.className });
    setOpen(true);
  };

  return (
    <motion.div
      key={props.classId}
      onClick={onHandleClick}
      whileTap={{ scale: 0.85 }}
      whileHover={{ backgroundColor: "#1d293d", color: "#ffffff" }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      style={{ backgroundColor: "#ffffff", color: "#000000" }}
      className="cursor-pointer rounded-md border border-gray-200 px-2 py-4 shadow-sm"
    >
      <TbStarsFilled className="mb-1 h-7 w-7" />
      <p className="font-semibold md:text-[13px]">{props.className}</p>
    </motion.div>
  );
}
