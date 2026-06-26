import { Avatar, DropdownMenu } from '@radix-ui/themes'
import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { RiMenu2Line } from 'react-icons/ri'
import Language from './ui/Language'
import DarkMode from './ui/DarkMode'
import { Notifications } from './ui/Notifications'
import Expand from './ui/Expand'
import { useSidebarStore } from '@/stores/sidebarStore'
import { useAuth } from '@/stores/auth'

const Navbar = () => {
  const { toggleMobileSidebar, toggleDesktopSidebar } = useSidebarStore()
  const { user, logout } = useAuth()

  const { t } = useTranslation()

  // Handle menu button click based on screen size
  const handleMenuClick = () => {
    // Check if we're on mobile or desktop
    const isMobile = window.innerWidth < 768 // md breakpoint

    if (isMobile) {
      toggleMobileSidebar()
    } else {
      toggleDesktopSidebar()
    }
  }

  return (
    <header className="flex justify-between items-center bg-white dark:bg-gray-900 px-4 min-h-16 shadow-sm">
      <div className="flex gap-2">
        {/* Single menu button for both mobile and desktop */}
        <button
          onClick={handleMenuClick}
          className="text-2xl text-gray-600 dark:text-gray-200 dark:hover:text-gray-400 hover:text-gray-800 cursor-pointer transition-all"
          aria-label="Toggle menu"
        >
          <RiMenu2Line />
        </button>

        {/* Name */}
        <h2 className="hidden min-[480px]:block font-khmer text-lg font-medium text-gray-800 dark:text-white">
          {t('Navbar.hello')}
          {', '}
          <b className="font-semibold text-gray-900 dark:text-white">
            {user?.name || 'User'}
          </b>
        </h2>
      </div>

      <div className="flex gap-4 items-center justify-center">
        {/* Language */}
        <Language />

        {/* Expand */}
        <Expand />

        {/* Dark Mode */}
        <DarkMode />

        {/* Notificatoins */}
        <Notifications />

        {/* User */}
        <DropdownMenu.Root>
          <DropdownMenu.Trigger>
            <button className="outline-none focus:outline-none border-none bg-transparent cursor-pointer rounded-full hover:opacity-80 transition-opacity">
              <Avatar
                size="2"
                src={
                  user?.image ||
                  'https://ui-avatars.com/api/?name=' +
                    encodeURIComponent(user?.name || 'User')
                }
                fallback={user?.name?.[0]?.toUpperCase() || 'U'}
                radius="full"
              />
            </button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Content>
            <DropdownMenu.Item>
              <Link to="/admin/setting">ការកំណត់</Link>
            </DropdownMenu.Item>
            <DropdownMenu.Item
              onClick={logout}
              style={{ color: 'red', cursor: 'pointer' }}
            >
              ចាកចេញ
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Root>
      </div>
    </header>
  )
}

export default Navbar
