import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { LoginPage } from '../features/auth/pages/LoginPage';
import { DashboardPage } from '../features/dashboard/pages/DashboardPage';
import { DashboardContent } from '../features/dashboard/components/DashboardContent';
import { UsersListPage } from '../features/users/pages/UsersListPage';
import { DevicesPage } from '../features/devices/pages/DevicesPage';
import { RecordsPage } from '../features/records/pages/RecordsPage';
import { ProjectsPage } from '../features/projects/pages/ProjectsPage';
import { WhatsAppPage } from '../features/whatsapp/pages/WhatsAppPage';
import { ProtectedRoute } from '../shared/components/ProtectedRoute';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <LoginPage />,
  },
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute>
        <DashboardPage />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <DashboardContent />,
      },
      {
        path: 'users',
        element: <UsersListPage />,
      },
      {
        path: 'devices',
        element: <DevicesPage />,
      },
      {
        path: 'records',
        element: <RecordsPage />,
      },
      {
        path: 'projects',
        element: <ProjectsPage />,
      },
      {
        path: 'whatsapp',
        element: <WhatsAppPage />,
      },
    ],
  },
]);

export const AppRouter = () => <RouterProvider router={router} />;
