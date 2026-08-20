import {
  Tabs,
  TabsContent,
  TabsContents,
  TabsList,
  TabsTrigger,
} from "@/components/ui/motion-tabs";
import { Crimson_Text } from "next/font/google";
// import StudentGradesForm from "./student-grades-form";
import UpdateStudentForm from "./update-student-form";

const crimson_text = Crimson_Text({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
});

interface UpdateStudentModalTabsTypes {
  studentId: string;
}
export default function UpdateStudentModalTabs(
  props: UpdateStudentModalTabsTypes,
) {
  const tabs = [
    {
      name: "Personal",
      value: "personal",
      content: (
        <>
          <h3
            className={`text-[20px] font-semibold text-slate-800 ${crimson_text.className}`}
          >
            Personal
          </h3>
          <UpdateStudentForm studentId={props.studentId} />
        </>
      ),
    },
    // {
    //   name: "Grades",
    //   value: "grades",
    //   content: (
    //     <>
    //       <h3
    //         className={`text-[20px] font-semibold text-slate-800 ${crimson_text.className}`}
    //       >
    //         Grades
    //       </h3>
    //       <StudentGradesForm studentId={props.studentId} />
    //     </>
    //   ),
    // },
  ];
  return (
    <div className="w-full">
      <Tabs defaultValue="personal" className="gap-4">
        <TabsList className="rounded">
          {tabs.map((tab) => (
            <TabsTrigger
              className="rounded px-6"
              key={tab.value}
              value={tab.value}
            >
              {tab.name}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContents className="bg-background -mt-2 mb-1 h-full rounded-sm">
          {tabs.map((tab) => (
            <TabsContent key={tab.value} value={tab.value}>
              <p className="text-muted-foreground text-sm">{tab.content}</p>
            </TabsContent>
          ))}
        </TabsContents>
      </Tabs>
    </div>
  );
}
