'use client'

import { useTheme } from 'next-themes'
import { cn } from '@/lib/utils'

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme()


  const isDark = theme === 'dark'

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className={cn(
        'relative w-12 h-6 rounded-full transition-colors',
        isDark ? 'bg-zinc-800' : 'bg-gray-300'
      )}
    >
      <span
        className={cn(
          'absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow-md transition-transform',
          isDark ? 'translate-x-6' : 'translate-x-0'
        )}
      />
    </button>
  )
}
