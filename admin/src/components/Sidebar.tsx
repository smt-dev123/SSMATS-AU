import { useEffect } from 'react'
import * as Collapsible from '@radix-ui/react-collapsible'
import * as Dialog from '@radix-ui/react-dialog'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import {
  RiDashboardLine,
  RiSettings3Line,
  RiSchoolLine,
  RiArrowDownSLine,
  RiArrowRightSLine,
  RiCalendarEventLine,
  RiNotification2Line,
  RiUser3Line,
} from 'react-icons/ri'
import { useTranslation } from 'react-i18next'
import { LiaChalkboardTeacherSolid } from 'react-icons/lia'
import { AiOutlineSchedule } from 'react-icons/ai'
import { PiStudent } from 'react-icons/pi'
import { Link } from '@tanstack/react-router'
import { useSessionContext } from '@/providers/AuthProvider'
import { useSidebarStore } from '@/stores/sidebarStore'
import { useAcademicYears } from '@/hooks/useAcademicYears'
import type { AcademicYearsType } from '@/types'
import { useAcademicStore } from '@/stores/useAcademicStore'
import LogoDestop from '@/assets/au-logo.webp'
import LogoMobile from '@/assets/au.webp'
import menuPermissions from '@/utils/permission'

interface MenuItem {
  key: string
  icon?: any
  label: string
  url?: string
  children?: MenuItem[]
}

type SidebarProps = {
  mobileOpen?: boolean
  onMobileOpenChange?: (open: boolean) => void
}

export default function Sidebar({
  mobileOpen,
  onMobileOpenChange,
}: SidebarProps) {
  const { isDesktopOpen, isMobileOpen, setMobileSidebar } = useSidebarStore()
  const { t } = useTranslation()
  const { data: session } = useSessionContext()
  const user = session?.user
  const role = (user as any)?.role || ''

  const { selectedYearId, selectedYearName, setAcademicYear } =
    useAcademicStore() as any as {
      selectedYearId: number | null
      selectedYearName: string
      setAcademicYear: (id: number, name: string) => void
    }
  const { data: academicYears = [], isLoading } = useAcademicYears() as any as {
    data: AcademicYearsType[]
    isLoading: boolean
  }

  useEffect(() => {
    if (academicYears.length > 0 && !selectedYearId) {
      const currentYear = academicYears.find((y) => y.isCurrent)
      if (currentYear) {
        setAcademicYear(currentYear.id!, currentYear.name!)
      }
    }
  }, [academicYears, selectedYearId, setAcademicYear])

  const currentYearName =
    academicYears.find((y: AcademicYearsType) => y.id === selectedYearId)
      ?.name || 'ជ្រើសរើសឆ្នាំសិក្សា'

  const actualMobileOpen = mobileOpen !== undefined ? mobileOpen : isMobileOpen
  const actualOnMobileOpenChange = onMobileOpenChange || setMobileSidebar

  const menuItems: MenuItem[] = [
    {
      key: 'dashboard',
      icon: <RiDashboardLine />,
      label: t('Sidebar.dashboard'),
      url: '/admin/dashboard',
    },
    {
      key: 'university',
      icon: <RiSchoolLine />,
      label: t('Sidebar.University.university'),
      children: [
        {
          key: 'building',
          label: t('Sidebar.University.building'),
          url: '/admin/building',
        },
        {
          key: 'room',
          label: t('Sidebar.University.room'),
          url: '/admin/room',
        },
      ],
    },
    {
      key: 'study',
      icon: <RiSchoolLine />,
      label: t('Sidebar.Study.study'),
      children: [
        {
          key: 'faculty',
          label: t('Sidebar.Study.faculty'),
          url: '/admin/faculty',
        },
        {
          key: 'department',
          label: t('Sidebar.department'),
          url: '/admin/department',
        },
        { key: 'major', label: t('Sidebar.Study.major'), url: '/admin/major' },
        {
          key: 'grade_level',
          label: t('Sidebar.Study.level'),
          url: '/admin/grade_level',
        },
        {
          key: 'academic_year',
          label: t('Sidebar.academic_year'),
          url: '/admin/academic_year',
        },
        {
          key: 'session_time',
          label: t('Sidebar.session_time'),
          url: '/admin/session_time',
        },
      ],
    },
    {
      key: 'notification',
      icon: <RiNotification2Line />,
      label: t('Sidebar.notification'),
      url: '/admin/notification',
    },
    {
      key: 'teacher',
      icon: <LiaChalkboardTeacherSolid />,
      label: t('Sidebar.teacher'),
      url: '/admin/teacher',
    },
    {
      key: 'student',
      icon: <PiStudent />,
      label: t('Sidebar.student'),
      url: '/admin/student',
    },
    {
      key: 'classes',
      icon: <AiOutlineSchedule />,
      label: t('Sidebar.schedule'),
      url: '/admin/schedule',
    },
    {
      key: 'course',
      icon: <AiOutlineSchedule />,
      label: t('Sidebar.course'),
      url: '/admin/course',
    },
    {
      key: 'user',
      icon: <RiUser3Line />,
      label: t('Sidebar.user'),
      url: '/admin/user',
    },
    {
      key: 'setting',
      icon: <RiSettings3Line />,
      label: t('Sidebar.setting'),
      url: '/admin/setting',
    },
  ]

  const filterMenu = (items: MenuItem[]): MenuItem[] => {
    return items
      .filter((item) => {
        const allowedRoles = menuPermissions[item.key]
        if (!allowedRoles) return true // Default visible if no permission defined
        return allowedRoles.includes(role)
      })
      .map((item) => {
        if (item.children) {
          return { ...item, children: filterMenu(item.children) }
        }
        return item
      })
      .filter((item) => {
        // Hide parent if it has children but all children are filtered out
        if (item.children && item.children.length === 0) {
          return false
        }
        return true
      })
  }

  const filteredMenuItems = filterMenu(menuItems)

  return (
    <div className="flex">
      {/* === Desktop Sidebar === */}
      <aside
        className={`hidden md:flex flex-col min-h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 shadow-sm ${
          isDesktopOpen ? 'w-64' : 'w-20'
        }`}
      >
        <div className="h-16 flex items-center px-4 border-b border-gray-100 dark:border-gray-700">
          <Link to="/admin/dashboard">
            {isDesktopOpen ? (
              <img
                className="transition-all duration-300"
                src={LogoDestop}
                alt="Logo"
              />
            ) : (
              <img
                className="transition-all duration-300"
                src={LogoMobile}
                alt="Logo"
              />
            )}
          </Link>
        </div>

        {/* Academic Year Dropdown */}
        <div className="px-3 py-4 border-b border-gray-50 dark:border-gray-800">
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild disabled={isLoading}>
              <button
                className={`flex items-center gap-3 w-full p-2.5 rounded-xl transition-all border border-transparent hover:border-blue-200 hover:bg-blue-50/50 dark:hover:bg-blue-900/20 group ${!isDesktopOpen ? 'justify-center' : ''}`}
              >
                <div className="flex items-center justify-center min-w-[32px] h-8 rounded-lg bg-blue-100 dark:bg-blue-900/40 text-blue-600">
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <RiCalendarEventLine className="text-lg" />
                  )}
                </div>
                {isDesktopOpen && (
                  <div className="flex flex-col items-start text-left overflow-hidden">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">
                      {t('Sidebar.academic_year')}
                    </span>
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-1">
                      {currentYearName}{' '}
                      <RiArrowDownSLine className="text-gray-400 group-hover:text-blue-500 transition-colors" />
                    </span>
                  </div>
                )}
              </button>
            </DropdownMenu.Trigger>

            <DropdownMenu.Portal>
              <DropdownMenu.Content
                side={isDesktopOpen ? 'bottom' : 'right'}
                sideOffset={10}
                className="z-[100] min-w-[200px] bg-white dark:bg-gray-800 p-1.5 rounded-xl shadow-2xl border border-gray-100 dark:border-gray-700 animate-in fade-in zoom-in-95 duration-200"
              >
                <div className="px-3 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-50 dark:border-gray-700 mb-1">
                  {t('Sidebar.academic_year')}
                </div>
                {academicYears.map((year) => (
                  <DropdownMenu.Item
                    key={year.id}
                    onClick={() => setAcademicYear(year.id!, year.name!)}
                    className={`flex items-center justify-between px-3 py-2.5 text-sm rounded-lg outline-none cursor-pointer transition-colors ${selectedYearId === year.id ? 'bg-blue-600 text-white font-bold' : 'text-gray-600 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700'}`}
                  >
                    {year.name}
                    {year.isCurrent && (
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded-full ${selectedYearId === year.id ? 'bg-blue-400 text-white' : 'bg-green-100 text-green-600'}`}
                      >
                        បច្ចុប្បន្ន
                      </span>
                    )}
                  </DropdownMenu.Item>
                ))}
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        </div>

        <nav className="flex-1 p-3 flex flex-col gap-1 overflow-y-auto custom-scrollbar">
          {filteredMenuItems.map((menu) =>
            menu.children ? (
              isDesktopOpen ? (
                <Collapsible.Root key={menu.key} className="group">
                  <Collapsible.Trigger asChild>
                    <button className="flex items-center w-full p-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group">
                      <div className="flex items-center gap-3">
                        <span className="text-xl text-gray-500 group-hover:text-blue-600 transition-colors">
                          {menu.icon}
                        </span>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                          {menu.label}
                        </span>
                      </div>
                      <RiArrowDownSLine className="ml-auto text-gray-400 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                    </button>
                  </Collapsible.Trigger>
                  <Collapsible.Content className="ml-9 mt-1 flex flex-col gap-1 border-l-2 border-gray-100 dark:border-gray-800 animate-in slide-in-from-top-1">
                    {menu.children.map((child) => (
                      <Link
                        key={child.key}
                        to={child.url ?? '#'}
                        className="p-2 text-[13px] pl-4 rounded-r-lg transition-colors"
                        activeProps={{
                          className:
                            'bg-blue-50 text-blue-600 dark:bg-blue-900/20 font-semibold border-l-2 border-blue-600',
                        }}
                        inactiveProps={{
                          className:
                            'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white',
                        }}
                      >
                        {child.label}
                      </Link>
                    ))}
                  </Collapsible.Content>
                </Collapsible.Root>
              ) : (
                <DropdownMenu.Root key={menu.key}>
                  <DropdownMenu.Trigger asChild>
                    <button className="flex items-center justify-center w-full p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 hover:text-blue-600 transition-all">
                      <span className="text-xl">{menu.icon}</span>
                    </button>
                  </DropdownMenu.Trigger>
                  <DropdownMenu.Portal>
                    <DropdownMenu.Content
                      side="right"
                      sideOffset={15}
                      className="z-[100] min-w-[180px] bg-white dark:bg-gray-900 p-1.5 rounded-xl shadow-2xl border border-gray-200 animate-in slide-in-from-left-2 duration-200"
                    >
                      <div className="px-3 py-2 text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                        {menu.label}
                      </div>
                      <DropdownMenu.Separator className="h-px bg-gray-100 dark:bg-gray-800 my-1" />
                      {menu.children.map((child) => (
                        <DropdownMenu.Item key={child.key} asChild>
                          <Link
                            to={child.url ?? '#'}
                            className="flex items-center px-3 py-2 text-sm rounded-lg outline-none"
                            activeProps={{
                              className: 'bg-blue-600 text-white',
                            }}
                            inactiveProps={{
                              className:
                                'text-gray-600 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-800',
                            }}
                          >
                            {child.label}
                          </Link>
                        </DropdownMenu.Item>
                      ))}
                    </DropdownMenu.Content>
                  </DropdownMenu.Portal>
                </DropdownMenu.Root>
              )
            ) : (
              <Link
                key={menu.key}
                to={menu.url ?? '#'}
                className={`flex items-center gap-3 p-2.5 rounded-lg transition-all ${!isDesktopOpen ? 'justify-center p-3' : ''}`}
                activeProps={{
                  className:
                    'bg-blue-600 text-white shadow-lg shadow-blue-100 dark:shadow-none font-bold',
                }}
                inactiveProps={{
                  className:
                    'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800',
                }}
              >
                <span className="text-xl">{menu.icon}</span>
                {isDesktopOpen && (
                  <span className="text-sm font-medium">{menu.label}</span>
                )}
              </Link>
            ),
          )}
        </nav>
      </aside>

      {/* === Mobile Drawer === */}
      <div className="md:hidden">
        <Dialog.Root
          open={actualMobileOpen}
          onOpenChange={actualOnMobileOpenChange}
        >
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[99] animate-in fade-in" />
            <Dialog.Content className="fixed top-0 left-0 h-full w-72 bg-white dark:bg-gray-900 shadow-2xl z-[100] flex flex-col animate-in slide-in-from-left duration-300">
              <div className="h-16 flex items-center justify-between px-4 border-b border-gray-100 dark:border-gray-800">
                <img className="w-32" src={LogoDestop} alt="Logo" />
                <Dialog.Close className="p-2 text-gray-400 hover:text-gray-600">
                  ✕
                </Dialog.Close>
              </div>

              {/* Mobile Academic Year Selector */}
              <div className="p-4 border-b border-gray-50 dark:border-gray-800 bg-gray-50/50">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">
                  ជ្រើសរើសឆ្នាំសិក្សា
                </label>
                <select
                  value={selectedYearId || ''}
                  onChange={(e) =>
                    setAcademicYear(Number(e.target.value), selectedYearName)
                  }
                  className="w-full p-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-sm"
                >
                  {isLoading ? (
                    <option>កំពុង Load...</option>
                  ) : (
                    academicYears.map((year) => (
                      <option key={year.id} value={year.id}>
                        {year.name} {year.isCurrent ? '(បច្ចុប្បន្ន)' : ''}
                      </option>
                    ))
                  )}
                </select>
              </div>

              <nav className="flex-1 p-4 overflow-y-auto flex flex-col gap-2">
                {filteredMenuItems.map((menu) =>
                  menu.children ? (
                    <Collapsible.Root key={menu.key} className="group">
                      <Collapsible.Trigger asChild>
                        <button className="flex items-center justify-between w-full p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-colors">
                          <div className="flex items-center gap-3">
                            <span className="text-xl text-gray-500">
                              {menu.icon}
                            </span>
                            <span className="font-medium text-sm text-gray-700 dark:text-gray-200">
                              {menu.label}
                            </span>
                          </div>
                          <RiArrowRightSLine className="text-gray-400 transition-transform duration-300 group-data-[state=open]:rotate-90" />
                        </button>
                      </Collapsible.Trigger>
                      <Collapsible.Content className="ml-9 flex flex-col gap-1 border-l-2 border-gray-100 dark:border-gray-800">
                        {menu.children.map((child) => (
                          <Link
                            key={child.key}
                            to={child.url ?? '#'}
                            onClick={() => actualOnMobileOpenChange(false)}
                            className="p-3 text-sm text-gray-500 hover:text-blue-600 transition-colors"
                          >
                            {child.label}
                          </Link>
                        ))}
                      </Collapsible.Content>
                    </Collapsible.Root>
                  ) : (
                    <Link
                      key={menu.key}
                      to={menu.url ?? '#'}
                      onClick={() => actualOnMobileOpenChange(false)}
                      className="flex items-center gap-3 p-3 rounded-xl transition-colors"
                      activeProps={{
                        className: 'bg-blue-600 text-white shadow-lg font-bold',
                      }}
                      inactiveProps={{
                        className:
                          'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800',
                      }}
                    >
                      <span className="text-xl">{menu.icon}</span>
                      <span className="font-medium text-sm">{menu.label}</span>
                    </Link>
                  ),
                )}
              </nav>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </div>
    </div>
  )
}
