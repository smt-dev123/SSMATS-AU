import { useState, useEffect } from 'react'
import { IoMdExpand } from 'react-icons/io'
import { IoExpand } from 'react-icons/io5'

export default function Expand() {
  const [isFullscreen, setIsFullscreen] = useState(false)

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
    } else {
      document.exitFullscreen()
    }
  }

  // Sync state with browser fullscreen changes
  useEffect(() => {
    const handleChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }
    document.addEventListener('fullscreenchange', handleChange)
    return () => document.removeEventListener('fullscreenchange', handleChange)
  }, [])

  return (
    <>
      {isFullscreen ? (
        <IoExpand
          onClick={toggleFullscreen}
          className="cursor-pointer"
          size={20}
        />
      ) : (
        <IoMdExpand
          onClick={toggleFullscreen}
          className="cursor-pointer"
          size={20}
        />
      )}
    </>
  )
}
