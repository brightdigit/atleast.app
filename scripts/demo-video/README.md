# Demo video

`encode.sh` turns the ProRes master of the AtLeast demo video (also on
[YouTube](https://youtu.be/uGqpKWTIwFw)) into the files the site serves from
`public/demo/` (LFS-tracked):

| File | Format | Used by |
|------|--------|---------|
| `atleast-video.mp4` | H.264 High + AAC, faststart | every browser (first `<source>`) |
| `atleast-video.webm` | VP9 + Opus, two-pass | fallback `<source>` |
| `atleast-video-poster.jpg` | JPEG frame | `poster` on the `<video>` |

The master itself is not committed.

## Requirements

- `ffmpeg` with libx264, libvpx and libopus (`brew install ffmpeg`)

## Run

From the worktree root:

```bash
make demo-video SRC=~/Movies/AtLeast-demo.mov
```

Or directly, with optional knobs:

```bash
SRC=~/Movies/AtLeast-demo.mov WIDTH=1280 POSTER_AT=4 MP4_CRF=25 \
  ./scripts/demo-video/encode.sh
```

| Variable | Default | |
|----------|---------|---|
| `SRC` | *(required)* | master video |
| `WIDTH` | `1920` | output width; height follows the aspect |
| `POSTER_AT` | `2` | seconds into the video for the poster frame |
| `MP4_CRF` / `WEBM_CRF` | `23` / `33` | quality (lower = better, larger) |
| `OUT_DIR` / `NAME` | `public/demo` / `atleast-video` | output location |

The script prints the output dimensions; keep `width`/`height` in
`src/components/DemoVideo.astro` in step with them so the player reserves the
right space before the poster loads.

## Playback fallback

`DemoVideo.astro` plays the self-hosted files. If the browser can't play either
source, `public/demo-video.js` swaps in YouTube's privacy-enhanced
(`youtube-nocookie.com`) player — the only time the page contacts YouTube. The
CSP in `BaseHead.astro` allows that one frame origin.
