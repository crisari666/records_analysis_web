import { useEffect, useState } from 'react'
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
} from '@mui/material'
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material'
import { useAppDispatch, useAppSelector } from '../../../app/hooks'
import { getUsersAsync, deleteUserAsync } from '../store/usersSlice'
import { UserFormModal } from './UserFormModal'
import type { User } from '../types'

export const UsersList = () => {
  const { t } = useTranslation('users')
  const dispatch = useAppDispatch()
  const { users, isLoading, error } = useAppSelector((state) => state.users)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  useEffect(() => {
    dispatch(getUsersAsync())
  }, [dispatch])

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
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          sx={{ mb: 2 }}
          onClick={() => handleOpenModal()}
        >
          {t('addUser')}
        </Button>
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
              <TableCell>{t('table.createdAt')}</TableCell>
              <TableCell align="right">{t('table.actions')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Typography variant="body2" color="text.secondary">
                    {t('noUsers')}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
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
