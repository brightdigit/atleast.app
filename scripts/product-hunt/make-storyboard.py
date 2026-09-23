#!/usr/bin/env python3
"""Compose the Product Hunt 'how it works' storyboard (1270×760)."""

from __future__ import annotations

import argparse
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

# Brand tokens from src/styles/global.css
BG = (10, 10, 10)  # --color-brand-bg
SURFACE = (20, 20, 20)  # --color-brand-surface
TEXT = (245, 245, 245)  # --color-brand-text
MUTED = (136, 136, 136)  # --color-brand-muted
ACCENT = (107, 143, 248)  # --color-brand-accent
BEZEL = (34, 34, 34)  # --color-brand-border

WIDTH, HEIGHT = 1270, 760

STEPS = [
    {
        "slug": "01-configuration",
        "number": "01",
        "title": "Set your minimum",
        "blurb": "Duration + tap interval.",
    },
    {
        "slug": "02-active-session",
        "number": "02",
        "title": "Feel the rhythm",
        "blurb": "Gentle taps on your wrist.",
    },
    {
        "slug": "03-complete",
        "number": "03",
        "title": "Silence means done",
        "blurb": "No alarm. No interruption.",
    },
]


def load_font(size: int, *, bold: bool = False) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    candidates = [
        "/Library/Fonts/SF-Compact-Display-Bold.otf" if bold else "/Library/Fonts/SF-Compact-Display-Regular.otf",
        "/Library/Fonts/SF-Compact-Display-Medium.otf",
        "/System/Library/Fonts/SFNS.ttf",
        "/System/Library/Fonts/Supplemental/Arial.ttf",
    ]
    for path in candidates:
        try:
            return ImageFont.truetype(path, size)
        except OSError:
            continue
    return ImageFont.load_default()


def rounded_watch(shot: Image.Image, target_w: int, radius: int = 48) -> Image.Image:
    """Scale a watch screenshot and mask it into a rounded rectangle with a thin bezel."""
    ratio = shot.height / shot.width
    target_h = int(target_w * ratio)
    shot = shot.convert("RGBA").resize((target_w, target_h), Image.Resampling.LANCZOS)

    pad = 10
    canvas = Image.new("RGBA", (target_w + pad * 2, target_h + pad * 2), (0, 0, 0, 0))
    draw = ImageDraw.Draw(canvas)
    draw.rounded_rectangle(
        (0, 0, canvas.width - 1, canvas.height - 1),
        radius=radius + 6,
        fill=BEZEL + (255,),
    )

    mask = Image.new("L", shot.size, 0)
    ImageDraw.Draw(mask).rounded_rectangle(
        (0, 0, shot.width - 1, shot.height - 1),
        radius=radius,
        fill=255,
    )
    canvas.paste(shot, (pad, pad), mask)
    return canvas


def text_width(draw: ImageDraw.ImageDraw, text: str, font: ImageFont.ImageFont) -> int:
    return int(draw.textbbox((0, 0), text, font=font)[2])


def main() -> None:
    root = Path(__file__).resolve().parents[2]
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--shots",
        type=Path,
        default=root / "public/press/screenshots/watchos/en-US",
        help="Directory with 01/02/03 watchOS PNGs",
    )
    parser.add_argument(
        "--out",
        type=Path,
        default=root / "public/press/product-hunt/03-how-it-works.png",
        help="Output PNG path",
    )
    args = parser.parse_args()

    canvas = Image.new("RGB", (WIDTH, HEIGHT), BG)
    draw = ImageDraw.Draw(canvas)

    title_font = load_font(42, bold=True)
    step_font = load_font(22, bold=True)
    blurb_font = load_font(18)
    eyebrow_font = load_font(14, bold=True)

    eyebrow = "HOW IT WORKS"
    title = "Three steps. Then silence."

    draw.text((64, 48), eyebrow, font=eyebrow_font, fill=ACCENT)
    draw.text((64, 78), title, font=title_font, fill=TEXT)

    # Three equal columns under the header
    margin_x = 64
    top = 170
    gap = 36
    col_w = (WIDTH - margin_x * 2 - gap * 2) // 3
    watch_w = min(240, col_w - 24)

    for i, step in enumerate(STEPS):
        shot_path = args.shots / f"{step['slug']}.png"
        if not shot_path.exists():
            raise SystemExit(f"Missing screenshot: {shot_path}")

        col_x = margin_x + i * (col_w + gap)
        watch = rounded_watch(Image.open(shot_path), watch_w)
        watch_x = col_x + (col_w - watch.width) // 2
        canvas.paste(watch, (watch_x, top), watch)

        label_y = top + watch.height + 28
        number = step["number"]
        draw.text((col_x, label_y), number, font=eyebrow_font, fill=ACCENT)

        title_y = label_y + 22
        draw.text((col_x, title_y), step["title"], font=step_font, fill=TEXT)

        blurb_y = title_y + 32
        # Soft wrap if needed
        blurb = step["blurb"]
        if text_width(draw, blurb, blurb_font) > col_w:
            # simple two-line split on last space before midpoint
            mid = len(blurb) // 2
            split = blurb.rfind(" ", 0, mid + 8)
            if split == -1:
                split = blurb.find(" ", mid)
            lines = [blurb[:split], blurb[split + 1 :]] if split != -1 else [blurb]
        else:
            lines = [blurb]
        for j, line in enumerate(lines):
            draw.text((col_x, blurb_y + j * 24), line, font=blurb_font, fill=MUTED)

    args.out.parent.mkdir(parents=True, exist_ok=True)
    canvas.save(args.out, "PNG", optimize=True)
    print(f"✓ {args.out} ({args.out.stat().st_size / 1024:.0f} KB)")


if __name__ == "__main__":
    main()
