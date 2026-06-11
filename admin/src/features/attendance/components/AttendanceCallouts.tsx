import { Callout } from '@radix-ui/themes'
import { FaInfoCircle } from 'react-icons/fa'

interface AttendanceCalloutsProps {
  hasActiveStudents: boolean
  accessReason?: string
}

export const AttendanceCallouts = ({
  hasActiveStudents,
  accessReason,
}: AttendanceCalloutsProps) => {
  if (accessReason) {
    return (
      <Callout.Root color="red" variant="soft">
        <Callout.Icon>
          <FaInfoCircle />
        </Callout.Icon>
        <Callout.Text>ចំណាំ៖ {accessReason}</Callout.Text>
      </Callout.Root>
    )
  }

  return (
    <>
      {hasActiveStudents ? (
        <Callout.Root color="red" variant="soft">
          <Callout.Icon>
            <FaInfoCircle />
          </Callout.Icon>
          <Callout.Text>
            ចំណាំ៖ លោកគ្រូ/អ្នកគ្រូ
            មិនអាចស្រង់វត្តមាននិស្សិតក្រៅពីម៉ោងសិក្សាជាផ្លូវការ
            ឬក្រោយម៉ោងសិក្សាជាផ្លូវការ ១៥នាទីបានទេ។
          </Callout.Text>
        </Callout.Root>
      ) : (
        <Callout.Root color="red" variant="soft">
          <Callout.Icon>
            <FaInfoCircle />
          </Callout.Icon>
          <Callout.Text>
            មិនមាននិស្សិតដែលមានសិទ្ធិស្រង់វត្តមានក្នុងបញ្ជីនេះទេ។
          </Callout.Text>
        </Callout.Root>
      )}
    </>
  )
}
