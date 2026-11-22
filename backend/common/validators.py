from django.core.exceptions import ValidationError
from math import isfinite


def validate_date_range(
    start_date, end_date, *, start_label="start date", end_label="end date"
):
    if start_date and end_date and end_date < start_date:
        raise ValidationError(
            {
                end_label.replace(
                    " ", "_"
                ): f"{end_label.capitalize()} must be on or after the {start_label}."
            }
        )


def validate_project_dates(start_date, end_date):
    validate_date_range(
        start_date, end_date, start_label="expected start date", end_label="end date"
    )


def validate_sprint_dates(start_date, end_date):
    validate_date_range(
        start_date,
        end_date,
        start_label="sprint start date",
        end_label="sprint end date",
    )


def validate_task_estimate(value):
    if value in (None, ""):
        return
    try:
        estimate = float(value)
    except (TypeError, ValueError) as error:
        raise ValidationError("Estimate must be a non-negative number.") from error
    if not isfinite(estimate) or estimate < 0:
        raise ValidationError("Estimate must be a non-negative number.")


def validate_board_name(name):
    if not isinstance(name, str) or not name.strip():
        raise ValidationError("Enter a board name.")
    if len(name.strip()) > 100:
        raise ValidationError("Board names must contain 100 characters or fewer.")


def validate_role_assignment(actor_role, target_role, can_assign):
    if not can_assign(actor_role, target_role):
        raise ValidationError(f"You cannot assign the {target_role} role.")
