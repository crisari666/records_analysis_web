import { useEffect } from 'react'
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

export const UsersList = () => {
  const { t } = useTranslation('users')
  const dispatch = useAppDispatch()
  const { users, isLoading, error } = useAppSelector((state) => state.users)

  useEffect(() => {
    dispatch(getUsersAsync())
  }, [dispatch])

  const handleDeleteUser = async (id: string) => {
    if (window.confirm(t('confirmDelete'))) {
      await dispatch(deleteUserAsync(id))
    }
  }

  const getStatusColor = (status: string) => {
    return status === 'active' ? 'success' : 'default'
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
              <TableCell>{t('table.email')}</TableCell>
              <TableCell>{t('table.role')}</TableCell>
              <TableCell>{t('table.status')}</TableCell>
              <TableCell>{t('table.createdAt')}</TableCell>
              <TableCell align="right">{t('table.actions')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Typography variant="body2" color="text.secondary">
                    {t('noUsers')}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      {user.name}
                    </Typography>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Chip
                      label={user.role}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={t(`status.${user.status}`)}
                      size="small"
                      color={getStatusColor(user.status)}
                    />
                  </TableCell>
                  <TableCell>
                    {new Date(user.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => {
                        // TODO: Implement edit functionality
                        console.log('Edit user:', user.id)
                      }}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDeleteUser(user.id)}
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
    </Box>
  )
}
