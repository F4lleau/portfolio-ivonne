import re
import unicodedata
from apps.projects.models import Project
from apps.profiles.models import SiteProfile
from apps.technologies.models import Technology


def normalize(text):
    return "".join(
        c for c in unicodedata.normalize("NFKD", text.lower()) if not unicodedata.combining(c)
    )


def answer_question(question, locale):
    es = locale == "es"
    text = normalize(question)
    profile = SiteProfile.objects.filter(slug="main").first()
    if (
        any(
            word in text
            for word in (
                "contact",
                "email",
                "correo",
                "linkedin",
                "contratar",
                "hire",
                "disponib",
                "available",
            )
        )
        and profile
    ):
        return {
            "answer": f'{profile.availability.get(locale, "")} · {profile.email}',
            "projects": [],
            "links": [{"label": "Contacto" if es else "Contact", "url": "/contact"}],
        }
    if any(word in text for word in ("curriculum", "resume", "cv", "experiencia", "experience")):
        return {
            "answer": (
                "Podés ver la experiencia y descargar el CV actualizado."
                if es
                else "View the experience and download the current résumé."
            ),
            "projects": [],
            "links": [{"label": "CV", "url": "/cv"}],
        }
    query_tokens = set(re.findall(r"[a-z0-9+#.]+", text)) - {
        "hay",
        "algun",
        "proyecto",
        "proyectos",
        "con",
        "que",
        "hizo",
        "tiene",
        "tienes",
        "me",
        "de",
        "en",
        "el",
        "la",
        "a",
        "un",
        "una",
        "por",
        "favor",
        "show",
        "me",
        "any",
        "project",
        "projects",
        "with",
        "what",
        "did",
        "you",
        "do",
        "is",
        "there",
        "the",
        "and",
        "portfolio",
        "ver",
        "mostrar",
        "trabajos",
        "work",
        "your",
    }
    known = [normalize(name) for name in Technology.objects.values_list("name", flat=True)]
    requested_tech = [
        name for name in known if re.search(r"(?<!\w)" + re.escape(name) + r"(?!\w)", text)
    ]
    results = []
    for project in Project.objects.filter(published=True).prefetch_related("technologies"):
        corpus = normalize(
            " ".join(
                [
                    project.title.get(locale, ""),
                    project.summary.get(locale, ""),
                    project.description.get(locale, ""),
                    " ".join(t.name for t in project.technologies.all()),
                ]
            )
        )
        if requested_tech and not all(
            name in [normalize(t.name) for t in project.technologies.all()]
            for name in requested_tech
        ):
            continue
        score = sum(
            bool(re.search(r"(?<!\w)" + re.escape(token) + r"(?!\w)", corpus))
            for token in query_tokens
            if len(token) > 2
        )
        if score or not query_tokens or requested_tech:
            results.append((score, project))
    results.sort(key=lambda row: row[0], reverse=True)
    cards = [
        {
            "title": p.title.get(locale, p.slug),
            "summary": p.summary.get(locale, ""),
            "result": p.result.get(locale, ""),
            "url": f"/projects/{p.slug}",
        }
        for _, p in results[:3]
    ]
    return {
        "answer": (
            (
                "Estos son los proyectos publicados que encontré."
                if es
                else "These are the matching published projects."
            )
            if cards
            else (
                "Todavía no hay proyectos publicados que coincidan. Podés consultar el CV o contactar a Ivonne."
                if es
                else "No matching published projects yet. You can check the résumé or contact Ivonne."
            )
        ),
        "projects": cards,
        "links": (
            []
            if cards
            else [
                {"label": "CV", "url": "/cv"},
                {"label": "Contacto" if es else "Contact", "url": "/contact"},
            ]
        ),
    }
