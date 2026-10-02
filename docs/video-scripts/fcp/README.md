# Final Cut Notes

The video notes as Final Cut Pro markers. Final Cut can't import Markdown, so `story-a-notes.fcpxml` carries the notes as markers on a clip you paste onto the real timeline.

## story-a-notes.fcpxml

Notes for the shipped Version A cut (`Story-A-DevPost.mov`, 1:59.7, 3840×2160 at 23.976 fps), for working on a copy of it such as the social export. Times are positions in that cut, taken from [`shipaton-final/story-a-captions.srt`](../shipaton-final/story-a-captions.srt). The plank and silence markers are approximate, so each one says what to look for.

| Marker type | Prefix | From |
| --- | --- | --- |
| **To-do** (9) | `Export ·`, `Fix ·`, `Silence ·` | [lessons-learned.md](../lessons-learned.md): what shipped wrong, and the export checks |
| Standard (10) | `G1`–`G5`, `Graphics ·` | [a-story-first.md § Captions and graphics](../a-story-first.md#captions-and-graphics): text, sizes and positions |
| Standard (3) | `Music ·` | [lessons-learned.md § Music](../lessons-learned.md#music): where music cuts out and comes back |
| Standard (1) | `Notes ·` | Where the notes came from, at 0:00 |

The [rough-cut notes](../a-rough-cut-notes.md) aren't included. Their times are positions in the 2:02 rough cut, which no longer line up.

### Import

1. **File → Import → XML…** and choose `story-a-notes.fcpxml`. It adds an event, **AtLeast Video Notes**, with a project, **Story-A Notes**: a gap with one connected title, **Notes (markers only)**, that holds every marker. The title's text is fully transparent, so it never shows in the picture.
2. **Put the markers on your timeline.** In Story-A Notes, select the Notes title and copy it (⌘C). Open your project (for example Story-A-Social), press Home so the playhead is at 00:00:00:00, and choose **Edit → Paste as Connected Clip** (⌥V). The markers ride on the pasted clip, at the right times.
3. Open the **Timeline Index** (⇧⌘2) → **Tags**, and click the to-do button to list only the to-dos. Tick each one off as you go.
4. Delete the Notes clip before you share. It's transparent, but there's no reason to export it.

Story-A Notes also works on its own: open it and read the list in the Timeline Index.

### Changing the notes

Edit the marker `value` text in the file, or add a line:

```xml
<marker start="FRAMES*1001/24000s" duration="1001/24000s" value="Fix · …" completed="0"/>
```

- `start` must land on a frame: the frame number × 1001, over 24000. For 0:54, that's frame 1295, so `1296295/24000s`.
- `completed="0"` makes a to-do and `completed="1"` a finished one. Leave it out for a standard marker.

The file is FCPXML 1.10, which Final Cut Pro 10.6 and later import.
