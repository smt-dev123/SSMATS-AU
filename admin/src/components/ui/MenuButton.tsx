import { RiMenu2Line } from 'react-icons/ri'

interface MenuButtonProps {
  onClick: () => void
  className?: string
}

export function MenuButton({ onClick, className }: MenuButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`p-3 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition ${className}`}
      aria-label="Open menu"
    >
      <RiMenu2Line className="text-2xl text-gray-800 dark:text-white" />
    </button>
  )
}
