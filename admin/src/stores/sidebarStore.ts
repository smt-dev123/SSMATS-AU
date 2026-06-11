import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface SidebarState {
  // Desktop sidebar collapse state
  isDesktopOpen: boolean
  // Mobile sidebar open state
  isMobileOpen: boolean
  // Actions
  toggleDesktopSidebar: () => void
  setDesktopSidebar: (open: boolean) => void
  toggleMobileSidebar: () => void
  setMobileSidebar: (open: boolean) => void
}

export const useSidebarStore = create<SidebarState>()(
  persist(
    (set) => ({
      isDesktopOpen: true,
      isMobileOpen: false,

      toggleDesktopSidebar: () =>
        set((state) => ({ isDesktopOpen: !state.isDesktopOpen })),

      setDesktopSidebar: (open: boolean) => set({ isDesktopOpen: open }),

      toggleMobileSidebar: () =>
        set((state) => ({ isMobileOpen: !state.isMobileOpen })),

      setMobileSidebar: (open: boolean) => set({ isMobileOpen: open }),
    }),
    {
      name: 'sidebar-storage', // key in localStorage
      // Only persist desktop sidebar state, not mobile
      partialize: (state) => ({ isDesktopOpen: state.isDesktopOpen }),
    },
  ),
)
