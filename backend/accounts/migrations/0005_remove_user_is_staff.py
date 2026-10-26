from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ("accounts", "0004_siteadmin_from_is_staff"),
    ]

    operations = [
        migrations.RemoveField(
            model_name="user",
            name="is_staff",
        ),
    ]
