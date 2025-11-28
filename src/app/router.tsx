import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { LoginPage } from '../features/auth/pages/LoginPage';
import { DashboardPage } from '../features/dashboard/pages/DashboardPage';
import { DashboardContent } from '../features/dashboard/components/DashboardContent';
import { UsersListPage } from '../features/users/pages/UsersListPage';
import { DevicesPage } from '../features/devices/pages/DevicesPage';
import { RecordsPage } from '../features/records/pages/RecordsPage';
import { ProjectsPage } from '../features/projects/pages/ProjectsPage';
import { ProjectPage } from '../features/projects/pages/ProjectPage';
import { GroupsPage } from '../features/groups/pages/GroupsPage';
import { WhatsAppPage } from '../features/whatsapp/pages/WhatsAppPage';
import { WhatsasppSessionChatsPage } from '../features/whatsapp/pages/WhatsasppSessionChatsPage';
import { ProtectedRoute } from '../shared/components/ProtectedRoute';
import { RolesPermission } from '../shared/constants/routePermissions';

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
        element: (
          <ProtectedRoute allowedRoles={RolesPermission.users}>
            <UsersListPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'devices',
        element: (
          <ProtectedRoute allowedRoles={RolesPermission.devices}>
            <DevicesPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'records',
        element: (
          <ProtectedRoute allowedRoles={RolesPermission.records}>
            <RecordsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'projects',
        element: (
          <ProtectedRoute allowedRoles={RolesPermission.projects}>
            <ProjectsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'project',
        element: (
          <ProtectedRoute allowedRoles={RolesPermission.project}>
            <ProjectPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'project/:id',
        element: (
          <ProtectedRoute allowedRoles={RolesPermission.projectById}>
            <ProjectPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'groups',
        element: (
          <ProtectedRoute allowedRoles={RolesPermission.groups}>
            <GroupsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'whatsapp',
        element: (
          <ProtectedRoute allowedRoles={RolesPermission.whatsapp}>
            <WhatsAppPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'whatsapp/sessions/:id/chats',
        element: (
          <ProtectedRoute allowedRoles={RolesPermission.whatsappSessionChats}>
            <WhatsasppSessionChatsPage />
          </ProtectedRoute>
        ),
      },
    ],
  },
]);

export const AppRouter = () => <RouterProvider router={router} />;
