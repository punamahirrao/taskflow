from django.urls import reverse


def person_summary(user, request):
    photo_url = None
    if user.profile_photo:
        path = reverse("profile_photo", args=[user.profile_photo.name])
        photo_url = request.build_absolute_uri(path) if request else path
    return {
        "id": user.pk,
        "name": user.get_full_name() or user.email,
        "photo_url": photo_url,
    }
