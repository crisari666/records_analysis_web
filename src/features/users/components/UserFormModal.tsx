import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Alert,
  CircularProgress,
  MenuItem,
} from '@mui/material'
import { useTranslation } from 'react-i18next'
import { useAppDispatch, useAppSelector } from '../../../app/hooks'
import { createUserAsync, updateUserAsync, clearError } from '../store/usersSlice'
import type { User, CreateUserRequest, UpdateUserRequest } from '../types'

type UserFormModalProps = {
  open: boolean
  onClose: () => void
  user?: User | null
}

export const UserFormModal: React.FC<UserFormModalProps> = ({ open, onClose, user }) => {
  const { t } = useTranslation('users')
  const dispatch = useAppDispatch()
  const { isLoading, error } = useAppSelector((state) => state.users)

  const [formData, setFormData] = useState({
    name: '',
    lastName: '',
    user: '',
    email: '',
    password: '',
    role: 'user' as 'root' | 'admin' | 'user',
  })

  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  const isEditing = Boolean(user)

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        lastName: user.lastName,
        user: user.user,
        email: user.email,
        password: '',
        role: user.role,
      })
    } else {
      setFormData({
        name: '',
        lastName: '',
        user: '',
        email: '',
        password: '',
        role: 'user',
      })
    }
    setFormErrors({})
    dispatch(clearError())
  }, [user, dispatch, open])

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}

    if (!formData.name.trim()) {
      errors.name = t('form.nameRequired')
    }

    if (!formData.lastName.trim()) {
      errors.lastName = t('form.lastNameRequired')
    }

    if (!formData.user.trim()) {
      errors.user = t('form.userRequired')
    }

    if (!formData.email.trim()) {
      errors.email = t('form.emailRequired')
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errors.email = t('form.emailInvalid')
    }

    if (!isEditing && !formData.password.trim()) {
      errors.password = t('form.passwordRequired')
    } else if (formData.password.trim() && formData.password.length < 6) {
      errors.password = t('form.passwordMinLength')
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleInputChange = (field: keyof typeof formData) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = field === 'role' ? event.target.value as 'root' | 'admin' | 'user' : event.target.value
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }))
    
    // Clear error for this field when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({
        ...prev,
        [field]: '',
      }))
    }
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    
    if (!validateForm()) {
      return
    }

    const trimmedData = {
      name: formData.name.trim(),
      lastName: formData.lastName.trim(),
      user: formData.user.trim(),
      email: formData.email.trim().toLowerCase(),
      ...(formData.password.trim() && { password: formData.password.trim() }),
      role: formData.role,
    }

    try {
      if (isEditing && user) {
        const updateData: UpdateUserRequest = {
          id: user._id,
          ...trimmedData,
        }
        await dispatch(updateUserAsync(updateData)).unwrap()
      } else {
        const createData: CreateUserRequest = {
          ...trimmedData,
          password: formData.password.trim(),
        }
        await dispatch(createUserAsync(createData)).unwrap()
      }
      onClose()
    } catch (err) {
      // Error is handled by the slice
    }
  }

  const handleClose = () => {
    if (!isLoading) {
      onClose()
    }
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {isEditing ? t('form.editUser') : t('form.addUser')}
      </DialogTitle>
      
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            {error && (
              <Alert severity="error">
                {isEditing ? t('form.updateError') : t('form.createError')}: {error}
              </Alert>
            )}

            <TextField
              label={t('form.name')}
              value={formData.name}
              onChange={handleInputChange('name')}
              error={Boolean(formErrors.name)}
              helperText={formErrors.name}
              fullWidth
              disabled={isLoading}
              required
            />

            <TextField
              label={t('form.lastName')}
              value={formData.lastName}
              onChange={handleInputChange('lastName')}
              error={Boolean(formErrors.lastName)}
              helperText={formErrors.lastName}
              fullWidth
              disabled={isLoading}
              required
            />

            <TextField
              label={t('form.username')}
              value={formData.user}
              onChange={handleInputChange('user')}
              error={Boolean(formErrors.user)}
              helperText={formErrors.user}
              fullWidth
              disabled={isLoading || isEditing}
              required
            />

            <TextField
              label={t('form.email')}
              type="email"
              value={formData.email}
              onChange={handleInputChange('email')}
              error={Boolean(formErrors.email)}
              helperText={formErrors.email}
              fullWidth
              disabled={isLoading}
              required
            />

            <TextField
              label={t('form.password')}
              type="password"
              value={formData.password}
              onChange={handleInputChange('password')}
              error={Boolean(formErrors.password)}
              helperText={formErrors.password || (isEditing ? t('form.passwordOptional') : '')}
              fullWidth
              disabled={isLoading}
              required={!isEditing}
              inputProps={{ minLength: 6 }}
            />

            <TextField
              select
              label={t('form.role')}
              value={formData.role}
              onChange={handleInputChange('role')}
              fullWidth
              disabled={isLoading}
            >
              <MenuItem value="user">{t('form.roleUser')}</MenuItem>
              <MenuItem value="admin">{t('form.roleAdmin')}</MenuItem>
              <MenuItem value="root">{t('form.roleRoot')}</MenuItem>
            </TextField>
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose} disabled={isLoading}>
            {t('form.cancel')}
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isLoading}
            startIcon={isLoading ? <CircularProgress size={20} /> : undefined}
          >
            {isEditing ? t('form.save') : t('form.create')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

