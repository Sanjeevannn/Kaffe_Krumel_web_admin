import type { StaffUser } from "@/types";

export const USER_BRANCHES = [
  "Branch 1",
  "Branch 2",
  "Branch 3",
  "Jaffna Branch1",
];

export const INITIAL_USERS: StaffUser[] = Array.from({ length: 30 }, (_, i) => {
  const isAdmin = i % 3 !== 2;
  return {
    id: i + 1,
    branch: `Branch ${(i % 3) + 1}`,
    username: isAdmin ? `Admin${(i % 5) + 1}` : `Cashier${(i % 4) + 1}`,
    manager: "Kishana",
    createdAt: "12/02/2025",
    role: isAdmin ? "Admin" : "Cashier",
    status: i % 4 === 0 ? "Inactive" : "Active",
    password: "password123",
  };
});

export function getUserStats(users: StaffUser[]) {
  return {
    totalBranch: new Set(users.map((u) => u.branch)).size || 10,
    totalUsers: users.length,
    admin: users.filter((u) => u.role === "Admin").length,
    cashier: users.filter((u) => u.role === "Cashier").length,
  };
}
