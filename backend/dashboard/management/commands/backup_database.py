from datetime import datetime
from pathlib import Path
import sqlite3

from django.conf import settings
from django.core.management.base import BaseCommand, CommandError


class Command(BaseCommand):
    help = "Make a consistent SQLite snapshot. For PostgreSQL use pg_dump."

    def add_arguments(self, parser):
        parser.add_argument("--output", type=Path)

    def handle(self, *args, **options):
        db = settings.DATABASES["default"]
        if db["ENGINE"] != "django.db.backends.sqlite3":
            raise CommandError("Use pg_dump for a PostgreSQL backup.")
        source = Path(db["NAME"]).resolve()
        target = (
            options["output"]
            or settings.BASE_DIR
            / "backups"
            / f"{settings.DATA_ENV}-{datetime.now():%Y%m%d-%H%M%S}.sqlite3"
        ).resolve()
        if target == source or target.exists():
            raise CommandError(
                "The destination must be a new file, different from the active database."
            )
        if not source.exists():
            raise CommandError("The source database does not exist.")
        target.parent.mkdir(parents=True, exist_ok=True)
        with (
            sqlite3.connect(f"file:{source.as_posix()}?mode=ro", uri=True) as src,
            sqlite3.connect(target) as dest,
        ):
            src.backup(dest)
            if dest.execute("PRAGMA integrity_check").fetchone()[0] != "ok":
                raise CommandError("Backup integrity check failed.")
        self.stdout.write(self.style.SUCCESS(str(target)))
