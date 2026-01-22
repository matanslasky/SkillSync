import { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext()

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('dark')
  const [accentColor, setAccentColor] = useState('green')

  useEffect(() => {
    // Load saved theme preference
    const savedTheme = localStorage.getItem('theme') || 'dark'
    const savedAccent = localStorage.getItem('accentColor') || 'green'
    setTheme(savedTheme)
    setAccentColor(savedAccent)
    applyTheme(savedTheme, savedAccent)
  }, [])

  const applyTheme = (newTheme, newAccent) => {
    const root = document.documentElement
    
    // Theme (dark/light)
    root.setAttribute('data-theme', newTheme)
    
    // Accent color
    root.setAttribute('data-accent', newAccent)
    
    // Apply CSS variables
    if (newTheme === 'light') {
      root.style.setProperty('--color-dark', '#ffffff')
      root.style.setProperty('--color-dark-lighter', '#f3f4f6')
      root.style.setProperty('--color-text', '#111827')
      root.style.setProperty('--color-text-secondary', '#6b7280')
    } else {
      root.style.setProperty('--color-dark', '#0a0e1a')
      root.style.setProperty('--color-dark-lighter', '#151b2e')
      root.style.setProperty('--color-text', '#ffffff')
      root.style.setProperty('--color-text-secondary', '#9ca3af')
    }
  }

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
    applyTheme(newTheme, accentColor)
  }

  const changeAccentColor = (color) => {
    setAccentColor(color)
    localStorage.setItem('accentColor', color)
    applyTheme(theme, color)
  }

  return (
    <ThemeContext.Provider value={{ theme, accentColor, toggleTheme, changeAccentColor }}>
      {children}
    </ThemeContext.Provider>
  )
}
