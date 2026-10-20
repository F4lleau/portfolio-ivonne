import logging
from django.conf import settings
from django.core.mail import send_mail

logger = logging.getLogger(__name__)


def notify_contact(name, email, message):
    if not settings.EMAIL_HOST:
        return
    try:
        send_mail(
            f"Portfolio: nuevo mensaje de {name}",
            f"De: {name} <{email}>\n\n{message}",
            settings.DEFAULT_FROM_EMAIL,
            [settings.CONTACT_NOTIFY_EMAIL],
        )
    except Exception:
        logger.exception("Contact saved; email notification could not be delivered")
