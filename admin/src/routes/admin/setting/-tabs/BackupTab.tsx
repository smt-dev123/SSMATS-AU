import {
  Box,
  Button,
  Card,
  Flex,
  Select,
  Separator,
  Switch,
  Text,
  AlertDialog,
} from '@radix-ui/themes'
import toast from 'react-hot-toast'
import api from '@/lib/axios'
import { useRef, useState } from 'react'

export function BackupTab() {
  const [isBackingUp, setIsBackingUp] = useState(false)
  const [isRestoring, setIsRestoring] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleBackup = async () => {
    setIsBackingUp(true)
    try {
      const response = await api.get('/maintenance/backup', {
        responseType: 'blob',
      })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      const date = new Date().toISOString().split('T')[0]
      link.setAttribute('download', `backup-${date}.sql`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      toast.success('ការចម្លងទុកបានជោគជ័យ')
    } catch (error) {
      console.error(error)
      toast.error('ការចម្លងទុកមិនបានជោគជ័យ')
    } finally {
      setIsBackingUp(false)
    }
  }

  const handleRestore = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsRestoring(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      await api.post('/maintenance/restore', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      toast.success('ការស្ដារទិន្នន័យបានជោគជ័យ')
      window.location.reload()
    } catch (error) {
      console.error(error)
      toast.error('ការស្ដារទិន្នន័យមិនបានជោគជ័យ')
    } finally {
      setIsRestoring(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  return (
    <Flex direction="column" gap="5">
      <Box>
        <Text size="4" weight="bold">
          ការចម្លងទុកទិន្នន័យ (Backup & Restore)
        </Text>
        <Text size="2" color="gray">
          គ្រប់គ្រងសុវត្ថិភាពទិន្នន័យប្រព័ន្ធរបស់អ្នក
        </Text>
      </Box>

      <Card variant="surface">
        <Flex justify="between" align="center">
          <Box>
            <Text as="div" size="3" weight="bold">
              Auto Backup
            </Text>
            <Text as="div" size="2" color="gray">
              ដំណើរការការចម្លងទុកដោយស្វ័យប្រវត្តិទៅកាន់ Cloud Storage
            </Text>
          </Box>
          <Switch defaultChecked size="3" color="green" />
        </Flex>
      </Card>

      <Flex gap="4" direction={{ initial: 'column', sm: 'row' }}>
        <Box className="grow">
          <Text as="div" size="2" mb="1" weight="bold">
            ភាពញឹកញាប់ (Frequency)
          </Text>
          <Select.Root defaultValue="daily">
            <Select.Trigger className="w-full" />
            <Select.Content>
              <Select.Item value="hourly">រាល់ម៉ោង</Select.Item>
              <Select.Item value="daily">រៀងរាល់ថ្ងៃ</Select.Item>
              <Select.Item value="weekly">រៀងរាល់សប្តាហ៍</Select.Item>
            </Select.Content>
          </Select.Root>
        </Box>
        <Box className="grow">
          <Text as="div" size="2" mb="1" weight="bold">
            រក្សាទុកក្នុងរយៈពេល (Retention)
          </Text>
          <Select.Root defaultValue="30">
            <Select.Trigger className="w-full" />
            <Select.Content>
              <Select.Item value="7">៧ ថ្ងៃ</Select.Item>
              <Select.Item value="30">៣០ ថ្ងៃ</Select.Item>
              <Select.Item value="always">រហូតដល់លុបដោយផ្ទាល់</Select.Item>
            </Select.Content>
          </Select.Root>
        </Box>
      </Flex>

      <Separator size="4" />

      <Box>
        <Text size="3" weight="bold" mb="2" as="div">
          សកម្មភាពបន្ទាប់បន្សំ
        </Text>
        <Flex gap="3" direction={{ initial: 'column', sm: 'row' }}>
          <Button
            variant="soft"
            color="gray"
            onClick={handleBackup}
            loading={isBackingUp}
          >
            ទាញយក Database ឥឡូវនេះ (.sql)
          </Button>

          <input
            type="file"
            accept=".sql"
            ref={fileInputRef}
            onChange={handleRestore}
            style={{ display: 'none' }}
          />

          <AlertDialog.Root>
            <AlertDialog.Trigger>
              <Button variant="soft" color="red" loading={isRestoring}>
                ស្ដារទិន្នន័យ (Restore)
              </Button>
            </AlertDialog.Trigger>
            <AlertDialog.Content maxWidth="450px">
              <AlertDialog.Title>បញ្ជាក់ការស្ដារទិន្នន័យ</AlertDialog.Title>
              <AlertDialog.Description size="2">
                តើអ្នកប្រាកដថាចង់ស្ដារទិន្នន័យមែនទេ?
                ទិន្នន័យបច្ចុប្បន្នទាំងអស់នឹងត្រូវបានជំនួសដោយទិន្នន័យពី File
                ដែលអ្នកជ្រើសរើស។ សកម្មភាពនេះមិនអាចត្រឡប់ក្រោយបានទេ។
              </AlertDialog.Description>

              <Flex gap="3" mt="4" justify="end">
                <AlertDialog.Cancel>
                  <Button variant="soft" color="gray">
                    បោះបង់
                  </Button>
                </AlertDialog.Cancel>
                <AlertDialog.Action>
                  <Button
                    variant="solid"
                    color="red"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    យល់ព្រម និងជ្រើសរើស File
                  </Button>
                </AlertDialog.Action>
              </Flex>
            </AlertDialog.Content>
          </AlertDialog.Root>

          <Button
            variant="soft"
            color="orange"
            onClick={() => toast('មុខងារនេះនឹងមាននៅពេលក្រោយ')}
          >
            ផ្ទេរទិន្នន័យទៅ Google Drive
          </Button>
        </Flex>
      </Box>
    </Flex>
  )
}
