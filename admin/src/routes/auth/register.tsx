import { useTitle } from '@/hooks/useTitle'
import { signUp } from '@/lib/auth-client'
import { Button, Flex, Spinner, Text, TextField } from '@radix-ui/themes'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import toast from 'react-hot-toast'
import Logo from '@/assets/au.webp'

export const Route = createFileRoute('/auth/register')({
  component: Register,
})

function Register() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })

  useTitle('Register')

  const handleRegister = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()

    const { name, email, password, confirmPassword } = formData

    if (!name || !email || !password) {
      toast.error('សូមបំពេញព័ត៌មានឱ្យបានគ្រប់គ្រាន់')
      return
    }

    if (password !== confirmPassword) {
      toast.error('Password ទាំងពីរមិនដូចគ្នាទេ!')
      return
    }

    if (password.length < 6) {
      toast.error('Password ត្រូវមានយ៉ាងតិច ៦ ខ្ទង់')
      return
    }

    setLoading(true)

    try {
      const { error } = await signUp.email({
        name,
        email,
        password,
        callbackURL: '/auth/login',
      })

      if (error) {
        toast.error(error.message || 'ចុះឈ្មោះមិនបានជោគជ័យ')
      } else {
        toast.success('ចុះឈ្មោះបានជោគជ័យ! សូមចូលប្រើប្រាស់')
        navigate({ to: '/auth/login' })
      }
    } catch (err) {
      toast.error('មានបញ្ហាបច្ចេកទេស សូមព្យាយាមម្ដងទៀត')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: string,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }))
  }

  return (
    <>
      <Flex direction="column" align="center" justify="center" mb="5" gap="2">
        <img
          src={Logo}
          alt="App Logo"
          className="h-[110px] w-auto object-contain"
        />
        <Text size="6" weight="bold" color="indigo">
          Register
        </Text>
      </Flex>

      <form onSubmit={handleRegister}>
        <Flex direction="column" gap="3">
          <label>
            <Text as="div" size="2" mb="1" weight="bold">
              Name
            </Text>
            <TextField.Root
              placeholder="Enter your full name"
              required
              value={formData.name}
              onChange={(e) => handleChange(e, 'name')}
            />
          </label>

          <label>
            <Text as="div" size="2" mb="1" weight="bold">
              Email
            </Text>
            <TextField.Root
              type="email"
              placeholder="Enter your email"
              required
              value={formData.email}
              onChange={(e) => handleChange(e, 'email')}
            />
          </label>

          <label>
            <Text as="div" size="2" mb="1" weight="bold">
              Password
            </Text>
            <TextField.Root
              type="password"
              placeholder="Enter your password"
              required
              value={formData.password}
              onChange={(e) => handleChange(e, 'password')}
            />
          </label>

          <label>
            <Text as="div" size="2" mb="1" weight="bold">
              Confirm Password
            </Text>
            <TextField.Root
              type="password"
              placeholder="Confirm your password"
              required
              value={formData.confirmPassword}
              onChange={(e) => handleChange(e, 'confirmPassword')}
            />
          </label>

          <Button
            type="submit"
            disabled={loading}
            color="indigo"
            variant="solid"
            size="3"
            className="w-full cursor-pointer disabled:cursor-not-allowed"
          >
            {loading ? <Spinner size="2" /> : 'Register'}
          </Button>
        </Flex>
      </form>

      <Flex justify="center" align="center" mt="4" gap="2">
        <Text size="2">Already have an account?</Text>
        <Link
          className="text-indigo-600 font-medium hover:underline text-[14px]"
          to="/auth/login"
        >
          Signin
        </Link>
      </Flex>
    </>
  )
}
