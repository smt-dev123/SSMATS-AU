import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface AcademicState {
  selectedYearId: number | null
  selectedYearName: string
  // កំណត់ឆ្នាំសិក្សាថ្មី
  setAcademicYear: (id: number, name: string) => void
  // លុបទិន្នន័យឆ្នាំសិក្សា
  resetAcademicYear: () => void
}

export const useAcademicStore = create<AcademicState>()(
  persist(
    (set) => ({
      selectedYearId: null,
      selectedYearName: 'ជ្រើសរើសឆ្នាំសិក្សា',

      setAcademicYear: (id, name) =>
        set({
          selectedYearId: id,
          selectedYearName: name,
        }),

      resetAcademicYear: () =>
        set({
          selectedYearId: null,
          selectedYearName: 'ជ្រើសរើសឆ្នាំសិក្សា',
        }),
    }),
    {
      name: 'academic-year-storage',
      storage: createJSONStorage(() => localStorage),
    },
  ),
)
