import React, { useEffect, useMemo } from 'react'
import {
  Box,
  Autocomplete,
  TextField,
  Chip,
  Typography,
} from '@mui/material'
import { useTranslation } from 'react-i18next'
import { useAppDispatch, useAppSelector } from '../../../app/hooks'
import { fetchProjects, selectProjects } from '../../projects/store/projectsSlice'
import { getUsersAsync } from '../store/usersSlice'

type UserProjectSelectorProps = {
  selectedProjects: string[]
  onChange: (projectIds: string[]) => void
  error?: string
  disabled?: boolean
  required?: boolean
  isEditing?: boolean
}

export const UserProjectSelector: React.FC<UserProjectSelectorProps> = ({
  selectedProjects,
  onChange,
  error,
  disabled = false,
  isEditing = false,
}) => {
  const { t } = useTranslation('users')
  const dispatch = useAppDispatch()
  const projects = useAppSelector(selectProjects)
  const users = useAppSelector((state) => state.users.users)
  const currentUser = useAppSelector((state) => state.auth.user)

  const isRoot = currentUser?.role === 'root'
  const isAdmin = currentUser?.role === 'admin'

  useEffect(() => {
    if (projects.length === 0) {
      dispatch(fetchProjects())
    }
  }, [dispatch, projects.length])

  // Fetch users if not loaded to get current user's full data
  useEffect(() => {
    if (isAdmin && users.length === 0) {
      dispatch(getUsersAsync())
    }
  }, [dispatch, isAdmin, users.length])

  // Get current user's full data from users store to access projects
  const currentUserFullData = useMemo(() => {
    if (!currentUser) return null
    return users.find(u => u._id === currentUser.id || u.email === currentUser.email)
  }, [users, currentUser])

  // Filter available projects based on current user role
  const availableProjects = useMemo(() => {
    if (isRoot) {
      return projects
    }
    if (isAdmin && currentUserFullData) {
      // Admin can only see projects they belong to
      const adminProjectIds = currentUserFullData.projects || []
      return projects.filter(p => adminProjectIds.includes(p._id))
    }
    return []
  }, [projects, isRoot, isAdmin, currentUserFullData])

  const projectOptions = useMemo(() => 
    availableProjects.map(p => ({ label: p.title, value: p._id })),
    [availableProjects]
  )

  const selectedProjectOptions = useMemo(() => {
    // Filter project options that match selected project IDs
    const matched = projectOptions.filter(opt => selectedProjects.includes(opt.value))
    
    // If we have selected projects but they're not in available options yet,
    // we still want to show them (they might be loading or filtered)
    // But for Autocomplete to work, we can only use options that exist
    return matched
  }, [projectOptions, selectedProjects])

  const handleChange = (_: any, newValue: typeof projectOptions) => {
    const newProjectIds = newValue.map(opt => opt.value)
    onChange(newProjectIds)
  }

  if (availableProjects.length === 0) {
    return null
  }

  return (
    <Box>
      <Autocomplete
        multiple
        options={projectOptions}
        value={selectedProjectOptions}
        onChange={handleChange}
        getOptionLabel={(option) => option.label}
        isOptionEqualToValue={(option, value) => option.value === value.value}
        renderInput={(params) => (
          <TextField
            {...params}
            label={t('form.projects')}
            placeholder={t('form.selectProjects')}
            error={Boolean(error)}
            helperText={error || (isAdmin && !isEditing && (!selectedProjects || selectedProjects.length === 0) ? t('form.projectsRequiredForAdmin') : '')}
            disabled={disabled}
            slotProps={{
              htmlInput: {
                ...(params.inputProps || {}),
                required: false, // Disable native HTML5 validation for Autocomplete
              },
            }}
          />
        )}
        renderTags={(value, getTagProps) =>
          value.map((option, index) => (
            <Chip
              {...getTagProps({ index })}
              key={option.value}
              label={option.label}
              size="small"
            />
          ))
        }
        disabled={disabled}
      />
      {isAdmin && !isEditing && (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
          {t('form.adminProjectsNote')}
        </Typography>
      )}
    </Box>
  )
}
