import { IoMdCheckmarkCircleOutline } from "react-icons/io";
import { RiProgress3Line } from "react-icons/ri";
import {
  useFetchPreSchoolerQuestions,
  useFetchPreschoolerAnswersByStudent,
} from "@/hooks/use-preschooler";
import { Spinner } from "@/components/ui/spinner";
import { useFilterStore } from "@/store/filterStore";

interface ReportCardProps {
  preschoolerId: string;
}

export default function ReportCard(props: ReportCardProps) {
  const { preschoolerSemester } = useFilterStore();
  const semester = preschoolerSemester || "Semester 1";

  const {
    data: answersData,
    error: answersDataError,
    isLoading: answersDataLoader,
  } = useFetchPreschoolerAnswersByStudent(props.preschoolerId, semester);

  const {
    data: questionsData,
    error: questionsDataError,
    isLoading: questionsDataLoader,
  } = useFetchPreSchoolerQuestions();

  if (questionsDataLoader || answersDataLoader) {
    return (
      <div className="mt-32.5 flex w-full items-center justify-center">
        <Spinner className="size-19" />
      </div>
    );
  }

  if (questionsDataError)
    return (
      <div>
        Error fetching preschooler question category data:{" "}
        {questionsDataError.message}
      </div>
    );

  if (answersDataError)
    return (
      <div>
        Error fetching preschooler answers data: {answersDataError.message}
      </div>
    );

  const answerStatusMap = new Map(
    answersData?.map((answer) => [answer.questionId, answer.status]) || [],
  );

  return (
    <>
      <div className="flex w-full flex-col gap-3 pb-5">
        {questionsData?.map((category) => (
          <div key={category.id} className="font-medium">
            {/* Category Header */}
            <div className="rounded-t-md  bg-slate-800 p-4 text-center text-white">
              <h2 className="text-[18px] font-semibold tracking-wide uppercase">
                {category.categoryName}
              </h2>
            </div>

            <div className="grid grid-cols-2 border-x border-black bg-slate-200">
              <div className="flex items-center justify-center border-r border-b border-black p-2 text-sm font-bold">
                Student Activity
              </div>
              <div className="flex items-center justify-center border-b border-black p-2 text-sm font-bold">
                Progress Report
              </div>
            </div>

            {/* Map through the nested questions */}
            {category.questions && category.questions.length > 0 ? (
              category.questions.map((question) => {
                const status = answerStatusMap.get(question.id);

                return (
                  <div
                    key={question.id}
                    className="grid grid-cols-2 border-x border-b border-black bg-white transition-colors hover:bg-slate-50"
                  >
                    {/* Left Side: Question Text */}
                    <div className="flex items-center border-r border-black p-3 text-[13px] leading-relaxed md:text-sm">
                      {question.questionText}
                    </div>

                    {/* Right Side: Status Icons */}
                    <div className="grid grid-cols-2">
                      <div className="group flex cursor-pointer items-center justify-center border-r border-slate-300">
                        {status === "yes" ? (
                          <div className="flex flex-col items-center gap-1">
                            <IoMdCheckmarkCircleOutline className="size-6 text-green-600 transition-transform group-hover:scale-110" />
                            <span className="text-[10px] text-gray-500">
                              Yes
                            </span>
                          </div>
                        ) : null}
                      </div>
                      <div className="group flex cursor-pointer items-center justify-center">
                        {status === "working-on" ? (
                          <div className="flex flex-col items-center gap-1">
                            <RiProgress3Line className="size-6 text-amber-600 transition-transform group-hover:scale-110" />
                            <span className="text-[10px] text-gray-500">
                              In-Progress
                            </span>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="border-x border-b border-black p-4 text-center text-gray-400 italic">
                No questions available for this category.
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );
}
