import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// fetch all preschooler question categories
export function useFetchPreSchoolerQuestionsCategory() {
  return useQuery({
    queryKey: ["preschooler_question_category"],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/preschooler/categories`,
        { credentials: "include" },
      );
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Failed to fetch preschooler categories");
      }
      const data = await res.json();
      return data.categories as { id: string; categoryName: string | null }[];
    },
    staleTime: 1000 * 60 * 180,
    retry: 1,
  });
}

// fetch preschooler question category by id
export function useFetchPreSchoolerQuestionsCategoryById(
  categoryId: string | null,
) {
  return useQuery({
    queryKey: ["preschooler_question_category", categoryId],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/preschooler/categories/${categoryId}`,
        { credentials: "include" },
      );
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Failed to fetch preschooler category");
      }
      const data = await res.json();
      return data.category as { id: string; categoryName: string | null };
    },
    enabled: !!categoryId,
    staleTime: 1000 * 60 * 180,
    retry: 1,
  });
}

// fetch all preschooler categories with their nested questions
export function useFetchPreSchoolerQuestions() {
  return useQuery({
    queryKey: ["preschooler_categories_with_questions"],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/preschooler/categories-with-questions`,
        { credentials: "include" },
      );
      if (!res.ok) {
        const err = await res.json();
        throw new Error(
          err.error ?? "Failed to fetch preschooler categories with questions",
        );
      }
      const data = await res.json();
      return data.categories as {
        id: string;
        categoryName: string | null;
        questions: { id: string; questionText: string | null }[];
      }[];
    },
    staleTime: 1000 * 60 * 180,
    retry: 1,
  });
}

// fetch all preschooler questions (flat, ungrouped)
export function useFetchAllPreSchoolerQuestions() {
  return useQuery({
    queryKey: ["preschooler_questions"],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/preschooler/get-all`,
        { credentials: "include" },
      );
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Failed to fetch preschooler questions");
      }
      const data = await res.json();
      return data.questions as {
        id: string;
        categoryId: string;
        questionText: string | null;
      }[];
    },
    staleTime: 1000 * 60 * 180,
    retry: 1,
  });
}

// fetch preschooler questions by categoryId
export function useFetchPreSchoolerQuestionsByCategory(
  categoryId: string | null,
) {
  return useQuery({
    queryKey: ["preschooler_questions", "by-category", categoryId],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/preschooler/by-category/${categoryId}`,
        { credentials: "include" },
      );
      if (!res.ok) throw new Error("Failed to fetch questions by category");
      const data = await res.json();
      return data.questions as {
        id: string;
        categoryId: string;
        questionText: string | null;
      }[];
    },
    enabled: !!categoryId,
    staleTime: 1000 * 60 * 180,
  });
}

// fetch preschooler question by id
export function useFetchPreSchoolerQuestionById(questionId: string | null) {
  return useQuery({
    queryKey: ["preschooler_question", questionId],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/preschooler/get-by-id/${questionId}`,
        { credentials: "include" },
      );
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Failed to fetch preschooler question");
      }
      const data = await res.json();
      return data.question as {
        id: string;
        categoryId: string;
        questionText: string | null;
      };
    },
    enabled: !!questionId,
    staleTime: 1000 * 60 * 180,
    retry: 1,
  });
}

// ensure both semester report cards exist for a newly created preschooler
// student — call this right after creating a student via the general
// students route
export function useEnsurePreschoolerReportCards() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (studentId: string) => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/preschooler/report-cards/ensure/${studentId}`,
        { method: "POST", credentials: "include" },
      );
      if (!res.ok) {
        const err = await res.json();
        throw new Error(
          err.error ?? "Failed to create preschooler report cards",
        );
      }
      const data = await res.json();
      return data.reportCards as {
        id: string;
        studentId: string;
        semester: string;
        createdAt: string | null;
      }[];
    },
    onSuccess: (_data, studentId) => {
      queryClient.invalidateQueries({
        queryKey: ["preschooler_report_cards", "by-student", studentId],
      });
    },
  });
}

// fetch all report cards for a semester, with student + nested answers
export function useFetchPreschoolerReportCards(semester: string) {
  return useQuery({
    queryKey: ["preschooler_report_cards", semester],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/preschooler/report-cards?semester=${encodeURIComponent(semester)}`,
        { credentials: "include" },
      );
      if (!res.ok) {
        const err = await res.json();
        throw new Error(
          err.error ?? "Failed to fetch preschooler report cards",
        );
      }
      const data = await res.json();
      return data.reportCards as {
        id: string;
        semester: string;
        createdAt: string | null;
        student: {
          id: string;
          firstName: string;
          lastName: string;
          location: string;
        } | null;
        answers: {
          id: string;
          status: string | null;
          questionId: string;
          questionText: string | null;
          categoryId: string | null;
          categoryName: string | null;
        }[];
      }[];
    },
    staleTime: 1000 * 60 * 180,
    retry: 1,
  });
}

// fetch a single student's report card (+ answers) for a given semester
export function useFetchPreschoolerReportCardByStudent(
  studentId: string | null,
  semester: string,
) {
  return useQuery({
    queryKey: ["preschooler_report_cards", "by-student", studentId, semester],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/preschooler/report-cards/by-student/${studentId}?semester=${encodeURIComponent(semester)}`,
        { credentials: "include" },
      );
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Failed to fetch report card");
      }
      const data = await res.json();
      return data.reportCard as {
        id: string;
        studentId: string;
        semester: string;
        createdAt: string | null;
        answers: {
          id: string;
          status: string | null;
          questionId: string;
          questionText: string | null;
          categoryId: string | null;
          categoryName: string | null;
        }[];
      };
    },
    enabled: !!studentId,
    staleTime: 1000 * 60 * 180,
    retry: 1,
  });
}

// upsert many answers for a student + semester in one call
export function useUpsertPreschoolerAnswers() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      studentId,
      semester,
      answers,
    }: {
      studentId: string;
      semester: string;
      answers: Record<string, "yes" | "working-on">;
    }) => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/preschooler/answers/upsert`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ studentId, semester, answers }),
        },
      );
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Failed to save preschooler answers");
      }
      const data = await res.json();
      return data.answers as {
        id: string;
        reportCardId: string;
        questionId: string;
        status: string | null;
      }[];
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: [
          "preschooler_answers",
          "by-student",
          variables.studentId,
          variables.semester,
        ],
      });
      queryClient.invalidateQueries({
        queryKey: [
          "preschooler_report_cards",
          "by-student",
          variables.studentId,
          variables.semester,
        ],
      });
      queryClient.invalidateQueries({
        queryKey: ["preschooler_report_cards", variables.semester],
      });
    },
  });
}

// fetch answers for a single student + semester (flat, not nested under a report card)
export function useFetchPreschoolerAnswersByStudent(
  studentId: string | null,
  semester: string,
) {
  return useQuery({
    queryKey: ["preschooler_answers", "by-student", studentId, semester],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/preschooler/answers/by-student/${studentId}?semester=${encodeURIComponent(semester)}`,
        { credentials: "include" },
      );
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Failed to fetch preschooler answers");
      }
      const data = await res.json();
      return data.answers as {
        id: string;
        status: string | null;
        questionId: string;
        reportCardId: string;
      }[];
    },
    enabled: !!studentId,
    staleTime: 1000 * 60 * 180,
    retry: 1,
  });
}
