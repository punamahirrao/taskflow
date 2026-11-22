from django.apps import AppConfig


class AccountsConfig(AppConfig):
    name = "accounts"

    def ready(self):
        from accounts.audit import connect_audit_signals

        connect_audit_signals()
