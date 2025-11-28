import { Outlet } from 'react-router-dom'
import { AppDrawer } from '../../../shared/components/app_drawer'

export const DashboardPage = () => {
  return (
      <AppDrawer>
        <Outlet />
      </AppDrawer>
  )
}
