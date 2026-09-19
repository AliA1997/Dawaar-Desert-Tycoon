"""
Drawing toolkit shared by the deployment-architecture diagrams.

Why hand-rolled Pillow rather than Graphviz, mermaid-cli, or the `diagrams`
package: each of those needs a system binary (Graphviz `dot`) or a headless
Chromium that is not installed here. Pillow already is.

The design rule these diagrams follow: a reader should be able to follow one
numbered path left to right without reading any small print. Detail belongs in
DEPLOYMENT_ARCHITECTURE.md, not on the picture. Nothing here draws below 12px.

Everything is drawn at SCALE x and downsampled on save, which is what keeps the
type and 1px borders crisp rather than aliased.

Colors come from the app's own palette (artifacts/dawaar/constants/colors.ts).
See the `brand_guidelines` skill.
"""

from __future__ import annotations

import math
from pathlib import Path
from typing import Iterable, Sequence

from PIL import Image, ImageDraw, ImageFont

SCALE = 2

Box = tuple[float, float, float, float]  # x, y, w, h
Point = tuple[float, float]

PALETTE: dict[str, str] = {
    "bg": "#080F1A",
    "card": "#111827",
    "border": "#1E2D42",
    "text": "#F5EDD8",
    "muted": "#B6BEC9",
    "dim": "#8B94A3",
    "gold": "#C9A84C",
    "green": "#3DD68C",
    "red": "#F1616C",
    "amber": "#F0A93B",
    "blue": "#4D9BF5",
    "cyan": "#38BDF8",
    "purple": "#B57BF0",
    "aws": "#FF9900",
    "azure": "#3FA0FF",
}

_FONT_CANDIDATES: dict[str, tuple[str, ...]] = {
    "regular": (
        "C:/Windows/Fonts/segoeui.ttf",
        "C:/Windows/Fonts/arial.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
        "/System/Library/Fonts/Supplemental/Arial.ttf",
    ),
    "bold": (
        "C:/Windows/Fonts/segoeuib.ttf",
        "C:/Windows/Fonts/arialbd.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
        "/System/Library/Fonts/Supplemental/Arial Bold.ttf",
    ),
}

_font_cache: dict[tuple[str, int], ImageFont.FreeTypeFont] = {}


def _rgb(value):  # type: ignore[no-untyped-def]
    if value is None or not isinstance(value, str):
        return value
    v = value.lstrip("#")
    return (int(v[0:2], 16), int(v[2:4], 16), int(v[4:6], 16))


def mix(a: str, b: str, t: float) -> tuple[int, int, int]:
    """Blend two hex colors. Used instead of alpha so the canvas stays RGB."""
    ca, cb = _rgb(a), _rgb(b)
    return (
        round(ca[0] + (cb[0] - ca[0]) * t),
        round(ca[1] + (cb[1] - ca[1]) * t),
        round(ca[2] + (cb[2] - ca[2]) * t),
    )


def right(box: Box) -> Point:
    return (box[0] + box[2], box[1] + box[3] / 2)


def left(box: Box) -> Point:
    return (box[0], box[1] + box[3] / 2)


def bottom(box: Box) -> Point:
    return (box[0] + box[2] / 2, box[1] + box[3])


def top(box: Box) -> Point:
    return (box[0] + box[2] / 2, box[1])


class Canvas:
    def __init__(self, width: int, height: int, bg: str = PALETTE["bg"]) -> None:
        self.w = width
        self.h = height
        self.img = Image.new("RGB", (width * SCALE, height * SCALE), _rgb(bg))
        self.d = ImageDraw.Draw(self.img)

    # ---- primitives -------------------------------------------------------

    def _s(self, v: float) -> float:
        return v * SCALE

    def font(self, style: str = "regular", size: float = 13) -> ImageFont.FreeTypeFont:
        px = round(size * SCALE)
        key = (style, px)
        if key in _font_cache:
            return _font_cache[key]
        font = None
        for path in _FONT_CANDIDATES[style]:
            if Path(path).exists():
                font = ImageFont.truetype(path, px)
                break
        if font is None:  # pragma: no cover
            font = ImageFont.load_default(px)
        _font_cache[key] = font
        return font

    def measure(self, s: str, style: str = "regular", size: float = 13) -> float:
        return self.d.textlength(s, font=self.font(style, size)) / SCALE

    def wrap(self, s: str, max_width: float, style: str = "regular", size: float = 13) -> list[str]:
        lines: list[str] = []
        cur = ""
        for word in s.split():
            probe = (cur + " " + word).strip()
            if cur and self.measure(probe, style, size) > max_width:
                lines.append(cur)
                cur = word
            else:
                cur = probe
        if cur:
            lines.append(cur)
        return lines

    def text(
        self,
        x: float,
        y: float,
        s: str,
        *,
        style: str = "regular",
        size: float = 13,
        fill: str = PALETTE["text"],
        anchor: str = "la",
        max_width: float | None = None,
        leading: float = 1.45,
    ) -> float:
        font = self.font(style, size)
        lines = self.wrap(s, max_width, style, size) if max_width else [s]
        step = size * leading
        for i, line in enumerate(lines):
            self.d.text(
                (self._s(x), self._s(y + i * step)),
                line,
                font=font,
                fill=_rgb(fill),
                anchor=anchor,
            )
        return step * len(lines)

    def rrect(self, box: Box, *, radius: float = 12, fill=None, outline=None, width: float = 1) -> None:
        x, y, w, h = box
        self.d.rounded_rectangle(
            [(self._s(x), self._s(y)), (self._s(x + w), self._s(y + h))],
            radius=self._s(radius),
            fill=_rgb(fill),
            outline=_rgb(outline),
            width=max(1, round(self._s(width))),
        )

    def line(self, p0: Point, p1: Point, *, color=PALETTE["border"], width: float = 1.5) -> None:
        self.d.line(
            [(self._s(p0[0]), self._s(p0[1])), (self._s(p1[0]), self._s(p1[1]))],
            fill=_rgb(color),
            width=max(1, round(self._s(width))),
        )

    def dashed_line(self, p0: Point, p1: Point, *, color=PALETTE["dim"], width: float = 1.5,
                    dash: float = 8, gap: float = 6) -> None:
        dx, dy = p1[0] - p0[0], p1[1] - p0[1]
        length = math.hypot(dx, dy)
        if length == 0:
            return
        ux, uy = dx / length, dy / length
        pos = 0.0
        while pos < length:
            end = min(pos + dash, length)
            self.line((p0[0] + ux * pos, p0[1] + uy * pos),
                      (p0[0] + ux * end, p0[1] + uy * end), color=color, width=width)
            pos = end + gap

    def dashed_rect(self, box: Box, *, color=PALETTE["dim"], width: float = 1.2,
                    dash: float = 8, gap: float = 6) -> None:
        x, y, w, h = box
        pts = [(x, y), (x + w, y), (x + w, y + h), (x, y + h)]
        for i in range(4):
            self.dashed_line(pts[i], pts[(i + 1) % 4], color=color, width=width, dash=dash, gap=gap)

    def arrow(self, pts: Sequence[Point], *, color: str = PALETTE["gold"], width: float = 2.6,
              head: float = 13, dashed: bool = False, label: str | None = None) -> None:
        for i in range(len(pts) - 1):
            if dashed:
                self.dashed_line(pts[i], pts[i + 1], color=color, width=width)
            else:
                self.line(pts[i], pts[i + 1], color=color, width=width)
        frm, to = pts[-2], pts[-1]
        angle = math.atan2(to[1] - frm[1], to[0] - frm[0])
        spread = math.radians(25)
        self.d.polygon(
            [
                (self._s(to[0]), self._s(to[1])),
                (self._s(to[0] - head * math.cos(angle - spread)), self._s(to[1] - head * math.sin(angle - spread))),
                (self._s(to[0] - head * math.cos(angle + spread)), self._s(to[1] - head * math.sin(angle + spread))),
            ],
            fill=_rgb(color),
        )
        if label:
            mx = (pts[0][0] + pts[-1][0]) / 2
            my = (pts[0][1] + pts[-1][1]) / 2
            self.text(mx, my - 26, label, size=12.5, fill=color, anchor="ma")

    # ---- composites -------------------------------------------------------

    def heading(self, title: str, subtitle: str, *, accent: str = PALETTE["gold"]) -> None:
        self.text(48, 40, title, style="bold", size=28, fill=PALETTE["text"])
        self.text(48, 82, subtitle, size=15, fill=PALETTE["muted"])
        self.line((48, 118), (self.w - 48, 118), color=PALETTE["border"], width=1)
        self.rrect((48, 116.5, 110, 3), radius=1.5, fill=accent)

    def step(
        self,
        box: Box,
        number: int,
        title: str,
        lines: Iterable[str] = (),
        *,
        accent: str = PALETTE["gold"],
        badge: str | None = None,
    ) -> Box:
        """A numbered box on the main path. Big title, a few short lines, nothing small."""
        x, y, w, h = box
        self.rrect(box, radius=14, fill=mix(PALETTE["card"], accent, 0.07))
        self.rrect(box, radius=14, outline=mix(PALETTE["border"], accent, 0.45), width=1.6)

        # Numbered disc, straddling the top-left corner.
        r = 19.0
        cx, cy = x + 30, y + 30
        self.d.ellipse(
            [(self._s(cx - r), self._s(cy - r)), (self._s(cx + r), self._s(cy + r))],
            fill=_rgb(accent),
        )
        self.text(cx, cy, str(number), style="bold", size=19, fill=PALETTE["bg"], anchor="mm")

        ty = y + 66
        ty += self.text(x + 24, ty, title, style="bold", size=19, fill=PALETTE["text"], max_width=w - 48)
        ty += 10
        for ln in lines:
            ty += self.text(x + 24, ty, ln, size=13.5, fill=PALETTE["muted"], max_width=w - 48, leading=1.4)
            ty += 7

        if badge:
            bw = self.measure(badge, "bold", 12) + 22
            self.rrect((x + w - bw - 20, y + 16, bw, 28), radius=999, fill=mix(PALETTE["bg"], accent, 0.28))
            self.text(x + w - bw / 2 - 20, y + 30, badge, style="bold", size=12, fill=accent, anchor="mm")
        return box

    def tile(self, box: Box, title: str, line: str = "", *, accent: str = PALETTE["dim"],
             planned: bool = False) -> Box:
        """A supporting service. Deliberately smaller and quieter than a step."""
        x, y, w, h = box
        if planned:
            self.rrect(box, radius=10, fill=mix(PALETTE["bg"], accent, 0.05))
            self.dashed_rect(box, color=mix(PALETTE["bg"], accent, 0.55))
        else:
            self.rrect(box, radius=10, fill=mix(PALETTE["card"], accent, 0.05))
            self.rrect(box, radius=10, outline=mix(PALETTE["border"], accent, 0.35), width=1.2)
        ty = y + 16
        ty += self.text(x + 18, ty, title, style="bold", size=15, fill=PALETTE["text"], max_width=w - 36)
        if line:
            ty += 5
            self.text(x + 18, ty, line, size=12.5, fill=PALETTE["dim"], max_width=w - 36)
        return box

    def note(
        self,
        box: Box,
        title: str,
        body: str | Sequence[str],
        *,
        accent: str = PALETTE["amber"],
    ) -> None:
        """Plain-language explainer. Body type is large on purpose.

        A list of strings is rendered as bullets, hanging-indented so a wrapped
        line stays aligned with the text above it rather than with the bullet.
        """
        x, y, w, h = box
        self.rrect(box, radius=12, fill=mix(PALETTE["bg"], accent, 0.08))
        self.rrect(box, radius=12, outline=mix(PALETTE["bg"], accent, 0.4), width=1.4)
        ty = y + 20
        ty += self.text(x + 26, ty, title, style="bold", size=16, fill=accent, max_width=w - 52)
        ty += 10

        if isinstance(body, str):
            self.text(x + 26, ty, body, size=14, fill=PALETTE["muted"], max_width=w - 52, leading=1.5)
            return

        for item in body:
            self.rrect((x + 28, ty + 7, 6, 6), radius=3, fill=accent)
            ty += self.text(
                x + 46, ty, item, size=14, fill=PALETTE["muted"], max_width=w - 74, leading=1.5
            )
            ty += 7

    def band(self, box: Box, label: str, *, accent: str = PALETTE["border"], tint: float = 0.05) -> None:
        """A quiet grouping behind a row of tiles."""
        self.rrect(box, radius=14, fill=mix(PALETTE["bg"], accent, tint))
        self.rrect(box, radius=14, outline=mix(PALETTE["bg"], accent, 0.3), width=1.2)
        self.text(box[0] + 22, box[1] + 15, label.upper(), style="bold", size=12.5, fill=accent)

    def footnote(self, text: str) -> None:
        self.text(48, self.h - 36, text, size=12, fill=PALETTE["dim"])

    # ---- output -----------------------------------------------------------

    def save(self, path: Path) -> Path:
        path.parent.mkdir(parents=True, exist_ok=True)
        self.img.resize((self.w, self.h), Image.LANCZOS).save(path, "PNG", optimize=True)
        return path
