import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'

export const useTableMutation = (queryKey: string[], mutationFn: any) => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey })
            toast.success('ប្រតិបត្តិការជោគជ័យ')
        },
        onError: () => {
            toast.error('ប្រតិបត្តិការបរាជ័យ')
        },
    })
}