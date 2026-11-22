"""Sprint forecasts from explicit budgets and project availability records."""
from datetime import timedelta
from decimal import Decimal, InvalidOperation, ROUND_DOWN

from django.utils import timezone
from projects.access import WRITE_TASK_ROLES
from projects.repositories import active_project_memberships
from projects.serializers.owner import person_summary
from tasks.models import ProjectAbsence, ProjectHoliday, SprintMemberCapacity


def capacity_members(project):
    return active_project_memberships(project).filter(
        role__role_name__in=WRITE_TASK_ROLES,
        user__is_active=True,
        user__organizations=project.organization,
    ).order_by("user__first_name", "user__email", "user_id")


def number(value):
    return float(value.quantize(Decimal("0.1"), rounding=ROUND_DOWN))


def estimate(value):
    try:
        result = Decimal(value or "0")
        return max(Decimal(0), result) if result.is_finite() else Decimal(0)
    except (InvalidOperation, TypeError, ValueError):
        return Decimal(0)


def capacity_report(sprint, request, can_manage):
    memberships = list(capacity_members(sprint.project))
    member_ids = {row.user_id for row in memberships}
    configured = {row.user_id: row for row in SprintMemberCapacity.objects.filter(sprint=sprint)}
    has_dates = bool(sprint.start_date and sprint.end_date)
    days = []
    if has_dates:
        days = [sprint.start_date + timedelta(days=offset) for offset in range((sprint.end_date - sprint.start_date).days + 1)]
    weekdays = [day for day in days if day.weekday() < 5]
    absences = list(ProjectAbsence.objects.filter(project=sprint.project, user_id__in=member_ids, start_date__lte=sprint.end_date, end_date__gte=sprint.start_date)) if has_dates else []
    holidays = list(ProjectHoliday.objects.filter(project=sprint.project, start_date__lte=sprint.end_date, end_date__gte=sprint.start_date)) if has_dates else []
    holiday_names = {day: [row.name for row in holidays if row.start_date <= day <= row.end_date] for day in days}
    tasks = list(sprint.tasks.exclude(status="backlog").values("assignee_id", "estimate"))
    assigned = {}
    for task in tasks:
        key = task["assignee_id"]
        assigned[key] = assigned.get(key, Decimal(0)) + estimate(task["estimate"])

    members = []
    daily = {day: Decimal(0) for day in days}
    for membership in memberships:
        user = membership.user
        plan = configured.get(user.pk)
        baseline = plan.baseline_points if plan else None
        allocation = plan.allocation_percent if plan else 100
        leave = {day: max((row.day_fraction for row in absences if row.user_id == user.pk and row.start_date <= day <= row.end_date), default=Decimal(0)) for day in weekdays}
        available = Decimal(0)
        leave_days = Decimal(0)
        for day in weekdays:
            if holiday_names[day] or (membership.removal_date and day >= membership.removal_date):
                continue
            leave_days += leave[day]
            remaining = 1 - leave[day]
            available += remaining
            daily[day] += remaining * Decimal(allocation) / 100
        capacity = (baseline * available / len(weekdays) * allocation / 100) if baseline is not None and weekdays else Decimal(0)
        members.append({
            **person_summary(user, request),
            "role": membership.role.role_name,
            "job_title": user.job_title,
            "removal_date": membership.removal_date,
            "baseline_points": float(baseline) if baseline is not None else None,
            "allocation_percent": allocation,
            "available_days": number(available) if has_dates else None,
            "absence_days": number(leave_days),
            "available_points": number(capacity) if baseline is not None and has_dates else None,
            "assigned_points": number(assigned.get(user.pk, Decimal(0))),
            "can_log_absence": can_manage or user.pk == request.user.pk,
        })
    combined = sum((Decimal(str(row["available_points"])) for row in members if row["available_points"] is not None), Decimal(0))
    planned = sum(assigned.values(), Decimal(0))
    all_configured = bool(members) and all(row["baseline_points"] is not None for row in members)
    return {
        "sprint_id": sprint.pk,
        "can_manage": can_manage,
        "has_dates": has_dates,
        "working_days": len(weekdays),
        "holiday_days": sum(bool(holiday_names[day]) for day in weekdays),
        "members": members,
        "summary": {
            "member_count": len(members),
            "configured_members": sum(row["baseline_points"] is not None for row in members),
            "all_configured": all_configured,
            "combined_points": number(combined) if has_dates else None,
            "suggested_capacity_points": int(combined) if has_dates and all_configured else None,
            "planned_points": number(planned),
            "unassigned_points": number(assigned.get(None, Decimal(0))),
            "outside_team_points": number(sum((value for key, value in assigned.items() if key is not None and key not in member_ids), Decimal(0))),
            "headroom_points": number(combined - planned) if has_dates and all_configured else None,
            "members_with_time_off": len({row.user_id for row in absences}),
        },
        "calendar": [{"date": day, "weekend": day.weekday() >= 5, "holidays": holiday_names[day], "available_members": number(daily[day])} for day in days],
        "absences": [{"id": row.pk, "user_id": row.user_id, "kind": row.kind, "start_date": row.start_date, "end_date": row.end_date, "day_fraction": float(row.day_fraction), "note": row.note, "can_delete": can_manage or row.user_id == request.user.pk} for row in absences],
        "holidays": [{"id": row.pk, "name": row.name, "start_date": row.start_date, "end_date": row.end_date, "can_delete": can_manage} for row in holidays],
    }
