// types/index.ts
export interface User {
  uid: string;
  email: string;
  name: string;
  imageUrl?: string;
  roles: string[];
  allowedRoutes: {
    [key: string]: string; // route path -> route name
  };
  allowedEnvironments: {
    [key: string]: string; // environment key -> environment display name
  };
  createdAt: string;
  updatedAt: string;
}

export interface Role {
  name: string;
  description?: string;
  routes: {
    [key: string]: string; // route path -> route name
  };
  createdAt: string;
  updatedAt: string;
}
