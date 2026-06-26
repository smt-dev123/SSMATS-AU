import { Box, Grid, IconButton } from '@radix-ui/themes'
import { useWatch } from 'react-hook-form'
import { FaTrash } from 'react-icons/fa'
import { FormInput, FormSelect } from '@/components/ui/forms/Input'

export const CourseItem = ({
  index,
  register,
  control,
  remove,
  teachers,
  isDisableRemove,
  errors,
}: any) => {
  const allCourses = useWatch({
    control,
    name: 'courses',
  })

  const courseErrors = errors?.courses?.[index]

  const selectedDays = allCourses
    ?.map((c: any) => c?.day)
    .filter((day: any) => day !== undefined && day !== null)

  const currentCourseName = allCourses?.[index]?.name?.trim().toLowerCase()

  const disabledTeachers = allCourses
    ?.filter((c: any, i: number) => {
      if (i === index) return false
      if (!c?.teacherId) return false

      const otherCourseName = c?.name?.trim().toLowerCase()

      // Allow selecting the same teacher if the subject name is exactly the same (meaning multiple days a week)
      if (currentCourseName && otherCourseName === currentCourseName) {
        return false
      }

      // Otherwise, the teacher is teaching a different subject, so disable them
      return true
    })
    .map((c: any) => String(c?.teacherId))
    .filter((id: any) => id !== 'undefined' && id !== 'null')

  return (
    <Box className="p-4 border border-slate-200 rounded-2xl bg-white shadow-sm hover:border-blue-400 transition-all group">
      <Grid
        columns={{ initial: '1', md: '5' }}
        gap="3"
        align="start"
        justify="start"
      >
        <Box className="md:col-span-1">
          <FormInput
            label="មុខវិជ្ជា"
            name={`courses.${index}.name`}
            register={register}
            rules={{ required: 'សូមបញ្ចូលឈ្មោះមុខវិជ្ជា' }}
            error={courseErrors?.name}
            isRequired={true}
          />
        </Box>

        <Box>
          <FormInput
            label="កូដ"
            name={`courses.${index}.code`}
            register={register}
            rules={{ required: 'សូមបញ្ចូលកូដ' }}
            error={courseErrors?.code}
            isRequired={true}
          />
        </Box>

        <Box>
          <FormSelect
            label="ថ្ងៃ"
            name={`courses.${index}.day`}
            control={control}
            disabledOptions={selectedDays}
            options={[
              { id: 'Monday', name: 'ច័ន្ទ' },
              { id: 'Tuesday', name: 'អង្គារ' },
              { id: 'Wednesday', name: 'ពុធ' },
              { id: 'Thursday', name: 'ព្រហស្បតិ៍' },
              { id: 'Friday', name: 'សុក្រ' },
              { id: 'Saturday', name: 'សៅរ៍' },
              { id: 'Sunday', name: 'អាទិត្យ' },
            ]}
            error={courseErrors?.day}
            isRequired={true}
          />
        </Box>

        <Box>
          <FormSelect
            label="គ្រូបង្រៀន"
            name={`courses.${index}.teacherId`}
            control={control}
            disabledOptions={disabledTeachers}
            options={teachers}
            error={courseErrors?.teacherId}
            isRequired={true}
          />
        </Box>
        <Box>
          <FormInput
            label="ចំនួនម៉ោង"
            name={`courses.${index}.hours`}
            register={register}
            rules={{ required: 'សូមបញ្ចូលចំនួនម៉ោង' }}
            error={courseErrors?.hours}
            isRequired={true}
          />
        </Box>
        <Box>
          <IconButton
            variant="soft"
            color="red"
            type="button"
            onClick={() => remove(index)}
            disabled={isDisableRemove}
            className="cursor-pointer mb-[2px]"
          >
            <FaTrash />
          </IconButton>
        </Box>
      </Grid>
    </Box>
  )
}
