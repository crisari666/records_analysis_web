import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Button,
} from '@mui/material'
import {
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
  Home as HomeIcon,
  Group as GroupIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material'
import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { authSlice } from '../../features/auth/store/authSlice'
import { LanguageSwitcher } from './LanguageSwitcher'

const DRAWER_WIDTH = 240

type NavigationItem = {
  text: string
  icon: React.ReactElement
  path: string
  translationKey: string
}

type AppDrawerProps = {
  children: React.ReactNode
}

export const AppDrawer = ({ children }: AppDrawerProps) => {
  const { t } = useTranslation('dashboard')
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useAppDispatch()
  const { user } = useAppSelector((state) => state.auth)
  const [isOpen, setIsOpen] = useState(false)

  const navigationItems: NavigationItem[] = [
    { 
      text: t('navigation.home'), 
      icon: <HomeIcon />, 
      path: '/dashboard',
      translationKey: 'navigation.home'
    },
    { 
      text: t('navigation.users'), 
      icon: <GroupIcon />, 
      path: '/dashboard/users',
      translationKey: 'navigation.users'
    },
  ]

  const handleDrawerOpen = () => {
    setIsOpen(true)
  }

  const handleDrawerClose = () => {
    setIsOpen(false)
  }

  const handleNavigate = (path: string) => {
    navigate(path)
  }

  const handleLogout = async () => {
    dispatch(authSlice.actions.logout())
    navigate('/')
  }

  const isActiveRoute = (path: string): boolean => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard'
    }
    return location.pathname.startsWith(path)
  }

  const renderNavigationItems = () => {
    return navigationItems.map((item) => (
      <ListItem key={item.path} disablePadding>
        <ListItemButton
          selected={isActiveRoute(item.path)}
          onClick={() => handleNavigate(item.path)}
          sx={{
            minHeight: 48,
            justifyContent: isOpen ? 'initial' : 'center',
            px: 2.5,
          }}
        >
          <ListItemIcon
            sx={{
              minWidth: 0,
              mr: isOpen ? 3 : 'auto',
              justifyContent: 'center',
            }}
          >
            {item.icon}
          </ListItemIcon>
          <ListItemText
            primary={item.text}
            sx={{ opacity: isOpen ? 1 : 0 }}
          />
        </ListItemButton>
      </ListItem>
    ))
  }

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar 
        position="fixed" 
        sx={{ 
          zIndex: (theme) => theme.zIndex.drawer + 1,
          marginLeft: isOpen ? DRAWER_WIDTH : 0,
          width: isOpen ? `calc(100% - ${DRAWER_WIDTH}px)` : '100%',
          transition: (theme) => theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            edge="start"
            sx={{
              marginRight: 5,
              ...(isOpen && { display: 'none' }),
            }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {t('title')}
          </Typography>
          <LanguageSwitcher />
          {user && (
            <Typography variant="body2" sx={{ mr: 2 }}>
              {t('welcome', { name: user.name })}
            </Typography>
          )}
          <Button color="inherit" onClick={handleLogout}>
            <LogoutIcon sx={{ mr: 1 }} />
            {t('logout')}
          </Button>
        </Toolbar>
      </AppBar>
      
      <Drawer
        variant="permanent"
        open={isOpen}
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          whiteSpace: 'nowrap',
          boxSizing: 'border-box',
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            transition: (theme) => theme.transitions.create('width', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
            overflowX: 'hidden',
            ...(!isOpen && {
              width: `calc(${DRAWER_WIDTH}px - 200px)`,
              transition: (theme) => theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.leavingScreen,
              }),
            }),
          },
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            padding: (theme) => theme.spacing(0, 1),
            ...(isOpen && { minHeight: 64 }),
          }}
        >
          <IconButton onClick={handleDrawerClose}>
            <ChevronLeftIcon />
          </IconButton>
        </Box>
        <Divider />
        <List>{renderNavigationItems()}</List>
      </Drawer>
      
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: isOpen ? `calc(100% - ${DRAWER_WIDTH}px)` : '100%',
          transition: (theme) => theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  )
}