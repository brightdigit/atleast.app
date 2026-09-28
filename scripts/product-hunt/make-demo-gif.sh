#!/usr/bin/env bash
# Build a Product Hunt gallery GIF from the site demo video.
# Recommended gallery size is ~1270×760; we encode at that width and
# let height follow the source aspect (demo is 16:9 → 1270×716).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
SRC="${SRC:-$ROOT/public/demo/atleast-demo.mp4}"
OUT_DIR="${OUT_DIR:-$ROOT/public/press/product-hunt}"
OUT="${OUT:-$OUT_DIR/02-demo.gif}"
# Defaults tuned for Product Hunt (<~8 MB). Override as needed:
#   WIDTH=1270 FPS=12 MAX_SECONDS=8 ./scripts/product-hunt/make-demo-gif.sh
WIDTH="${WIDTH:-960}"
FPS="${FPS:-10}"
MAX_SECONDS="${MAX_SECONDS:-6}"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

if ! command -v ffmpeg >/dev/null 2>&1; then
  echo "ffmpeg is required (brew install ffmpeg)" >&2
  exit 1
fi

if [[ ! -f "$SRC" ]]; then
  echo "Source video not found: $SRC" >&2
  exit 1
fi

mkdir -p "$OUT_DIR"

# Trim + scale → palette → GIF. Bayer dither keeps file size under PH limits.
FILTER="fps=${FPS},scale=${WIDTH}:-1:flags=lanczos"

echo "→ palette from $(basename "$SRC") (${WIDTH}px @ ${FPS}fps, first ${MAX_SECONDS}s)"
ffmpeg -y -hide_banner -loglevel error \
  -t "$MAX_SECONDS" -i "$SRC" \
  -vf "${FILTER},palettegen=stats_mode=diff" \
  "$TMP/palette.png"

echo "→ encoding $(basename "$OUT")"
ffmpeg -y -hide_banner -loglevel error \
  -t "$MAX_SECONDS" -i "$SRC" -i "$TMP/palette.png" \
  -lavfi "${FILTER}[x];[x][1:v]paletteuse=dither=bayer:bayer_scale=5:diff_mode=rectangle" \
  "$OUT"

BYTES=$(wc -c < "$OUT" | tr -d ' ')
MB=$(python3 -c "print(f'{${BYTES}/1024/1024:.2f}')")
echo "✓ $OUT (${MB} MB)"

# Soft warn if over ~8 MB — still uploadable, but slow on mobile feeds.
python3 -c "
mb = ${BYTES} / 1024 / 1024
if mb > 8:
    print(f'warning: GIF is {mb:.1f} MB; re-run with WIDTH=800 FPS=8 MAX_SECONDS=5 to shrink', flush=True)
"
