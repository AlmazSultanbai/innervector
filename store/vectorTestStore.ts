import { create } from 'zustand'
import { questions } from '@/data/vectorQuestions'

interface TraitScore {
  a: number
  b: number
}

interface TestStore {
  current: number
  answers: Record<number, number>
  scores: Record<string, TraitScore>
  isComplete: boolean
  answer: (value: number) => void
  skip: () => void
  reset: () => void
}

function initScores(): Record<string, TraitScore> {
  const scores: Record<string, TraitScore> = {}
  questions.forEach(q => {
    if (!scores[q.t]) {
      scores[q.t] = { a: 0, b: 0 }
    }
  })
  return scores
}

export const useVectorTestStore = create<TestStore>((set, get) => ({
  current: 0,
  answers: {},
  scores: initScores(),
  isComplete: false,

  answer: (value: number) => {
    const { current, answers, scores } = get()
    if (current >= questions.length) return

    const q = questions[current]
    const newScores = { ...scores }
    const traitScore = { ...newScores[q.t] }

    // value 1 → +2 to a, 2 → +1 to a, 3 → 0, 4 → +1 to b, 5 → +2 to b
    if (value === 1) traitScore.a += 2
    else if (value === 2) traitScore.a += 1
    else if (value === 4) traitScore.b += 1
    else if (value === 5) traitScore.b += 2
    // value 3 → neutral, no change

    newScores[q.t] = traitScore

    const newCurrent = current + 1
    set({
      current: newCurrent,
      answers: { ...answers, [current]: value },
      scores: newScores,
      isComplete: newCurrent >= questions.length,
    })
  },

  skip: () => {
    get().answer(3)
  },

  reset: () => {
    set({
      current: 0,
      answers: {},
      scores: initScores(),
      isComplete: false,
    })
  },
}))
