import factory
from factory.django import DjangoModelFactory
from django.contrib.auth.hashers import make_password

from accounts.models import Organization, User
from projects.models import Project, ProjectMembership, ProjectRole
from tasks.models import AgileBoard, Sprint, Task


class UserFactory(DjangoModelFactory):
    class Meta:
        model = User
        skip_postgeneration_save = True

    email = factory.Sequence(lambda n: f"agile-user-{n}@example.test")
    first_name = factory.Faker("first_name")
    last_name = factory.Faker("last_name")
    job_title = factory.Faker("job")
    account_type = "organization"
    password = factory.LazyFunction(lambda: make_password("TaskFlowTest-2026!"))
    active_organization = factory.LazyFunction(
        lambda: Organization.objects.get_or_create(name="Factory organization")[0]
    )

    @factory.post_generation
    def organizations(user, create, extracted, **kwargs):
        if create:
            user.organizations.add(*(extracted or [user.active_organization]))


class ProjectFactory(DjangoModelFactory):
    class Meta:
        model = Project
        skip_postgeneration_save = True

    name = factory.Sequence(lambda n: f"Test Project {n}")
    description = factory.Faker("sentence")
    status = Project.STATUS_IN_PROGRESS
    organization = factory.LazyFunction(
        lambda: Organization.objects.get_or_create(name="Factory organization")[0]
    )

    @factory.post_generation
    def owner(project, create, extracted, **kwargs):
        if not create:
            return
        owner = extracted or UserFactory()
        role, _ = ProjectRole.objects.get_or_create(role_name=ProjectRole.OWNER)
        ProjectMembership.objects.get_or_create(
            project=project, user=owner, defaults={"role": role}
        )


class BoardFactory(DjangoModelFactory):
    class Meta:
        model = AgileBoard
        skip_postgeneration_save = True

    project = factory.SubFactory(ProjectFactory)
    owner = factory.SubFactory(UserFactory)
    name = factory.Sequence(lambda n: f"Test Board {n}")
    description = factory.Faker("sentence")
    board_type = AgileBoard.SCRUM

    @factory.post_generation
    def members(board, create, extracted, **kwargs):
        if create:
            board.members.add(*(extracted or [board.owner]))


class SprintFactory(DjangoModelFactory):
    class Meta:
        model = Sprint

    project = factory.SubFactory(ProjectFactory)
    name = factory.Sequence(lambda n: f"Test Sprint {n}")
    goal = factory.Faker("sentence")
    is_active = False
    is_closed = False


class TaskFactory(DjangoModelFactory):
    class Meta:
        model = Task

    project = factory.SubFactory(ProjectFactory)
    created_by = factory.SubFactory(UserFactory)
    title = factory.Sequence(lambda n: f"Test task {n}")
    description = factory.Faker("sentence")
    status = "backlog"
    work_type = "task"
    priority = "medium"
    estimate = "3"
    tags = factory.LazyFunction(lambda: ["testing"])
