// config/routes.ts
export const ROUTES = {
  PUBLIC: [
    { path: '/', name: 'Home' },
    { path: '/login', name: 'Login' },
    { path: '/signup', name: 'Signup' },
  ],
  PROTECTED: [
    { path: '/dashboard', name: 'Dashboard Landing' },
    { path: '/dashboard/users', name: 'Users Dashboard' },
    { path: '/dashboard/users/all-users', name: 'All Users' },
    { path: '/dashboard/users/find-user', name: 'Find User' },
    { path: '/dashboard/customersupport', name: 'Customer Support Dashboard' },
    { path: '/dashboard/customersupport/bug-report', name: 'Bug Report' },
    { path: '/dashboard/devops', name: 'Devops Dashboard' },
    { path: '/dashboard/devops/kubernetes', name: 'Kubernetes Dashboard' },
    { path: '/dashboard/analytics', name: 'Analytics Dashboard' },
    { path: '/dashboard/analytics/grafana', name: 'Grafana Dashboard' },
    { path: '/dashboard/analytics/call-history-table', name: 'Call History Table' },
    { path: '/dashboard/analytics/call-history-analytics', name: 'Call History Analytics' },
    { path: '/dashboard/analytics/active-user-analytics', name: 'Active-user-analytics' },
    { path: '/profile', name: 'Profile' },
    { path: '/admin', name: 'Admin Panel' },
    { path: '/admin/roles', name: 'Roles' },
    { path: '/admin/users', name: 'Users' },
  ]
} as const;
