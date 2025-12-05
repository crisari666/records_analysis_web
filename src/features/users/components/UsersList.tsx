import { useEffect, useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  CircularProgress,
  Alert,
  Button,
  IconButton,
  Autocomplete,
  TextField,
} from '@mui/material'
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material'
import { useAppDispatch, useAppSelector } from '../../../app/hooks'
import { getUsersAsync, deleteUserAsync } from '../store/usersSlice'
import { UserFormModal } from './UserFormModal'
import { fetchProjects, selectProjects } from '../../projects/store/projectsSlice'
import type { User } from '../types'

export const UsersList = () => {
  const { t } = useTranslation('users')
  const dispatch = useAppDispatch()
  const { users, isLoading, error } = useAppSelector((state) => state.users)
  const projects = useAppSelector(selectProjects)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [filterProjectId, setFilterProjectId] = useState<string | null>(null)

  useEffect(() => {
    dispatch(getUsersAsync())
  }, [dispatch])

  useEffect(() => {
    if (projects.length === 0) {
      dispatch(fetchProjects())
    }
  }, [dispatch, projects.length])

  const projectNameById = useMemo(() => {
    const map: Record<string, string> = {}
    projects.forEach(p => { map[p._id] = p.title })
    return map
  }, [projects])

  const projectOptions = useMemo(() => 
    projects.map(p => ({ label: p.title, value: p._id })),
    [projects]
  )

  const filteredUsers = useMemo(() => {
    if (!filterProjectId) return users
    return users.filter(user => 
      user.projects && user.projects.includes(filterProjectId)
    )
  }, [users, filterProjectId])

  const handleDeleteUser = async (id: string) => {
    if (window.confirm(t('confirmDelete'))) {
      await dispatch(deleteUserAsync(id))
    }
  }

  const handleOpenModal = (user?: User) => {
    setSelectedUser(user || null)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedUser(null)
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'root':
        return 'error'
      case 'admin':
        return 'warning'
      default:
        return 'default'
    }
  }

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          {t('title')}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          {t('subtitle')}
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <Autocomplete
            sx={{ minWidth: 280 }}
            options={projectOptions}
            value={projectOptions.find(o => o.value === filterProjectId) || null}
            onChange={(_, val) => setFilterProjectId(val ? val.value : null)}
            renderInput={(params) => <TextField {...params} label={t('table.filterByProject')} />}
            clearOnEscape
          />
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenModal()}
          >
            {t('addUser')}
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>{t('table.name')}</TableCell>
              <TableCell>{t('table.lastName')}</TableCell>
              <TableCell>{t('table.username')}</TableCell>
              <TableCell>{t('table.email')}</TableCell>
              <TableCell>{t('table.role')}</TableCell>
              <TableCell>{t('table.projects')}</TableCell>
              <TableCell>{t('table.createdAt')}</TableCell>
              <TableCell align="right">{t('table.actions')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  <Typography variant="body2" color="text.secondary">
                    {t('noUsers')}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow key={user._id} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      {user.name}
                    </Typography>
                  </TableCell>
                  <TableCell>{user.lastName}</TableCell>
                  <TableCell>{user.user}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Chip
                      label={t(`roles.${user.role}`)}
                      size="small"
                      color={getRoleColor(user.role)}
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    {user.projects && user.projects.length > 0 ? (
                      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                        {user.projects.map((projectId) => (
                          <Chip
                            key={projectId}
                            label={projectNameById[projectId] || projectId}
                            size="small"
                            variant="outlined"
                            color="primary"
                          />
                        ))}
                      </Box>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        {t('table.noProjects')}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    {new Date(user.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => handleOpenModal(user)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDeleteUser(user._id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <UserFormModal
        open={isModalOpen}
        onClose={handleCloseModal}
        user={selectedUser}
      />
    </Box>
  )
}
