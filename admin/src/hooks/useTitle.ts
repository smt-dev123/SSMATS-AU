import { useEffect } from 'react'

export function useTitle(title: string) {
  useEffect(() => {
    const previousTitle = document.title
    document.title = title + ' - AU Schedule & Students Attendance Management'

    return () => {
      document.title = previousTitle
    }
  }, [title])
}
