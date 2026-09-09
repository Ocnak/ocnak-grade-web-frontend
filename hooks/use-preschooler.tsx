import { useQuery } from "@tanstack/react-query";

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
