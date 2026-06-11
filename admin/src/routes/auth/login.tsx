import { useTitle } from '@/hooks/useTitle'
import { signIn } from '@/lib/auth-client'
import { Button, Flex, Spinner, Text, TextField } from '@radix-ui/themes'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import toast from 'react-hot-toast'
import Logo from '@/assets/au.webp'

export const Route = createFileRoute('/auth/login')({
  component: Login,
})

function Login() {
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()

    if (!email || !password) {
      setErrorMessage('សូមបញ្ចូល Email និង Password!')
      return
    }

    setLoading(true)
    setErrorMessage('')

    try {
      const { error } = await signIn.email({
        email,
        password,
        callbackURL: '/admin/dashboard',
      })

      if (error) {
        if (
          error.status === 401 ||
          error.code === 'INVALID_CREDENTIALS' ||
          error.code === 'INVALID_EMAIL_OR_PASSWORD'
        ) {
          setErrorMessage('Email ឬ Password មិនត្រឹមត្រូវទេ!')
        } else {
          setErrorMessage(error.message || 'មានបញ្ហាក្នុងការចូលប្រើប្រាស់')
        }
      } else {
        toast.success('ចូលប្រើប្រាស់ជោគជ័យ')
        navigate({ to: '/admin/dashboard' })
      }
    } catch (err) {
      setErrorMessage('មិនអាចភ្ជាប់ទៅកាន់ Server បានទេ!')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useTitle('Login')

  return (
    <>
      <Flex direction="column" align="center" justify="center" mb="5" gap="2">
        <img
          src={Logo}
          alt="App Logo"
          className="h-[110px] w-auto object-contain"
        />

        <Text size="6" weight="bold" color="indigo">
          Login
        </Text>
      </Flex>

      <form onSubmit={handleLogin}>
        <Flex direction="column" gap="3">
          <label>
            <Text as="div" size="2" mb="1" weight="bold">
              Email
            </Text>
            <TextField.Root
              type="email"
              required
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>

          <label>
            <Text as="div" size="2" mb="1" weight="bold">
              Password
            </Text>
            <TextField.Root
              type="password"
              required
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>

          <Flex justify="between" align="center">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                className="rounded border-gray-300 text-blue-600 cursor-pointer focus:ring-blue-500"
              />
              <Text size="2" color="gray">
                Remember me
              </Text>
            </label>
            <Text
              size="2"
              className="text-blue-600 hover:underline cursor-pointer transition-colors"
            >
              Forgot password?
            </Text>
          </Flex>

          {errorMessage && (
            <Text
              size="2"
              color="red"
              align="center"
              className="bg-red-50 p-2 rounded-md"
            >
              {errorMessage}
            </Text>
          )}

          <Button
            type="submit"
            disabled={loading}
            color="indigo"
            variant="solid"
            size="3"
            className="w-full cursor-pointer disabled:cursor-not-allowed"
          >
            {loading ? <Spinner size="2" /> : 'Login'}
          </Button>
        </Flex>
      </form>

      <Flex justify="center" align="center" mt="4" gap="2">
        <Text size="2">បើសិនអ្នកអត់មានគណនីទេ? ទាក់ទងមកកាន់</Text>
        <a
          className="text-indigo-600 font-medium hover:underline text-[14px]"
          href="https://www.facebook.com/AngkorUniversity"
          target="_blank"
          rel="noopener noreferrer"
        >
          Angkor University
        </a>
      </Flex>
      {/* <Flex justify="center" align="center" mt="4" gap="2">
        <Text size="2">Don't have an account?</Text>
        <Link
          className="text-indigo-600 font-medium hover:underline text-[14px]"
          to="/auth/register"
        >
          Signup
        </Link>
      </Flex> */}
    </>
  )
}
