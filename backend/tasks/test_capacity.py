from datetime import date
from decimal import Decimal

from projects.tests.base import RolesBase
from projects.models import ProjectMembership
from tasks.models import ProjectAbsence, ProjectHoliday, Sprint, SprintMemberCapacity, Task


class SprintCapacityTests(RolesBase):
    def setUp(self):
        super().setUp()
        self.sprint = Sprint.objects.create(project=self.project, name="December planning", start_date="2026-12-07", end_date="2026-12-18")
        self.url = f"/tasks/sprints/{self.sprint.pk}/capacity/"
        self.plan = {"members": [{"user_id": user.pk, "baseline_points": "20.0", "allocation_percent": 100} for user in (self.owner, self.padmin, self.member)]}

    def save_plan(self):
        response = self.as_user(self.owner).put(self.url, self.plan, format="json")
        self.assertEqual(response.status_code, 200, response.content)
        return response.json()

    def log(self, path, body, actor=None):
        return self.as_user(actor or self.owner).post(self.url + path + "/", body, format="json")

    def test_real_members_and_unconfigured_capacity(self):
        data = self.as_user(self.member).get(self.url).json()
        self.assertEqual(data["summary"]["member_count"], 3)
        self.assertEqual(data["working_days"], 10)
        self.assertFalse(data["summary"]["all_configured"])
        self.assertIsNone(data["summary"]["suggested_capacity_points"])
        self.assertFalse(data["can_manage"])
        self.assertNotIn(self.viewer.pk, [member["id"] for member in data["members"]])

    def test_budgets_persist_and_allocation_scales_capacity(self):
        self.plan["members"][2]["allocation_percent"] = 50
        self.assertEqual(self.save_plan()["summary"]["combined_points"], 50)
        self.assertEqual(self.as_user(self.owner).get(self.url).json()["summary"]["combined_points"], 50)
        self.assertEqual(SprintMemberCapacity.objects.count(), 3)

    def test_holidays_absences_weekends_and_overlap_are_not_double_counted(self):
        self.save_plan()
        self.assertEqual(self.log("holidays", {"name": "Team holiday", "start_date": "2026-12-10", "end_date": "2026-12-10"}).status_code, 201)
        body = {"user_id": self.member.pk, "kind": "vacation", "start_date": "2026-12-09", "end_date": "2026-12-10", "day_fraction": 1}
        self.assertEqual(self.log("absences", body, self.member).status_code, 201)
        self.log("absences", {**body, "day_fraction": 0.5}, self.member)
        self.log("absences", {**body, "start_date": "2026-12-12", "end_date": "2026-12-13"}, self.member)
        data = self.as_user(self.owner).get(self.url).json()
        self.assertEqual(data["summary"]["combined_points"], 52)
        member = next(row for row in data["members"] if row["id"] == self.member.pk)
        self.assertEqual(member["absence_days"], 1)
        self.assertEqual(member["available_days"], 8)
        self.assertEqual(data["holiday_days"], 1)
        self.assertEqual(next(day for day in data["calendar"] if day["date"] == "2026-12-09")["available_members"], 2)

    def test_half_day_and_rounding_never_inflate_the_forecast(self):
        self.plan["members"] = [{"user_id": self.member.pk, "baseline_points": "3.5", "allocation_percent": 33}]
        self.save_plan()
        result = self.log("absences", {"user_id": self.member.pk, "kind": "absence", "start_date": "2026-12-07", "end_date": "2026-12-07", "day_fraction": 0.5}, self.member)
        member = next(row for row in result.json()["members"] if row["id"] == self.member.pk)
        self.assertEqual(member["available_days"], 9.5)
        self.assertEqual(member["available_points"], 1)

    def test_planned_and_unassigned_work_is_sprint_scoped(self):
        self.save_plan()
        for assignee, estimate in ((self.member, "8"), (None, "3"), (self.viewer, "2"), (None, "NaN")):
            Task.objects.create(project=self.project, sprint=self.sprint, title="Planned", status="todo", assignee=assignee, estimate=estimate)
        Task.objects.create(project=self.project, sprint=self.sprint, title="Backlog excluded", status="backlog", estimate="99")
        data = self.as_user(self.owner).get(self.url).json()
        self.assertEqual(data["summary"]["planned_points"], 13)
        self.assertEqual(data["summary"]["unassigned_points"], 3)
        self.assertEqual(data["summary"]["outside_team_points"], 2)
        self.assertEqual(data["summary"]["headroom_points"], 47)

    def test_membership_end_reduces_available_days(self):
        self.save_plan()
        ProjectMembership.objects.filter(project=self.project, user=self.member).update(removal_date=date(2026, 12, 17))
        member = next(row for row in self.as_user(self.owner).get(self.url).json()["members"] if row["id"] == self.member.pk)
        self.assertEqual(member["available_days"], 8)
        self.assertEqual(member["available_points"], 16)

    def test_member_can_only_log_and_remove_own_absences(self):
        body = {"user_id": self.owner.pk, "kind": "absence", "start_date": "2026-12-07", "end_date": "2026-12-07", "day_fraction": 1}
        self.assertEqual(self.log("absences", body, self.member).status_code, 403)
        self.assertEqual(self.log("absences", {**body, "user_id": self.member.pk}, self.member).status_code, 201)
        entry = ProjectAbsence.objects.get()
        self.assertEqual(self.as_user(self.padmin).delete(f"{self.url}absences/{entry.pk}/").status_code, 200)
        self.assertFalse(ProjectAbsence.objects.exists())

    def test_only_managers_can_change_plans_and_holidays(self):
        for actor in (self.member, self.viewer):
            self.assertEqual(self.as_user(actor).put(self.url, self.plan, format="json").status_code, 403)
            self.assertEqual(self.log("holidays", {"name": "Holiday", "start_date": "2026-12-07", "end_date": "2026-12-07"}, actor).status_code, 403)
        self.assertEqual(self.as_user(self.stranger).get(self.url).status_code, 404)

    def test_foreign_member_invalid_values_and_duplicate_rows_are_atomic(self):
        for row in ({"user_id": self.stranger.pk}, {"allocation_percent": 101}, {"baseline_points": "-1"}, {"baseline_points": "NaN"}):
            invalid = {"members": [self.plan["members"][0], {**self.plan["members"][1], **row}]}
            self.assertEqual(self.as_user(self.owner).put(self.url, invalid, format="json").status_code, 400)
            self.assertFalse(SprintMemberCapacity.objects.exists())
        self.assertEqual(self.as_user(self.owner).put(self.url, {"members": [self.plan["members"][0]] * 2}, format="json").status_code, 400)

    def test_dates_and_fraction_validation(self):
        body = {"user_id": self.member.pk, "kind": "vacation", "start_date": "2026-12-09", "end_date": "2026-12-08", "day_fraction": 1}
        self.assertEqual(self.log("absences", body).status_code, 400)
        self.assertEqual(self.log("absences", {**body, "end_date": "2026-12-10", "day_fraction": 0.2}).status_code, 400)
        self.assertEqual(self.log("holidays", {"name": "Outside", "start_date": "2027-01-01", "end_date": "2027-01-01"}).status_code, 400)
        self.assertFalse(ProjectAbsence.objects.exists())

    def test_project_calendar_is_reused_in_overlapping_sprints_and_deletions_are_scoped(self):
        other_sprint = Sprint.objects.create(project=self.project, name="Overlapping", start_date="2026-12-07", end_date="2026-12-11")
        self.log("holidays", {"name": "Shared holiday", "start_date": "2026-12-08", "end_date": "2026-12-08"})
        self.assertEqual(len(self.as_user(self.owner).get(f"/tasks/sprints/{other_sprint.pk}/capacity/").json()["holidays"]), 1)
        foreign = ProjectHoliday.objects.create(project=self.other, name="Private", start_date="2026-12-08", end_date="2026-12-08")
        self.assertEqual(self.client.delete(f"{self.url}holidays/{foreign.pk}/").status_code, 404)

    def test_missing_dates_and_weekend_only_sprints(self):
        self.sprint.start_date = None
        self.sprint.save()
        data = self.save_plan()
        self.assertFalse(data["has_dates"])
        self.assertIsNone(data["summary"]["combined_points"])
        self.sprint.start_date, self.sprint.end_date = date(2026, 12, 12), date(2026, 12, 13)
        self.sprint.save()
        self.assertEqual(self.as_user(self.owner).get(self.url).json()["summary"]["combined_points"], 0)
