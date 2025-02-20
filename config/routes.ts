// config/routes.ts
export const ROUTES = {
  PUBLIC: [
    { path: '/', name: 'Home' },
    { path: '/login', name: 'Login' },
    { path: '/signup', name: 'Signup' },
  ],
  PROTECTED: [
    { path: '/dashboard', name: 'Dashboard Landing' },
    { path: '/dashboard/dashboard1', name: 'Dashboard 1' },
    { path: '/dashboard/dashboard2', name: 'Dashboard 2' },
    { path: '/dashboard/dashboard3', name: 'Dashboard 3' },
    { path: '/profile', name: 'Profile' },
    { path: '/admin', name: 'Admin Panel' },
    { path: '/admin/roles', name: 'Roles' },
    { path: '/admin/users', name: 'Users' },
  ]
} as const;
