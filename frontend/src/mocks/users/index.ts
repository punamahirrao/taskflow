import type { User } from "../../common/entities/user";

export const mockUser: User = {
  id: 1, first_name: "Avery", last_name: "Morgan", email: "avery.morgan@example.test",
  account_type: "organization", job_title: "Product manager", is_staff: false, is_active: true,
  date_joined: "2024-04-15T09:00:00Z",
};
export const mockUsers: User[] = [mockUser,
  { ...mockUser, id: 2, first_name: "Jordan", last_name: "Lee", email: "jordan.lee@example.test", job_title: "Senior engineer" },
  { ...mockUser, id: 3, first_name: "Sam", last_name: "Patel", email: "sam.patel@example.test", job_title: "Product designer" },
];
