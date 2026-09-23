# Product Hunt gallery assets

Scripts that build the gallery slides recommended for the AtLeast launch.

| # | File | Source |
|---|------|--------|
| 1 | *(use `public/demo/atleast-loop-poster.jpg` or `public/og.png`)* | existing |
| 2 | `02-demo.gif` | `make-demo-gif.sh` |
| 3 | `03-how-it-works.png` | `make-storyboard.py` |

Outputs land in `public/press/product-hunt/`.

- Storyboard: **1270×760** (PH recommended)
- Demo GIF: **960-wide** by default (~6–7 MB). Use `WIDTH=1270` if you need native gallery width and can accept a larger file.

## Requirements

- `ffmpeg` (`brew install ffmpeg`)
- Python 3 with Pillow (`pip3 install pillow` or `python3 -m pip install pillow`)

## Generate everything

From the worktree root:

```bash
make product-hunt
```

Or individually:

```bash
./scripts/product-hunt/make-demo-gif.sh
python3 scripts/product-hunt/make-storyboard.py
```

### GIF knobs

```bash
# Smaller / faster
WIDTH=800 FPS=8 MAX_SECONDS=5 ./scripts/product-hunt/make-demo-gif.sh

# Atmospheric loop instead of the product demo
SRC=public/demo/atleast-loop.mp4 OUT=public/press/product-hunt/02-loop.gif \
  ./scripts/product-hunt/make-demo-gif.sh
```

### Storyboard knobs

```bash
python3 scripts/product-hunt/make-storyboard.py \
  --out public/press/product-hunt/03-how-it-works.png
```

## Suggested gallery order

1. `public/demo/atleast-loop-poster.jpg` (crop/pad to 1270×760 if needed) — social preview
2. `public/press/product-hunt/02-demo.gif` — product in motion
3. `public/press/product-hunt/03-how-it-works.png` — three steps
4. Optional: `02-loop.gif` if you want a quieter second motion slide