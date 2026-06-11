import { useTeacherStore } from '@/stores/Teachers'
import { createFileRoute } from '@tanstack/react-router'
import { useEffect } from 'react'

export const Route = createFileRoute('/admin/teacher/$teacherId')({
  component: RouteComponent,
})

function RouteComponent() {
  const Id = Route.useParams().teacherId
  const { teacher, fetchOneTeacher, loading, error } = useTeacherStore()

  useEffect(() => {
    fetchOneTeacher(Number(Id))
  }, [fetchOneTeacher, Id])

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error.join(', ')}</div>
  return <div>Hello {teacher?.name}</div>
}
