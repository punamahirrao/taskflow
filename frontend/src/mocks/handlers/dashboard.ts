import { http, HttpResponse } from "msw";
import { mockProjects } from "../projects";
import { mockTasks } from "../tasks";
import type { DeliverySnapshot } from "../../dashboard/entities/delivery";

const date = (offset: number) =>
  new Date(Date.UTC(2026, 10, 21 + offset)).toISOString().slice(0, 10);

export function mockDelivery(projectId?: string | null): DeliverySnapshot {
  const projects = mockProjects.filter((project) => !projectId || project.id === Number(projectId));
  const primary = projects.find((project) => project.id === mockProjects[0].id);
  const attention = primary
    ? [
        {
          id: 1,
          title: "Validate account recovery",
          project_id: primary.id,
          project_name: primary.name,
          due_date: date(-2),
          priority: "high",
          assignee: "Jordan Lee",
        },
      ]
    : [];
  return {
    as_of: date(0),
    projects: projects.map((project) => ({
      id: project.id,
      name: project.name,
      status: project.status,
      end_date: date(19),
      total: 16,
      done: project.id === primary?.id ? 9 : 12,
      in_review: 2,
      overdue: project.id === primary?.id ? 1 : 0,
      blocked: project.id === primary?.id ? 1 : 0,
      due_soon: 0,
      at_risk: project.id === primary?.id ? 1 : 0,
    })),
    trend: Array.from({ length: 28 }, (_, index) => ({
      date: date(index - 27),
      created: projects.length ? [2, 0, 3, 1, 3, 4, 0][index % 7] : 0,
      completed: projects.length ? [1, 2, 2, 2, 0, 3, 2][index % 7] : 0,
    })),
    attention: { overdue: attention, blocked: attention, due_soon: [] },
    sprint_count: projects.length,
    sprints: projects.map((project) => ({
      id: project.id,
      project_id: project.id,
      project__name: project.name,
      name: "Delivery sprint",
      end_date: date(5),
      goal: "Complete acceptance checks for the next release.",
      total: 8,
      done: 5,
    })),
    milestones: projects.length
      ? [{ id: 1, name: "Acceptance sign-off", kind: "milestone", target_date: date(12) }]
      : [],
  };
}

export const dashboardHandlers = [
  http.get("*/dashboard/delivery/", ({ request }) =>
    HttpResponse.json(mockDelivery(new URL(request.url).searchParams.get("project_id"))),
  ),
  http.get("*/dashboard/overview/", () =>
    HttpResponse.json({
      total_projects: mockProjects.length,
      completed_tasks: 1,
      pending_tasks: mockTasks.length - 1,
      completion_rate: 25,
      active_sprints: 1,
    }),
  ),
  http.get("*/dashboard/project-health/", () =>
    HttpResponse.json(
      mockProjects.map((project) => ({
        id: project.id,
        name: project.name,
        status: project.status,
        task_count: 4,
        completed_tasks: 1,
        completion_rate: 25,
        active_sprints: 1,
      })),
    ),
  ),
  http.get("*/dashboard/activity/", () =>
    HttpResponse.json([
      {
        id: 1,
        task_id: mockTasks[0].id,
        project_id: mockProjects[0].id,
        project_name: mockProjects[0].name,
        title: mockTasks[0].title,
        actor: "Storybook User",
        action: "updated",
        created_at: "2026-11-21T10:00:00Z",
      },
    ]),
  ),
  http.get("*/dashboard/calendar/", ({ request }) => {
    const params = new URL(request.url).searchParams;
    const start = params.get("start") ?? date(0);
    const project = Number(params.get("project_id") ?? mockProjects[0].id);
    if (!mockProjects.some(({ id }) => id === project)) return HttpResponse.json([]);
    const month = start.slice(0, 7);
    return HttpResponse.json([
      {
        id: "task-402",
        title: "Review passkey sign-in",
        date: month + "-12",
        kind: "task",
        project_id: project,
      },
      {
        id: "sprint-301",
        title: "Platform sprint review",
        date: month + "-17",
        kind: "sprint",
        project_id: project,
      },
      {
        id: "release-601",
        title: "Account recovery release",
        date: month + "-26",
        kind: "release",
        project_id: null,
      },
    ]);
  }),
];
