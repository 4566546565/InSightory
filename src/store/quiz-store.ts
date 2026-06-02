import { create } from "zustand";

interface QuizQuestion {
  id: string;
  type: string;
  difficulty: number;
  stem: unknown;
  options: unknown;
  timeEstimate: number;
}

interface QuizState {
  questions: QuizQuestion[];
  currentIndex: number;
  answers: Record<string, unknown>;
  startTime: number | null;
  isFinished: boolean;
  score: number | null;
  totalScore: number;

  setQuestions: (questions: QuizQuestion[]) => void;
  setAnswer: (questionId: string, answer: unknown) => void;
  nextQuestion: () => void;
  prevQuestion: () => void;
  goToQuestion: (index: number) => void;
  startQuiz: () => void;
  finishQuiz: (score: number, totalScore: number) => void;
  reset: () => void;
}

export const useQuizStore = create<QuizState>((set) => ({
  questions: [],
  currentIndex: 0,
  answers: {},
  startTime: null,
  isFinished: false,
  score: null,
  totalScore: 0,

  setQuestions: (questions) => set({ questions, currentIndex: 0, answers: {}, isFinished: false, score: null }),
  setAnswer: (questionId, answer) =>
    set((state) => ({ answers: { ...state.answers, [questionId]: answer } })),
  nextQuestion: () =>
    set((state) => ({
      currentIndex: Math.min(state.currentIndex + 1, state.questions.length - 1),
    })),
  prevQuestion: () =>
    set((state) => ({ currentIndex: Math.max(state.currentIndex - 1, 0) })),
  goToQuestion: (index) => set({ currentIndex: index }),
  startQuiz: () => set({ startTime: Date.now() }),
  finishQuiz: (score, totalScore) => set({ isFinished: true, score, totalScore }),
  reset: () =>
    set({ questions: [], currentIndex: 0, answers: {}, startTime: null, isFinished: false, score: null, totalScore: 0 }),
}));
