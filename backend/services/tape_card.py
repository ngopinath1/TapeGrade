from hashlib import sha256
from io import BytesIO
import textwrap

from PIL import Image, ImageDraw, ImageFont, ImageOps

from backend.config import settings
from backend.services.clips import local_path, media_url


def font(size):
    for path in [
        "/System/Library/Fonts/Supplemental/Arial Bold.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
    ]:
        try:
            return ImageFont.truetype(path, size)
        except OSError:
            pass
    return ImageFont.load_default(size=size)


def render_card(player, verdict, metrics, clip, mock, image_client=None, diagnostic=None) -> dict:
    key = sha256(
        repr(
            (
                player["id"],
                verdict,
                metrics,
                (clip or {}).get("content_hash"),
                mock,
                settings.image_model,
                "card-v4",
                diagnostic,
            )
        ).encode()
    ).hexdigest()
    path = settings.data_dir / "cache" / "cards" / f"{key}.png"
    if path.exists():
        return {
            "url": media_url(path),
            "simulated": mock,
            "visual_source": "Programmatic mock artwork" if mock else settings.image_model,
        }
    card = Image.new("RGB", (1080, 1350), "#121914")
    if not mock:
        # Names and verified numbers are composited locally, never entrusted to image typography.
        data = image_client.generate(
            "An editorial basketball scouting poster background. Dark charcoal basketball court, dramatic olive and lime stadium lights, fine film grain, no people, no logos, no text or numerals. Premium sports magazine art direction. Leave the lower half dark for typography."
        )
        background = Image.open(BytesIO(data)).convert("RGB")
        card.paste(ImageOps.fit(background, (1080, 1350)), (0, 0))
        card = Image.blend(card, Image.new("RGB", card.size, "#121914"), 0.5)
    d = ImageDraw.Draw(card)
    d.text((64, 55), "TAPE / GRADE", font=font(32), fill="#c8f58a")
    d.text((64, 104), "THE FILM ADVANTAGE", font=font(15), fill="#929f91")
    d.rounded_rectangle((809, 60, 1016, 113), radius=8, fill="#c8f58a")
    d.text((844, 68), verdict["verdict"], font=font(30), fill="#182317")
    if clip:
        im = Image.open(local_path(clip["frames"][1]["url"])).convert("RGB")
        card.paste(ImageOps.fit(im, (952, 490)), (64, 173))
    else:
        d.rectangle((64, 173, 1016, 663), fill="#1b2919", outline="#44523e", width=2)
        d.text((200, 390), "NO VERIFIED FRAME AVAILABLE", font=font(28), fill="#9eb48c")
    d = ImageDraw.Draw(card)
    d.text((64, 710), player["name"].upper(), font=font(61), fill="#edf0e7")
    d.text(
        (67, 792),
        f"{player['team']}   /   {' · '.join(player['positions'])}   /   FILM REPORT",
        font=font(22),
        fill="#a9b5a1",
    )
    measured = [m for m in metrics if m["value"] is not None][:2]
    if not measured and diagnostic:
        measured = [
            {
                "value": round(diagnostic["quality"] * 100),
                "unit": "%",
                "label": "AI tracking quality",
            },
            {"value": diagnostic["observed_frames"], "unit": "", "label": "Frames observed"},
        ]
    for i, m in enumerate(measured):
        x = 64 + i * 490
        d.line((x, 861, x + 440, 861), fill="#44523e", width=2)
        d.text((x, 889), f"{m['value']:g}{m['unit']}", font=font(58), fill="#c8f58a")
        d.text((x, 967), m["label"].upper(), font=font(19), fill="#a3af9d")
    insight = verdict["rationale"]
    for i, line in enumerate(textwrap.wrap(insight, 67)[:4]):
        d.text((64, 1041 + i * 30), line, font=font(22), fill="#dee3d6")
    d.line((64, 1214, 1016, 1214), fill="#44523e", width=2)
    d.text(
        (64, 1245),
        (
            "LIVE MODELS · FILM DIAGNOSTIC · NO FANTASY TRANSACTION"
            if player.get("film_only")
            else (
                "SIMULATED DEMO · FICTIONAL PLAYER"
                if mock
                else "LIVE MODELS · FICTIONAL SAMPLE LEAGUE"
            )
        ),
        font=font(18),
        fill="#a7b49e",
    )
    d.text(
        (64, 1285),
        "Screen-space proxies. Your box score is lying to you.",
        font=font(19),
        fill="#c8f58a",
    )
    path.parent.mkdir(parents=True, exist_ok=True)
    card.save(path)
    return {
        "url": media_url(path),
        "simulated": mock,
        "visual_source": "Programmatic mock artwork" if mock else settings.image_model,
    }
