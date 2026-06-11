import {
  Button,
  Dialog,
  Flex,
  IconButton,
  Select,
  Text,
  TextField,
} from '@radix-ui/themes'
import { FaRegEdit } from 'react-icons/fa'
import { Controller, useForm } from 'react-hook-form'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import toast from 'react-hot-toast'
import { useEffect, useState } from 'react'
import type { DepartmentsType, FacultiesType } from '@/types'
import { getFaculties } from '@/api/FacultyAPI'
import { updateDepartments } from '@/api/DepartmentAPI'

interface Props {
  data: DepartmentsType
}

const DepartmentUpdate = ({ data }: Props) => {
  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DepartmentsType>({
    defaultValues: {
      name: data.name,
      description: data?.description,
      facultyId: data.facultyId,
    },
  })

  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)

  const { data: faculties } = useQuery<FacultiesType[]>({
    queryKey: ['faculties'],
    queryFn: getFaculties,
  })
  const mutation = useMutation({
    mutationFn: (formData: DepartmentsType) =>
      updateDepartments(Number(data.id), formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] })
      setOpen(false)
      toast.success('កែប្រែជោគជ័យ')
      setOpen(false)
      reset()
    },
    onError: () => {
      toast.error('កែប្រែមិនជោគជ័យ')
    },
  })

  const onSubmit = (formData: DepartmentsType) => {
    mutation.mutate(formData)
  }

  useEffect(() => {
    if (open) {
      reset({
        name: data.name,
        description: data?.description,
        facultyId: data.facultyId,
      })
    }
  }, [open, data, reset])

  return (
    <>
      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Trigger>
          <IconButton
            size="1"
            color="blue"
            variant="surface"
            style={{ cursor: 'pointer' }}
          >
            <FaRegEdit />
          </IconButton>
        </Dialog.Trigger>

        <Dialog.Content maxWidth="450px">
          <Dialog.Title>កែប្រែ</Dialog.Title>

          <form onSubmit={handleSubmit(onSubmit)}>
            <Flex direction="column" gap="3">
              <label>
                <Text as="div" size="2" mb="1" weight="bold">
                  ដេប៉ាតេម៉ង់
                </Text>
                <TextField.Root
                  {...register('name', { required: 'Name is required' })}
                  placeholder="Enter department name"
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
                  render={({ field }) => (
                    <Select.Root
                      value={field.value?.toString() ?? ''}
                      onValueChange={(val) => field.onChange(Number(val))}
                    >
                      <Select.Trigger
                        placeholder="ដេប៉ាតេម៉ង់"
                        style={{ width: '100%' }}
                      />
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
    </>
  )
}

export default DepartmentUpdate
