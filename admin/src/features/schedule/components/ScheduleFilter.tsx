import { Box, Button, Flex, Select, Text, TextField } from '@radix-ui/themes'
import { IoFilter, IoSearch } from 'react-icons/io5'
import { useMemo } from 'react'

interface ScheduleFilterProps {
  draft: any
  setDraft: (val: any) => void
  faculties: Array<any>
  departments: Array<any>
  academicLevels: Array<any>
  handleApplyFilter: () => void
  handleClearFilter: () => void
}

export function ScheduleFilter({
  draft,
  setDraft,
  faculties,
  departments,
  academicLevels,
  handleApplyFilter,
  handleClearFilter,
}: ScheduleFilterProps) {
  const filteredDepartments = useMemo(() => {
    if (draft.facultyId === 'all') return []
    return departments.filter(
      (d: any) => String(d.facultyId) === draft.facultyId,
    )
  }, [departments, draft.facultyId])

  return (
    <Flex justify="between" align="center" mb="4">
      <Box flexGrow="1" maxWidth="300px">
        <Text as="div" size="2" mb="1" weight="bold">
          ស្វែងរក
        </Text>
        <TextField.Root
          placeholder="ស្វែងរក..."
          value={draft.name}
          onChange={(e) => setDraft({ ...draft, name: e.target.value })}
          onKeyDown={(e) => e.key === 'Enter' && handleApplyFilter()}
        >
          <TextField.Slot>
            <IoSearch />
          </TextField.Slot>
        </TextField.Root>
      </Box>

      <Flex gap="2" wrap="wrap" align="end">
        <Box>
          <Text as="div" size="2" mb="1" weight="bold">
            កម្រិតសិក្សា
          </Text>
          <Select.Root
            value={draft.academicLevelId}
            onValueChange={(val) =>
              setDraft({ ...draft, academicLevelId: val })
            }
          >
            <Select.Trigger style={{ minWidth: '150px' }} />
            <Select.Content>
              <Select.Item value="all">ទាំងអស់</Select.Item>
              {academicLevels.map((level: any) => (
                <Select.Item key={level.id} value={String(level.id)}>
                  {level.level}
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Root>
        </Box>

        <Box>
          <Text as="div" size="2" mb="1" weight="bold">
            មហាវិទ្យាល័យ
          </Text>
          <Select.Root
            value={draft.facultyId}
            onValueChange={(val) => {
              setDraft({ ...draft, facultyId: val, departmentId: 'all' })
            }}
          >
            <Select.Trigger style={{ minWidth: '150px' }} />
            <Select.Content>
              <Select.Item value="all">ទាំងអស់</Select.Item>
              {faculties.map((f: any) => (
                <Select.Item key={f.id} value={String(f.id)}>
                  {f.name}
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Root>
        </Box>

        <Box>
          <Text as="div" size="2" mb="1" weight="bold">
            ដេប៉ាតឺម៉ង់
          </Text>
          <Select.Root
            value={draft.departmentId}
            onValueChange={(val) => setDraft({ ...draft, departmentId: val })}
            disabled={draft.facultyId === 'all'}
          >
            <Select.Trigger style={{ minWidth: '150px' }} />
            <Select.Content>
              <Select.Item value="all">ទាំងអស់</Select.Item>
              {filteredDepartments.map((d: any) => (
                <Select.Item key={d.id} value={String(d.id)}>
                  {d.name}
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Root>
        </Box>

        <Button
          onClick={handleApplyFilter}
          color="indigo"
          style={{ cursor: 'pointer' }}
        >
          <IoFilter /> ស្វែងរក
        </Button>
        <Button
          variant="soft"
          color="gray"
          onClick={handleClearFilter}
          style={{ cursor: 'pointer' }}
        >
          សម្អាត
        </Button>
      </Flex>
    </Flex>
  )
}
