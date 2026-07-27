import type { AuthenticatedUser, UserRole } from "@/types";

interface DemoUser {
  email: string;
  password: string;
  role: UserRole;
  name: string;
  redirectTo: string;
}

export const DEMO_USERS: DemoUser[] = [
  {
    email: "superadmin@kaffe.com",
    password: "superadmin123",
    role: "superadmin",
    name: "Super Admin",
    redirectTo: "/superadmin/dashboard",
  },
  {
    email: "admin@kaffe.com",
    password: "admin123",
    role: "admin",
    name: "Admin",
    redirectTo: "/admin/dashboard",
  },
];

export function authenticateUser(
  email: string,
  password: string
): AuthenticatedUser | null {
  const user = DEMO_USERS.find(
    (entry) =>
      entry.email.toLowerCase() === email.toLowerCase() &&
      entry.password === password
  );

  if (!user) {
    return null;
  }

  return {
    email: user.email,
    role: user.role,
    name: user.name,
    redirectTo: user.redirectTo,
  };
}
