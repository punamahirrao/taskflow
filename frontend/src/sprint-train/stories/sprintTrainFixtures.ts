import { http, HttpResponse } from "msw";
import { expect } from "storybook/test";
import { mockSprints } from "../../mocks/sprints";
import { mockUser } from "../../mocks/users";
import type { Sprint } from "../../features/tasks/entities/task";
import type { TaskComment, TaskHistoryEntry } from "../../features/tasks/entities/taskActivity";
import type {
  AbsenceInput,
  CapacityPlan,
  HolidayInput,
  SprintCapacity,
} from "../entities/capacity";

export function storyActivityFixture() {
  let comments: TaskComment[] = [];
  const history: TaskHistoryEntry[] = [
    {
      id: 1,
      actor_name: "Avery Morgan",
      action: "updated",
      changes: { status: { old: "todo", new: "review" } },
      created_at: "2026-11-24T10:00:00Z",
    },
  ];
  const base: TaskComment = {
    id: 1,
    task: 401,
    author_id: 1,
    author_name: "Avery Morgan",
    author_photo_url: null,
    content: "Review acceptance steps.",
    created_at: "2026-11-24T10:00:00Z",
    updated_at: "2026-11-24T10:00:00Z",
    can_edit: true,
    can_delete: true,
  };
  const reset = () => {
    comments = [{ ...base }];
  };
  reset();
  return {
    reset,
    handlers: [
      http.get("*/accounts/me/", () => HttpResponse.json(mockUser)),
      http.get("*/tasks/:taskId/comments/", () => HttpResponse.json(comments)),
      http.get("*/tasks/:taskId/history/", () => HttpResponse.json(history)),
      http.post("*/tasks/:taskId/comments/", async ({ request }) => {
        const input = (await request.json()) as { content: string };
        const comment = { ...base, id: 2, content: input.content };
        comments.push(comment);
        return HttpResponse.json(comment, { status: 201 });
      }),
      http.patch("*/tasks/:taskId/comments/:commentId/", async ({ request, params }) => {
        const input = (await request.json()) as { content: string };
        const comment = comments.find((item) => item.id === Number(params.commentId))!;
        comment.content = input.content;
        comment.updated_at = "2026-11-24T11:00:00Z";
        return HttpResponse.json(comment);
      }),
      http.delete("*/tasks/:taskId/comments/:commentId/", ({ params }) => {
        comments = comments.filter((item) => item.id !== Number(params.commentId));
        return new HttpResponse(null, { status: 204 });
      }),
    ],
  };
}

export function capacityPlanningFixture() {
  let sprint: Sprint;
  let data: SprintCapacity;
  function reset() {
    sprint = {
      ...mockSprints[0],
      can_manage: true,
      start_date: "2026-12-01",
      end_date: "2026-12-14",
    };
    data = {
      sprint_id: sprint.id,
      can_manage: true,
      has_dates: true,
      working_days: 10,
      holiday_days: 0,
      members: [
        {
          id: 1,
          name: "Avery Morgan",
          photo_url: null,
          role: "owner",
          job_title: "Product manager",
          removal_date: null,
          baseline_points: 20,
          allocation_percent: 100,
          available_days: 10,
          absence_days: 0,
          available_points: 20,
          assigned_points: 5,
          can_log_absence: true,
        },
      ],
      summary: {
        member_count: 1,
        configured_members: 1,
        all_configured: true,
        combined_points: 20,
        suggested_capacity_points: 20,
        planned_points: 5,
        unassigned_points: 0,
        outside_team_points: 0,
        headroom_points: 15,
        members_with_time_off: 0,
      },
      calendar: [{ date: "2026-12-01", weekend: false, holidays: [], available_members: 1 }],
      absences: [],
      holidays: [],
    };
  }
  reset();
  return {
    reset,
    handlers: [
      http.get("*/accounts/me/", () => HttpResponse.json(mockUser)),
      http.get("*/tasks/sprints/", () => HttpResponse.json([sprint])),
      http.get("*/tasks/sprints/:sprintId/capacity/", () => HttpResponse.json(data)),
      http.put("*/tasks/sprints/:sprintId/capacity/", async ({ request }) => {
        const input = (await request.json()) as { members: CapacityPlan };
        expect(input.members).toEqual([
          { user_id: 1, baseline_points: 30, allocation_percent: 50 },
        ]);
        Object.assign(data.members[0], {
          baseline_points: 30,
          allocation_percent: 50,
          available_points: 15,
        });
        Object.assign(data.summary, {
          combined_points: 15,
          suggested_capacity_points: 15,
          headroom_points: 10,
        });
        return HttpResponse.json(data);
      }),
      http.patch("*/tasks/sprints/:sprintId/", async ({ request }) => {
        const patch = (await request.json()) as Partial<Sprint>;
        expect(patch.capacity_points).toBe(15);
        sprint = { ...sprint, ...patch };
        return HttpResponse.json(sprint);
      }),
      http.post("*/tasks/sprints/:sprintId/capacity/absences/", async ({ request }) => {
        const input = (await request.json()) as AbsenceInput;
        expect(input).toMatchObject({
          user_id: 1,
          kind: "absence",
          day_fraction: 0.5,
          note: "Planning appointment",
        });
        data.absences.push({ id: 71, ...input, can_delete: true });
        return HttpResponse.json(data, { status: 201 });
      }),
      http.post("*/tasks/sprints/:sprintId/capacity/holidays/", async ({ request }) => {
        const input = (await request.json()) as HolidayInput;
        data.holidays.push({ id: 72, ...input, can_delete: true });
        return HttpResponse.json(data, { status: 201 });
      }),
      http.delete("*/tasks/sprints/:sprintId/capacity/absences/:entryId/", () => {
        data.absences = [];
        return HttpResponse.json(data);
      }),
      http.delete("*/tasks/sprints/:sprintId/capacity/holidays/:entryId/", () => {
        data.holidays = [];
        return HttpResponse.json(data);
      }),
    ],
  };
}
