import StudentDataTable from "./student-academic-history-data-table";

export default async function StudentClassTable({
  params,
}: {
  params: Promise<{ classId: string }>;
}) {
  const { classId } = await params;

  return (
    <>
      <section className="h-full bg-[#f9faf8] py-6">
        <StudentDataTable classId={classId} />
      </section>
    </>
  );
}
