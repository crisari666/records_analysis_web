import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '../../../app/hooks'
import { authSlice } from '../../auth/store/authSlice'
import { AppConstants } from '@/shared/constants/appConstants'
import { User } from '../../auth/types'

export const UserValidation = () => {
  const dispatch = useAppDispatch()

  const { user, isAuthenticated } = useAppSelector((state) => state.auth)

  useEffect(() => {
    const storedToken = localStorage.getItem(AppConstants.LOCAL_STORAGE.AUTH_TOKEN)
    const storedUser = localStorage.getItem(AppConstants.LOCAL_STORAGE.USER)

    // If there's a token but no user in state, try to restore from localStorage first
    if (storedToken && !user && storedUser) {
      try {
        const parsedUser: User = JSON.parse(storedUser)
        dispatch(authSlice.actions.setUser(parsedUser))
      } catch (error) {
        console.error('Failed to parse stored user:', error)
        localStorage.removeItem(AppConstants.LOCAL_STORAGE.USER)
      }
    }

    // If we have a token but no authenticated user, validate with the server
    // This ensures we get the latest user data and validate the token
    if (storedToken && (!isAuthenticated || !user)) {
      dispatch(authSlice.actions.getCurrentUserAsync())
    }
  }, [])

  return null
}

