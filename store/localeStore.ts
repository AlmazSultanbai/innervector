import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Locale = 'ru' | 'en' | 'ky'

interface LocaleStore {
  locale: Locale
  setLocale: (l: Locale) => void
}

export const useLocaleStore = create<LocaleStore>()(
  persist(
    (set) => ({
      locale: 'ru',
      setLocale: (locale) => set({ locale }),
    }),
    { name: 'iv-locale' }
  )
)
