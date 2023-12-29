import datetime

from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models
from django.utils.translation import gettext_lazy as _

# Resources
# * https://docs.djangoproject.com/en/4.1/intro/tutorial02/
# * https://docs.djangoproject.com/en/4.1/topics/db/models/
# * https://docs.djangoproject.com/en/4.1/ref/models/fields/#lazy-relationships
# * https://developerhowto.com/2018/12/10/using-database-models-in-python-and-django/


###############################################################################
# USER MODEL and BaseModelManager
###############################################################################


class UserManager(BaseUserManager):
    """Custom user manager to deal with the change in username field"""

    def create_user(self, email, password=None):
        """Creates and saves a User with the given email, date of
        birth and password.
        """
        if not email:
            raise ValueError("Users must have an email address")

        user = self.model(
            email=self.normalize_email(email),
        )

        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None):
        """Creates and saves a superuser with the given email, date of
        birth and password.
        """
        user = self.create_user(
            email,
            password=password,
        )
        user.is_superuser = True
        user.is_staff = True
        user.save(using=self._db)
        return user


class User(AbstractUser):
    """User model for logging in and associating with information related to an account"""

    class UserType(models.TextChoices):
        """This may be less strict in the feature but for now this is options for who the user is."""

        PERSON_WITH_DEMENTIA = "PWD", _("Person with Dementia")
        CAREGIVER = "CG", _("Caregiver")
        FRIEND_AND_FAMILY = "FNF", _("Trusted Friend and Family")

    # Needed for overriding the createsuperuser
    objects = UserManager()
    email = models.EmailField(max_length=255, unique=True)
    password = models.CharField(max_length=255)

    # TODO type should be an association to the user since a user can be in many groups.
    # type = models.CharField(max_length=3, choices=UserType.choices, default=UserType.PERSON_WITH_DEMENTIA)

    # email should be the username for use of use
    username = None

    USERNAME_FIELD = "email"

    # Needed for create superuser
    REQUIRED_FIELDS = []

    # topics_engaged = models.ManyToManyField(Topic, through='UserEngagedTopic')
    # clips_watched = models.ManyToManyField(Clip, through='UserWatchedClip')
    # fields_completed = models.ManyToManyField(Field, through='UserCompletedField')

    def __str__(self) -> str:
        return self.email


###############################################################################
# ABSTRACT REVIEW MODEL
###############################################################################


class ReviewRequest(models.Model):
    date_issued = models.DateField(default=datetime.date.today)
    curator = models.ForeignKey(User, related_name="curator", on_delete=models.RESTRICT)
    curator_notes = models.TextField()
    date_resolved = models.DateField(blank=True, null=True)
    reviewer = models.ForeignKey(User, related_name="reviewer", on_delete=models.RESTRICT, blank=True, null=True)
    reviewer_notes = models.TextField(blank=True, null=True)
    closed = models.BooleanField()

    def _possessive_name(self):
        name = self.curator.first_name
        return name + "'s" if name[-1] != "s" else name + "'"

    class Meta:
        abstract = True


###############################################################################
# CARETEAM MODEL
###############################################################################
class CareTeam(models.Model):
    name = models.CharField(max_length=32)
    team_members = models.ManyToManyField(
        User,
        through="CareTeamMember",
        through_fields=("team", "member"),
    )

    def __str__(self):
        return f"{self.name}"


class CareTeamMember(models.Model):
    member = models.ForeignKey(User, on_delete=models.CASCADE)
    team = models.ForeignKey(CareTeam, related_name="members", on_delete=models.CASCADE)
    relation = models.CharField(max_length=32)
    is_careteam_admin = models.BooleanField(default=False)

    def __str__(self):
        return self.m


###############################################################################
# TOPIC MODEL
###############################################################################


class Topic(models.Model):
    name = models.CharField(max_length=32)
    description = models.TextField(blank=True)

    def __str__(self):
        return self.name


###############################################################################
# TAG MODEL
###############################################################################


class Tag(models.Model):
    name = models.CharField(max_length=32)
    category = models.ForeignKey(Topic, blank=True, null=True, on_delete=models.RESTRICT)

    def __str__(self):
        return self.name


###############################################################################
# FIELD MODEL
###############################################################################


class Field(models.Model):
    topic = models.ForeignKey(Topic, on_delete=models.CASCADE)
    name = models.CharField(max_length=64)
    description = models.TextField(blank=True)

    def __str__(self):
        return self.name


###############################################################################
# CHANNEL MODEL
###############################################################################


class Channel(models.Model):
    name = models.CharField(max_length=64)
    description = models.TextField(blank=True)

    def __str__(self):
        return self.name


###############################################################################
# VIDEO MODEL
###############################################################################


# TODO: Add resettable count of playback failures.
class Video(models.Model):
    class StreamingService(models.TextChoices):
        YOUTUBE = "YOUTUBE", _("YouTube")
        VIMEO = "VIMEO", _("Vimeo")

    name = models.CharField(max_length=64)
    description = models.TextField(blank=True)
    streaming_service = models.CharField(max_length=7, choices=StreamingService.choices)
    video_id = models.CharField(max_length=32)
    channel = models.ForeignKey(Channel, on_delete=models.SET_NULL, blank=True, null=True)

    def __str__(self):
        return self.name


###############################################################################
# CLIP MODEL
###############################################################################


class Clip(models.Model):
    class ClipType(models.TextChoices):
        SHORT = "SHORT", _("Short")
        MEDIUM = "MEDIUM", _("Medium")
        LONG = "LONG", _("Long")

    name = models.CharField(max_length=64)
    description = models.TextField(blank=True)
    video = models.ForeignKey(Video, on_delete=models.CASCADE)
    type = models.CharField(max_length=6, choices=ClipType.choices)
    start_time = models.DurationField()
    end_time = models.DurationField()

    parent = models.ForeignKey("Clip", blank=True, null=True, on_delete=models.SET_NULL)
    topics_addressed = models.ManyToManyField(Topic, through="ClipAddressedTopic")
    tags = models.ManyToManyField(Tag, related_name="clips")

    def __str__(self):
        return self.name


class ClipAddressedTopic(models.Model):
    clip = models.ForeignKey(Clip, on_delete=models.CASCADE)
    topic = models.ForeignKey(Topic, on_delete=models.RESTRICT)
    motivational = models.BooleanField(default=False)
    instructional = models.BooleanField(default=False)
    relevancy = models.FloatField(default=0.5, validators=[MinValueValidator(0.0), MaxValueValidator(1.0)])


class ClipReviewRequest(ReviewRequest):
    clip = models.ForeignKey(Clip, on_delete=models.CASCADE)

    def __str__(self):
        return f'{self._possessive_name()} review request for "{self.clip.name}" clip on {self.date_issued!s}'


###############################################################################
# GLOSSARY TERM MODEL
###############################################################################
class GlossaryTerm(models.Model):
    term = models.CharField(max_length=64)
    definition = models.TextField(blank=False)
    source = models.URLField()
    related_terms = models.ManyToManyField("self", through="GlossaryRelatedTerms")
    related_clips = models.ManyToManyField(Clip, through="GlossaryRelatedClips")

    def __str__(self):
        return self.term


class GlossaryRelatedTerms(models.Model):
    original_term = models.ForeignKey(GlossaryTerm, on_delete=models.SET_NULL, null=True)
    related_term = models.ForeignKey(GlossaryTerm, on_delete=models.CASCADE, related_name="related_term")

    def __str__(self):
        return self.related_term.term


class GlossaryRelatedClips(models.Model):
    glossary_term = models.ForeignKey(GlossaryTerm, on_delete=models.SET_NULL, null=True)
    related_clip = models.ForeignKey(Clip, on_delete=models.CASCADE)

    def __str__(self):
        return self.related_clip.name


###############################################################################
# STORY MODEL
###############################################################################
class Story(models.Model):
    class Meta:
        verbose_name_plural = "stories"

    title = models.CharField(max_length=64)
    short_description = models.TextField(blank=False)
    full_story = models.TextField(blank=False)
    video_url = models.URLField()

    def __str__(self):
        return self.title


###############################################################################
# PARTNER MODEL
###############################################################################
class Partner(models.Model):
    name = models.CharField(max_length=64)
    description = models.TextField(blank=False)
    logo = models.URLField()
    link = models.URLField()

    def __str__(self):
        return self.name


# class UserEngagedTopic(models.Model):
#     user = models.ForeignKey(User, on_delete=models.CASCADE)
#     topic = models.ForeignKey(Topic, on_delete=models.CASCADE)
#     start_timestamp = models.DateTimeField(auto_now_add=True)
#     completed_timestamp = models.DateTimeField(blank=True, null=True)
#
#
# class UserWatchedClip(models.Model):
#     user = models.ForeignKey(User, on_delete=models.CASCADE)
#     clip = models.ForeignKey(Clip, on_delete=models.CASCADE)
#     watched_duration = models.DurationField()
#     rating = models.FloatField(blank=True, null=True)
#
#
# class UserCompletedField(models.Model):
#     user = models.ForeignKey(User, on_delete=models.CASCADE)
#     field = models.ForeignKey(Field, on_delete=models.CASCADE)
#     value = models.TextField()
