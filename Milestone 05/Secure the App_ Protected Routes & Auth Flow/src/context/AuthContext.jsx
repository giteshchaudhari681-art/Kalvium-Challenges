import { createContext, useEffect, useState } from 'react'

export const AuthContext = createContext(undefined)

const getStoredUser = () => {
  const storedUser = localStorage.getItem('authUser')

  if (!storedUser) {
    return null
  }

  try {
    return JSON.parse(storedUser)
  } catch {
    localStorage.removeItem('authUser')
    return null
  }
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(getStoredUser)
  const [token, setToken] = useState(() => localStorage.getItem('authToken'))

  const login = (userData, nextToken) => {
    setUser(userData)
    setToken(nextToken)

    localStorage.setItem('authToken', nextToken)
    localStorage.setItem('authUser', JSON.stringify(userData))
  }

  const logout = () => {
    setUser(null)
    setToken(null)

    localStorage.removeItem('authToken')
    localStorage.removeItem('authUser')
  }

  useEffect(() => {
    const storedToken = localStorage.getItem('authToken')
    const storedUser = getStoredUser()

    if (storedToken && storedUser) {
      setToken(storedToken)
      setUser(storedUser)
      return
    }

    setToken(null)
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
