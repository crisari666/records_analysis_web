import { Outlet } from 'react-router-dom'
import { AppDrawer } from '../../../shared/components/app_drawer'
import { UserValidation } from '../components/UserValidation'

export const DashboardPage = () => {
  return (
      <AppDrawer>
        <Outlet />
      </AppDrawer>
  )
}
