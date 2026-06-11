import { useTitle } from '@/hooks/useTitle'
import { Box, Card, Flex, Tabs, Text } from '@radix-ui/themes'
import { createFileRoute } from '@tanstack/react-router'
import { useAuth } from '@/stores/auth'
import { useForm } from 'react-hook-form'
import { authClient } from '@/lib/auth-client'
import toast from 'react-hot-toast'
import { useEffect, useState, useRef } from 'react'
import api from '@/lib/axios'
import { SecurityTab } from './-tabs/SecurityTab'
import { BackupTab } from './-tabs/BackupTab'
import { AccountTab } from './-tabs/AccountTab'

export const Route = createFileRoute('/admin/setting/')({
  component: RouteComponent,
})

function RouteComponent() {
  useTitle('ការកំណត់ (Settings)')
  const { user } = useAuth()

  // Profile Form
  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    reset: resetProfile,
    formState: { errors: profileErrors },
  } = useForm({
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      address: '',
    },
  })

  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false)

  useEffect(() => {
    if (user) {
      resetProfile({
        name: user.name,
        email: user.email,
        phone: (user as any).phone || '',
        address: (user as any).address || '',
      })
    }
  }, [user, resetProfile])

  const onSubmitProfile = async (data: any) => {
    setIsUpdatingProfile(true)
    try {
      const { error } = await authClient.updateUser({
        name: data.name,
        phone: data.phone,
        address: data.address,
      })
      if (error) {
        toast.error(error.message || 'បរាជ័យក្នុងការធ្វើបច្ចុប្បន្នភាព')
      } else {
        toast.success('ធ្វើបច្ចុប្បន្នភាពដោយជោគជ័យ')
      }
    } catch (e: any) {
      toast.error('មានបញ្ហាក្នុងការធ្វើបច្ចុប្បន្នភាព')
    } finally {
      setIsUpdatingProfile(false)
    }
  }

  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 2 * 1024 * 1024) {
      toast.error('ទំហំរូបភាពត្រូវតែតូចជាង 2MB')
      return
    }

    const formData = new FormData()
    formData.append('file', file)

    setIsUploadingImage(true)
    try {
      const res = await api.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      if (res.data?.success) {
        let url = res.data.data.url
        const baseUrl = import.meta.env.VITE_API_BASE_URL
        if (baseUrl) {
          url = baseUrl.replace('/api', '') + url
        }

        const { error } = await authClient.updateUser({ image: url })
        if (error) {
          toast.error(error.message || 'បរាជ័យក្នុងការប្តូររូបភាព')
        } else {
          toast.success('ប្តូររូបភាពបានជោគជ័យ')
        }
      }
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || 'មានបញ្ហាក្នុងការ Upload រូបភាព',
      )
    } finally {
      setIsUploadingImage(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  // Password Form
  const {
    register: registerPwd,
    handleSubmit: handlePwdSubmit,
    reset: resetPwd,
    formState: { errors: pwdErrors },
    watch,
  } = useForm({
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  })

  const [isUpdatingPwd, setIsUpdatingPwd] = useState(false)
  const newPassword = watch('newPassword')

  const onSubmitPwd = async (data: any) => {
    setIsUpdatingPwd(true)
    try {
      const { error } = await authClient.changePassword({
        newPassword: data.newPassword,
        currentPassword: data.currentPassword,
        revokeOtherSessions: true,
      })
      if (error) {
        toast.error(error.message || 'បរាជ័យក្នុងការប្តូរលេខសម្ងាត់')
      } else {
        toast.success('ប្តូរលេខសម្ងាត់បានជោគជ័យ')
        resetPwd()
      }
    } catch (e: any) {
      toast.error('មានបញ្ហាក្នុងការប្តូរលេខសម្ងាត់')
    } finally {
      setIsUpdatingPwd(false)
    }
  }

  return (
    <Card size="3">
      <Flex justify="between" align="center" mb="5">
        <Box>
          <Text as="div" size="6" weight="bold">
            ការកំណត់ (Settings)
          </Text>
          <Text as="div" size="2" color="gray">
            គ្រប់គ្រងគណនី និងការកំណត់ប្រព័ន្ធរបស់អ្នកនៅទីនេះ
          </Text>
        </Box>
      </Flex>

      <Tabs.Root defaultValue="account">
        <Tabs.List size="2">
          <Tabs.Trigger value="account">គណនី (Account)</Tabs.Trigger>
          <Tabs.Trigger value="security">សុវត្ថិភាព (Security)</Tabs.Trigger>
          {['admin', 'manager'].includes((user as any)?.role) && (
            <Tabs.Trigger value="backup">ការចម្លងទុក (Backup)</Tabs.Trigger>
          )}
        </Tabs.List>

        <Box pt="4">
          <Tabs.Content value="account">
            <AccountTab
              user={user}
              register={registerProfile}
              errors={profileErrors}
              onSubmit={handleProfileSubmit(onSubmitProfile)}
              isUpdating={isUpdatingProfile}
              isUploading={isUploadingImage}
              fileInputRef={fileInputRef}
              onFileChange={handleFileChange}
            />
          </Tabs.Content>

          <Tabs.Content value="security">
            <SecurityTab
              register={registerPwd}
              errors={pwdErrors}
              onSubmit={handlePwdSubmit(onSubmitPwd)}
              isUpdating={isUpdatingPwd}
              newPasswordValue={newPassword}
            />
          </Tabs.Content>

          {['admin', 'manager'].includes((user as any)?.role) && (
            <Tabs.Content value="backup">
              <BackupTab />
            </Tabs.Content>
          )}
        </Box>
      </Tabs.Root>
    </Card>
  )
}
