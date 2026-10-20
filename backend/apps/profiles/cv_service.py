from io import BytesIO
from xml.sax.saxutils import escape
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak, KeepTogether


def build_cv(profile, locale="es"):
    es = locale == "es"
    tr = lambda value: (
        value.get(locale, value.get("es", "")) if isinstance(value, dict) else str(value)
    )
    text = lambda value: (
        escape(tr(value)).replace("Actualidad", "Present") if not es else escape(tr(value))
    )
    buffer = BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=44,
        leftMargin=52,
        topMargin=42,
        bottomMargin=42,
        title=f"{profile.full_name} - CV",
        author=profile.full_name,
    )
    ink = colors.HexColor("#172238")
    violet = colors.HexColor("#6044b5")
    muted = colors.HexColor("#526079")
    styles = {
        "name": ParagraphStyle(
            "name", fontName="Helvetica-Bold", fontSize=28, leading=32, textColor=ink, spaceAfter=8
        ),
        "role": ParagraphStyle("role", fontSize=12, leading=16, textColor=violet, spaceAfter=10),
        "small": ParagraphStyle("small", fontSize=8.5, leading=12, textColor=muted, spaceAfter=8),
        "body": ParagraphStyle("body", fontSize=9.3, leading=14, textColor=ink, spaceAfter=10),
        "section": ParagraphStyle(
            "section",
            fontName="Helvetica-Bold",
            fontSize=12,
            leading=17,
            textColor=violet,
            spaceBefore=16,
            spaceAfter=10,
        ),
        "title": ParagraphStyle(
            "title",
            fontName="Helvetica-Bold",
            fontSize=10.2,
            leading=14,
            textColor=ink,
            spaceAfter=4,
        ),
    }
    P = lambda value, style="body": Paragraph(value, styles[style])
    story = [P(escape(profile.full_name), "name"), P(text(profile.headline), "role")]
    contacts = [profile.email, profile.phone, profile.location, profile.timezone]
    story += [P(" &nbsp; | &nbsp; ".join(escape(c) for c in contacts if c), "small")]
    for label, url in [
        ("LinkedIn", profile.linkedin_url),
        ("GitHub", profile.github_url),
        ("Web", profile.website_url),
    ]:
        if url:
            story.append(
                P(
                    f'<link href="{escape(url).replace(chr(34), chr(38)+"quot;")}" color="#6044b5">{label}: {escape(url)}</link>',
                    "small",
                )
            )
    story += [P(text(profile.summary)), P("EXPERIENCIA" if es else "EXPERIENCE", "section")]
    for exp in profile.experience:
        story.append(
            KeepTogether(
                [
                    P(f'{text(exp["role"])} · {escape(exp["company"])}', "title"),
                    P(text(exp["period"]), "small"),
                    P(text(exp["description"])),
                    P(" / ".join(escape(s) for s in exp.get("stack", [])), "small"),
                ]
            )
        )
    story += [
        PageBreak(),
        P(profile.full_name, "role"),
        P("TECNOLOGÍAS Y HABILIDADES" if es else "TECHNOLOGIES AND SKILLS", "section"),
    ]
    for group in profile.skills:
        story.append(
            KeepTogether(
                [P(text(group["name"]), "title"), P(" · ".join(escape(s) for s in group["items"]))]
            )
        )
    story.append(
        P("FORMACIÓN Y CERTIFICACIONES" if es else "EDUCATION AND CERTIFICATIONS", "section")
    )
    for row in profile.education:
        story.append(
            KeepTogether(
                [
                    P(text(row["title"]), "title"),
                    P(
                        f'{escape(row["school"])} · {text(row["period"])} · {text(row["status"])}',
                        "small",
                    ),
                ]
            )
        )
    story += [
        P("IDIOMAS" if es else "LANGUAGES", "section"),
        P(
            " · ".join(
                f'{text(l["name"])}: {escape(l["level"].replace('Nativo / Native','Native').replace('Nativo','Native') if not es else l["level"].replace('Nativo / Native','Nativo'))}'
                for l in profile.languages
            )
        ),
    ]

    def page(canvas, doc):
        canvas.setFillColor(violet)
        canvas.rect(0, 0, 8, A4[1], fill=1, stroke=0)
        canvas.setFont("Helvetica", 8)
        canvas.setFillColor(muted)
        canvas.drawString(52, 24, f"{profile.full_name} · {locale.upper()}")
        canvas.drawRightString(A4[0] - 44, 24, str(doc.page))

    doc.build(story, onFirstPage=page, onLaterPages=page)
    return buffer.getvalue()
