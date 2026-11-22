"""Request-scoped audit records. Never store passwords, tokens or document contents."""

from contextvars import ContextVar

from django.db.models.signals import post_save, pre_delete

current_request = ContextVar("audit_request", default=None)


class AuditContextMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        token = current_request.set(request)
        try:
            return self.get_response(request)
        finally:
            current_request.reset(token)


def record_change(sender, instance, created=False, **kwargs):
    from accounts.models import AuditEvent

    request = current_request.get()
    actor = getattr(request, "user", None)
    if not actor or not actor.is_authenticated or not actor.active_organization_id:
        return
    organization_id = getattr(instance, "organization_id", None)
    project = getattr(instance, "project", None)
    if not organization_id and project:
        organization_id = project.organization_id
    if sender._meta.label_lower == "accounts.organization":
        organization_id = instance.pk
    if not organization_id:
        organization_id = actor.active_organization_id
    if organization_id != actor.active_organization_id:
        return
    deleting = kwargs.get("signal") == pre_delete
    AuditEvent.objects.create(
        organization_id=organization_id,
        actor=actor,
        action="deleted" if deleting else "created" if created else "updated",
        entity_type=sender._meta.label_lower,
        entity_id=str(instance.pk),
        summary=str(
            getattr(instance, "title", None)
            or getattr(instance, "name", None)
            or sender._meta.verbose_name
        )[:255],
    )


def connect_audit_signals():
    from django.apps import apps

    for label in (
        "accounts.User",
        "accounts.Organization",
        "accounts.OrganizationMembership",
        "accounts.NavigationPreference",
        "accounts.TypographyPreference",
        "projects.Project",
        "projects.ProjectMembership",
        "projects.PlanningItem",
        "tasks.Task",
        "tasks.TaskComment",
        "tasks.Sprint",
        "tasks.AgileBoard",
        "documents.Document",
        "documents.Folder",
        "documents.ResourceLink",
    ):
        model = apps.get_model(label)
        post_save.connect(
            record_change, sender=model, dispatch_uid=f"audit-save-{label}"
        )
        pre_delete.connect(
            record_change, sender=model, dispatch_uid=f"audit-delete-{label}"
        )
