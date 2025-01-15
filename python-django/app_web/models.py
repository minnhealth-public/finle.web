import datetime
import uuid

from bs4 import BeautifulSoup
from ckeditor.fields import RichTextField
from django.contrib import admin
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models
from django.forms import ValidationError
from django.utils.translation import gettext_lazy as _
from django.utils.html import format_html


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
    requester = models.ForeignKey(User, on_delete=models.RESTRICT, null=True)
    date_resolved = models.DateField(blank=True, null=True)
    note = models.TextField(blank=True, null=True)

    def _possessive_name(self):
        name = self.requester.email
        return name + "'s" if name[-1] != "s" else name + "'"

    class Meta:
        abstract = True


class Review(models.Model):
    reviewer = models.ForeignKey(User, on_delete=models.RESTRICT)
    timestamp = models.DateTimeField(blank=True, null=True)
    note = models.TextField(blank=True, null=True)

    class Meta:
        abstract = True


###############################################################################
# CARETEAM MODEL
###############################################################################
class CareTeam(models.Model):
    name = models.CharField(max_length=32)
    is_setup_complete = models.BooleanField(default=False)
    team_members = models.ManyToManyField(
        User,
        through="CareTeamMember",
        through_fields=("team", "member"),
    )
    task_fields = models.ManyToManyField("TaskField", through="TeamTaskField", related_name="team")
    deleted_at = models.DateTimeField(blank=True, null=True)

    def __str__(self):
        return f"{self.name}"


class CareTeamMember(models.Model):
    member = models.ForeignKey(User, on_delete=models.CASCADE)
    team = models.ForeignKey(CareTeam, related_name="members", on_delete=models.CASCADE)
    relation = models.CharField(max_length=32)
    notification_count = models.IntegerField(default=0)
    is_careteam_admin = models.BooleanField(default=False)
    is_caree = models.BooleanField(default=False)


###############################################################################
# TOPIC MODEL
###############################################################################


class Topic(models.Model):
    name = models.CharField(max_length=32)
    description = models.TextField(blank=True)
    archived = models.BooleanField(default=False)

    def __str__(self):
        return self.name


###############################################################################
# TAG MODEL
###############################################################################


class Tag(models.Model):
    name = models.CharField(max_length=32)
    category = models.ForeignKey(Topic, blank=True, null=True, on_delete=models.RESTRICT)

    def validate_unique(self, exclude=None):
        super().validate_unique(exclude=exclude)
        existing_tags = Tag.objects.filter(name=self.name, category=self.category)
        if existing_tags.exists():
            raise ValidationError("A tag with this name and category already exists.")

    def __str__(self):
        return f"[{self.category.name}] {self.name}"


###############################################################################
# KEY TAKEAWAYS MODEL
###############################################################################


class KeyTakeaway(models.Model):
    text = models.TextField(blank=True, null=True)

    def set_text(self, new_value):
        self.text = new_value

    def get_text(self):
        return self.text

    def __str__(self):
        return self.text


###############################################################################
# CHANNEL MODEL
###############################################################################


class Channel(models.Model):
    name = models.CharField(max_length=255)
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

    class Quality(models.TextChoices):
        POOR = "POOR", _("Poor")
        GOOD = "GOOD", _("Good")
        EXCELLENT = "EXCELLENT", _("Excellent")

    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    streaming_service = models.CharField(max_length=7, choices=StreamingService.choices)
    video_id = models.CharField(max_length=32)
    channel = models.ForeignKey(Channel, on_delete=models.SET_NULL, blank=True, null=True)
    quality = models.CharField(max_length=10, choices=Quality.choices, default=Quality.GOOD)
    production_year = models.IntegerField(null=True, blank=True)
    archived = models.BooleanField(default=False)

    @property
    def url(self):
        source = self.streaming_service
        video_id = self.video_id
        if source == self.StreamingService.YOUTUBE:
            return "https://www.youtube.com/watch?v=" + video_id
        elif source == self.StreamingService.VIMEO:
            return "https://vimeo.com/" + video_id
        else:
            return ""

    @property
    def embeded_url(self):
        source = self.streaming_service
        video_id = self.video_id
        if source == self.StreamingService.YOUTUBE:
            return "https://www.youtube.com/embed/" + video_id
        elif source == self.StreamingService.VIMEO:
            return "https://player.vimeo.com/video/" + video_id
        else:
            return ""

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

    name = models.CharField(max_length=255)
    video = models.ForeignKey(Video, on_delete=models.CASCADE)
    type = models.CharField(max_length=6, choices=ClipType.choices)
    start_time = models.DurationField()
    end_time = models.DurationField()

    parent = models.ForeignKey("Clip", blank=True, null=True, on_delete=models.SET_NULL)
    topics_addressed = models.ManyToManyField(Topic, through="ClipAddressedTopic")
    tags = models.ManyToManyField(Tag, related_name="clips", blank=True, verbose_name="Tags")
    key_takeaways = models.ManyToManyField(KeyTakeaway, related_name="clips", blank=True, verbose_name="Takeaways")
    archived = models.BooleanField(default=False)
    speaker = models.CharField(max_length=32, blank=True, null=True)

    def __str__(self):
        return self.name

    @admin.display
    def video_clip(self):
        formated_html = (
            """
                <object data='{}?start={}&end={}' width='500px' height='300px'></object>
            """)

        if self.video.streaming_service == Video.StreamingService.VIMEO:
            formated_html = (
                """
                    <iframe
                        src="https://player.vimeo.com/video/{}#t={}s&end={}s"
                        width="500"
                        height="300"
                        frameborder="0"></iframe>
                """)
        return format_html(
            formated_html,
            self.video.embeded_url,
            self.start_time.seconds,
            self.end_time.seconds
        )


class ClipAddressedTopic(models.Model):
    clip = models.ForeignKey(Clip, on_delete=models.CASCADE)
    topic = models.ForeignKey(Topic, on_delete=models.RESTRICT)
    motivational = models.BooleanField(default=False)
    instructional = models.BooleanField(default=False)
    relevancy = models.FloatField(default=0.5, validators=[MinValueValidator(0.0), MaxValueValidator(1.0)])


class ClipReviewRequest(ReviewRequest):
    clip = models.ForeignKey(Clip, on_delete=models.CASCADE)

    # def __str__(self):
    #     return f'{self._possessive_name()} review request for "{self.clip.name}" clip on {self.date_issued!s}'
    def __str__(self):
        return f'Review request for "{self.clip.name}"'


class ClipReview(Review):
    request = models.ForeignKey(ClipReviewRequest, related_name="request", on_delete=models.RESTRICT)


###############################################################################
# CLIP USER MODEL
###############################################################################
class ClipUser(models.Model):
    class Meta:
        unique_together = (("clip", "user"),)

    clip = models.ForeignKey(Clip, on_delete=models.CASCADE, related_name="user_info")
    user = models.ForeignKey(User, on_delete=models.CASCADE, blank=False)
    saved = models.BooleanField(default=False)
    saved_timestamp = models.DateTimeField(blank=True, null=True)
    watched = models.BooleanField(default=False)
    rating = models.IntegerField(blank=True, null=True)
    watched_timestamp = models.DateTimeField(blank=True, null=True)


###############################################################################
# FEATURED CLIP MODEL
###############################################################################
class FeaturedClip(models.Model):
    clip = models.ForeignKey(Clip, related_name="featured_clip", on_delete=models.CASCADE)


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
# GLOSSARY TERM REVIEW MODEL
###############################################################################
class GlossaryTermReviewRequest(ReviewRequest):
    term = models.ForeignKey(GlossaryTerm, on_delete=models.CASCADE)

    def __str__(self):
        return f'Review request for "{self.term.term}"'


class GlossaryTermReview(Review):
    request = models.ForeignKey(GlossaryTermReviewRequest, related_name="request", on_delete=models.RESTRICT)


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


###############################################################################
# RESOURCE MODEL
###############################################################################
class Resource(models.Model):
    class ResourceType(models.TextChoices):
        ARTICLE = "ARTICLE", _("Article")
        BROCHURE = "BROCHURE", _("Brochure")
        WORKSHEET = "WORKSHEET", _("Worksheet")
        WORKBOOK = "WORKBOOK", _("Workbook")
        BOOK = "BOOK", _("Book")
        WEB_TOOL = "WEB_TOOL", _("Web Tool")

    title = models.CharField(max_length=128)
    description = models.TextField(blank=False)
    link = models.URLField(blank=True, null=True)
    file = models.FileField(upload_to="resources/", blank=True, null=True)
    type = models.CharField(max_length=10, choices=ResourceType.choices)
    is_free = models.BooleanField(default=True)
    requires_account = models.BooleanField(default=False)

    def __str__(self):
        return self.title


###############################################################################
# RESOURCE REVIEW MODEL
###############################################################################
class ResourceReviewRequest(ReviewRequest):
    resource = models.ForeignKey(Resource, on_delete=models.CASCADE)

    def __str__(self):
        return f'Review request for "{self.resource.title}"'


class ResourceReview(Review):
    request = models.ForeignKey(ResourceReviewRequest, related_name="request", on_delete=models.RESTRICT)


###############################################################################
# TASK MODEL
###############################################################################
class Priority(models.Model):
    value = models.IntegerField(unique=True)

    class Meta:
        verbose_name_plural = "priorities"

    def __str__(self):
        return str(self.value)


def validate_full_description(full_description):
    soup = BeautifulSoup(full_description, "html.parser")

    # Extract all input elements
    input_elements = soup.find_all("input, textarea")

    for input_elem in input_elements:
        if not input_elem.get("name"):
            raise ValidationError("Name must be provided for inputs")

    return full_description


class Task(models.Model):
    title = models.CharField(max_length=128)
    short_description = models.TextField(blank=False)
    full_description = RichTextField(blank=False, validators=[validate_full_description])
    topic = models.ForeignKey(Topic, related_name="tasks", on_delete=models.RESTRICT)
    related_terms = models.ManyToManyField(
        GlossaryTerm,
        related_name="tasks",
        blank=True,
        verbose_name="Glossary Terms",
    )
    related_tags = models.ManyToManyField(Tag, related_name="tasks", blank=True, verbose_name="Tags")
    related_resources = models.ManyToManyField(Resource, related_name="tasks", blank=True, verbose_name="Resources")
    is_setup_question = models.BooleanField(default=False)
    ranking = models.OneToOneField(Priority, on_delete=models.SET_NULL, related_name="priority", null=True, blank=True)

    def set_full_description(self, new_value):
        self.full_description = new_value

    def get_full_description(self):
        return self.full_description

    def __str__(self):
        return self.title


class TeamTask(models.Model):
    task = models.ForeignKey(Task, on_delete=models.CASCADE)
    team = models.ForeignKey(CareTeam, on_delete=models.CASCADE)
    modified_timestamp = models.DateTimeField(blank=True, null=True)
    completed_timestamp = models.DateTimeField(blank=True, null=True)


###############################################################################
# FIELD MODEL
###############################################################################
class TaskField(models.Model):
    class TaskFieldType(models.TextChoices):
        TEXTAREA = "TEXTAREA", _("Textarea")
        INPUT = "INPUT", _("Input")

    label = models.CharField(max_length=64)
    description = models.TextField(blank=True)
    required = models.BooleanField(default=False)
    type = models.CharField(max_length=10, choices=TaskFieldType.choices)
    task = models.ForeignKey(Task, on_delete=models.CASCADE)

    def __str__(self):
        return self.label


class TeamTaskField(models.Model):
    class Meta:
        unique_together = (("team", "task_field"),)

    team = models.ForeignKey(CareTeam, on_delete=models.CASCADE)
    task_field = models.ForeignKey(TaskField, on_delete=models.CASCADE)
    value = models.TextField(blank=True, default="")
    user = models.ForeignKey(User, on_delete=models.CASCADE, blank=False)
    completed_timestamp = models.DateTimeField(blank=True, null=True)


###############################################################################
# TASK REVIEW MODEL
###############################################################################
class TaskReviewRequest(ReviewRequest):
    task = models.ForeignKey(Task, on_delete=models.CASCADE)

    def __str__(self):
        return f'Review request for "{self.task.title}"'


class TaskReview(Review):
    request = models.ForeignKey(TaskReviewRequest, related_name="request", on_delete=models.RESTRICT)


###############################################################################
# NOTE MODEL
###############################################################################
class Note(models.Model):
    text = models.TextField()
    team = models.ForeignKey(CareTeam, related_name="care_team_notes", on_delete=models.CASCADE)
    user = models.ForeignKey(User, related_name="user_notes", on_delete=models.CASCADE)
    video = models.ForeignKey(Video, on_delete=models.CASCADE, blank=True, null=True)
    clip = models.ForeignKey(Clip, on_delete=models.CASCADE, blank=True, null=True)
    glossary = models.ForeignKey(GlossaryTerm, on_delete=models.CASCADE, blank=True, null=True)
    resource = models.ForeignKey(Resource, on_delete=models.CASCADE, blank=True, null=True)
    task = models.ForeignKey(Task, on_delete=models.CASCADE, blank=True, null=True)
    pinned = models.BooleanField(default=False)
    ctime = models.DateTimeField(auto_now_add=True)


###############################################################################
# Access Token MODEL
###############################################################################
class AccessToken(models.Model):
    # This model is used to provide access without providing a login
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    access_token = models.TextField()
    expiration_date = models.DateField(blank=True, null=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name="user_access_grants")
    created_for = models.ForeignKey(User, on_delete=models.CASCADE)
