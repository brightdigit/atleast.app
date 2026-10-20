#!/usr/bin/env bash
# Encode the demo video master (ProRes .mov) into the web formats the site
# serves: H.264/AAC MP4 (Safari, everything), VP9/Opus WebM (smaller in
# Chrome/Firefox), and a JPEG poster frame.
#
#   SRC=~/Movies/AtLeast-demo.mov ./scripts/demo-video/encode.sh
#   SRC=... WIDTH=1280 POSTER_AT=4 ./scripts/demo-video/encode.sh
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
SRC="${SRC:-}"
OUT_DIR="${OUT_DIR:-$ROOT/public/demo}"
NAME="${NAME:-atleast-video}"
WIDTH="${WIDTH:-1920}"
# The "passive haptic timer" title over the watch — product, not the talking head.
POSTER_AT="${POSTER_AT:-44.5}"
# Quality knobs. Lower = better/larger.
MP4_CRF="${MP4_CRF:-26}"
WEBM_CRF="${WEBM_CRF:-33}"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

if ! command -v ffmpeg >/dev/null 2>&1 || ! command -v ffprobe >/dev/null 2>&1; then
  echo "ffmpeg and ffprobe are required (brew install ffmpeg)" >&2
  exit 1
fi

if [[ -z "$SRC" ]]; then
  echo "Set SRC to the master video, e.g. SRC=~/Movies/demo.mov $0" >&2
  exit 1
fi

if [[ ! -f "$SRC" ]]; then
  echo "Source video not found: $SRC" >&2
  exit 1
fi

mkdir -p "$OUT_DIR"

MP4="$OUT_DIR/$NAME.mp4"
WEBM="$OUT_DIR/$NAME.webm"
POSTER="$OUT_DIR/$NAME-poster.jpg"

# -2 keeps the height even (required by yuv420p) and follows the source aspect.
# ProRes masters are often 10-bit 4:2:2; yuv420p makes both outputs 8-bit 4:2:0
# so every browser can decode them.
SCALE="scale=${WIDTH}:-2:flags=lanczos,format=yuv420p"

echo "→ $(basename "$MP4") (H.264 CRF ${MP4_CRF}, ${WIDTH}px)"
ffmpeg -y -hide_banner -loglevel error -stats \
  -i "$SRC" -map 0:v:0 -map 0:a:0? \
  -vf "$SCALE" \
  -c:v libx264 -profile:v high -preset slow -crf "$MP4_CRF" \
  -c:a aac -b:a 128k -ac 2 \
  -movflags +faststart \
  "$MP4"

# VP9 two-pass in constant-quality mode (-b:v 0) is markedly smaller than one pass.
echo "→ $(basename "$WEBM") (VP9 CRF ${WEBM_CRF}, two-pass)"
ffmpeg -y -hide_banner -loglevel error -stats \
  -i "$SRC" -map 0:v:0 \
  -vf "$SCALE" \
  -c:v libvpx-vp9 -crf "$WEBM_CRF" -b:v 0 -row-mt 1 -deadline good -cpu-used 2 \
  -pass 1 -passlogfile "$TMP/vp9" -an -f null /dev/null
ffmpeg -y -hide_banner -loglevel error -stats \
  -i "$SRC" -map 0:v:0 -map 0:a:0? \
  -vf "$SCALE" \
  -c:v libvpx-vp9 -crf "$WEBM_CRF" -b:v 0 -row-mt 1 -deadline good -cpu-used 2 \
  -pass 2 -passlogfile "$TMP/vp9" \
  -c:a libopus -b:a 96k -ac 2 \
  "$WEBM"

echo "→ $(basename "$POSTER") (frame at ${POSTER_AT}s)"
ffmpeg -y -hide_banner -loglevel error \
  -ss "$POSTER_AT" -i "$SRC" -frames:v 1 \
  -vf "scale=${WIDTH}:-2:flags=lanczos" -q:v 3 \
  "$POSTER"

DURATION=$(ffprobe -v error -show_entries format=duration -of default=nw=1:nk=1 "$MP4")
DIMS=$(ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=s=x:p=0 "$MP4")
echo "✓ ${DIMS}, $(printf '%.1f' "$DURATION")s — set width/height in src/components/DemoVideo.astro to match"
for f in "$MP4" "$WEBM" "$POSTER"; do
  BYTES=$(wc -c < "$f" | tr -d ' ')
  printf '  %-28s %6.2f MB\n' "$(basename "$f")" "$(echo "$BYTES / 1048576" | bc -l)"
done

# Soft warn: the page sets preload="none", but a large file still means a slow start on mobile.
MP4_BYTES=$(wc -c < "$MP4" | tr -d ' ')
if (( MP4_BYTES > 25 * 1048576 )); then
  echo "warning: MP4 is over 25 MB; re-run with WIDTH=1280 or MP4_CRF=28 to shrink" >&2
fi
