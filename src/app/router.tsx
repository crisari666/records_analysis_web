import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { LoginPage } from '../features/auth/pages/LoginPage';
import { DashboardPage } from '../features/dashboard/pages/DashboardPage';
import { DashboardContent } from '../features/dashboard/components/DashboardContent';
import { UsersListPage } from '../features/users/pages/UsersListPage';
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
    ],
  },
]);

export const AppRouter = () => <RouterProvider router={router} />;
