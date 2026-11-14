from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [("accounts", "0008_user_about_me_alter_user_job_title")]

    operations = [
        migrations.AddField(
            model_name="user",
            name="account_type",
            field=models.CharField(
                choices=[("private", "Private"), ("organization", "Organization")],
                default="private",
                max_length=20,
            ),
        ),
    ]
