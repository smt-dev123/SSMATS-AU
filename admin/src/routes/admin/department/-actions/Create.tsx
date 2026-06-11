import { useState } from 'react'
import { Button, Dialog, Flex, Select, Text, TextField } from '@radix-ui/themes'
import { Controller, useForm } from 'react-hook-form'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import type { DepartmentsType, FacultiesType } from '@/types'
import { createDepartments } from '@/api/DepartmentAPI'
import { getFaculties } from '@/api/FacultyAPI'

const DepartmentCreate = () => {
  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DepartmentsType>()
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)

  const { data: faculties } = useQuery<FacultiesType[]>({
    queryKey: ['faculties'],
    queryFn: getFaculties,
  })
  const mutation = useMutation({
    mutationFn: (formData: DepartmentsType) => createDepartments(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] })
      toast.success('បង្កើតជោគជ័យ')
      setOpen(false)
      reset()
    },
    onError: () => {
      toast.error('បង្កើតមិនជោគជ័យ')
    },
  })

  const onSubmit = (formData: DepartmentsType) => {
    mutation.mutate(formData)
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger>
        <Button variant="solid" style={{ cursor: 'pointer' }}>
          បន្ថែមដេប៉ាតេម៉ង់
        </Button>
      </Dialog.Trigger>

      <Dialog.Content maxWidth="450px">
        <Dialog.Title>បន្ថែមដេប៉ាតេម៉ង់</Dialog.Title>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Flex direction="column" gap="3">
            <label>
              <Text as="div" size="2" mb="1" weight="bold">
                ដេប៉ាតេម៉ង់
              </Text>
              <TextField.Root
                {...register('name', {
                  required: 'សូមបញ្ចូលឈ្មោះដេប៉ាតេម៉ង់',
                })}
                placeholder="សូមបញ្ចូលឈ្មោះដេប៉ាតេម៉ង់"
              />
              {errors.name && (
                <Text size="2" color="red">
                  {errors.name.message}
                </Text>
              )}
            </label>

            <label>
              <Text as="div" size="2" mb="1" weight="bold">
                មហាវិទ្យាល័យ
              </Text>
              <Controller
                name="facultyId"
                control={control}
                rules={{
                  required: 'សូមជ្រើសរើសមហាវិទ្យាល័យ',
                }}
                render={({ field }) => (
                  <Select.Root
                    defaultValue={field.value?.toString() ?? ''}
                    onValueChange={(val) => field.onChange(Number(val))}
                  >
                    <Select.Trigger
                      placeholder="សូមជ្រើសរើសមហាវិទ្យាល័យ"
                      style={{ width: '100%' }}
                    />
                    {errors.facultyId && (
                      <Text size="2" color="red">
                        {errors.facultyId.message}
                      </Text>
                    )}
                    <Select.Content>
                      {faculties?.map((faculty) => (
                        <Select.Item
                          value={String(faculty.id)}
                          key={faculty.id}
                        >
                          {faculty.name}
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select.Root>
                )}
              />
            </label>
          </Flex>

          <Flex gap="3" mt="4" justify="end">
            <Dialog.Close>
              <Button variant="soft" color="gray">
                ចាកចេញ
              </Button>
            </Dialog.Close>
            <Button type="submit">រក្សាទុក</Button>
          </Flex>
        </form>
      </Dialog.Content>
    </Dialog.Root>
  )
}

export default DepartmentCreate
