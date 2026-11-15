import type { Project } from "../../common/entities/project";

export const mockProject: Project = {
  id: 101,
  name: "Atlas Customer Platform",
  description: "Modernize account management and customer onboarding.",
  status: "in_progress",
  expected_start_date: "2026-09-01",
  end_date: "2027-02-28",
  progress: 58,
  owner: 1,
  my_role: "owner",
  can_create_board: true,
  is_default: true,
  members: [
    { id: 1, first_name: "Avery", last_name: "Morgan", email: "avery@example.test", job_title: "Product manager", role: "owner" },
    { id: 2, first_name: "Jordan", last_name: "Lee", email: "jordan@example.test", job_title: "Engineer", role: "member" },
    { id: 3, first_name: "Sam", last_name: "Patel", email: "sam@example.test", job_title: "Designer", role: "member" },
  ],
};

export const mockProjects: Project[] = [mockProject, {
  ...mockProject, id: 102, name: "Mobile Checkout", description: "Improve conversion across mobile purchase journeys.",
  status: "in_progress", progress: 34, owner: 1, is_default: false,
}];
