import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { questions, fullQuestions, expressQuestions } from '@/data/vectorQuestions'

export type TestMode = 'full' | 'express'

interface TraitScore {
  a: number
  b: number
}

interface TestStore {
  current: number
  answers: Record<number, number>
  scores: Record<string, TraitScore>
  isComplete: boolean
  testMode: TestMode
  userInfo: { fullName: string; phone: string; email: string } | null
  shareToken: string | null
  answer: (value: number) => void
  skip: () => void
  reset: () => void
  setUserInfo: (info: { fullName: string; phone: string; email: string }) => void
  setTestMode: (mode: TestMode) => void
  setShareToken: (token: string) => void
}

function initScores(): Record<string, TraitScore> {
  const scores: Record<string, TraitScore> = {}
  questions.forEach(q => {
    if (!scores[q.t]) scores[q.t] = { a: 0, b: 0 }
  })
  return scores
}

export const useVectorTestStore = create<TestStore>()(
  persist(
    (set, get) => ({
      current: 0,
      answers: {},
      scores: initScores(),
      isComplete: false,
      testMode: 'full',
      userInfo: null,
      shareToken: null,

      answer: (value: number) => {
        const { current, answers, scores, testMode } = get()
        const activeQs = testMode === 'express' ? expressQuestions : fullQuestions
        if (current >= activeQs.length) return

        const q = activeQs[current]
        const newScores = { ...scores }
        const traitScore = { ...newScores[q.t] }

        if (value === 1) traitScore.a += 2
        else if (value === 2) traitScore.a += 1
        else if (value === 4) traitScore.b += 1
        else if (value === 5) traitScore.b += 2
        // value 3 → neutral

        newScores[q.t] = traitScore
        const newCurrent = current + 1

        set({
          current: newCurrent,
          answers: { ...answers, [current]: value },
          scores: newScores,
          isComplete: newCurrent >= activeQs.length,
        })
      },

      skip: () => get().answer(3),

      reset: () => set({ current: 0, answers: {}, scores: initScores(), isComplete: false, shareToken: null }),

      setUserInfo: (info) => set({ userInfo: info }),

      setTestMode: (mode: TestMode) => set({
        testMode: mode,
        current: 0,
        answers: {},
        scores: initScores(),
        isComplete: false,
        shareToken: null,
      }),

      setShareToken: (token: string) => set({ shareToken: token }),
    }),
    {
      name: 'vector-test-results',
    }
  )
)
