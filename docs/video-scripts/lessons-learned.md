# Lessons Learned — Shipaton 2026 Video

What we learned finishing Version A for the Shipaton deadline (submitted 2026-09-30). The final cut was `Story-A-DevPost.mov`, exported 2026-09-29 at 22:06. It runs 1:59.7 and uses the licensed track "LoFi" by ArtIss (Envato Elements). [shipaton-final/](shipaton-final/README.md) records the submission and keeps the caption files. Use these notes for the 60-second cuts and the next video.

## Check every export before upload

These checks take under a minute, even on a 3.5 GB ProRes file. Run `lsof <file>` first, because a file still exporting has no `moov` atom. Run `ffmpeg` with `nice -n 15 -threads 2`.

| Check | Command | What to look for |
| --- | --- | --- |
| Length | `ffprobe -show_entries format=duration` | Under 2:00. Judges aren't required to watch past it |
| Loudness | `ffmpeg -i F -map 0:a:0 -af ebur128=peak=true -f null -` | About −14 LUFS integrated, true peak ≤ −1 dBTP. The pre-music export measured −18.9 LUFS with the peak at **0.0 dBTP**. The final shipped at −19.8 LUFS, still peaking at 0.0, because the normalize step was skipped under deadline |
| Silence beat | `-af silencedetect=n=-45dB:d=0.4` | Where the taps actually stop, and any stray tap or **digital zero** (−∞) inside the silence |
| Picture | `-vf "fps=1,scale=480:-2,tile=6x5"` contact sheets | Blur frames, captions, layout. Use **4 fps or more for montages**: 1 fps skipped a 0.75s plank shot |

- If there are several exports, check file dates (`ls -lT`) and make sure you're looking at the final one. The .mov was re-exported after the first review.
- Check the export against the graphics spec in [a-story-first.md](a-story-first.md#captions-and-graphics), not just against the script. The Watch captions shipped in the middle of the frame, covering the pulse, although the spec put them in a left column.

## Picture

- **Start each clip on its first sharp frame.** White blur at clip starts (0:54 in the final) came back after the rough-cut notes had already flagged it.
- **Keep captions off the device.** Put text in the left column (x = 288), with a soft shadow over busy footage such as arm hair or a white wall. The bright tabletop at the bottom of the frame is worse than the arm.
- **Don't lay a screen recording over a camera shot of the same phone.** Unless it's corner-pinned exactly, you see two phones. Use the camera for the proof moment (the finger tapping Save), then hard-cut to the recording alone on `#0A0A0A`. D1 already proves both devices are real.
- Your own plank footage, cluttered bedroom and all, worked better than stock would have. A ~1s trim from its start also covers "A plank." in the practice montage.

## Captions and silence

- **Time the silence caption to the audio, not the script.** "Silence means enough" ran over the last taps, about 2.7s before the real silence, and was gone by the time the silence started. Bring it in about 1s after the last tap.
- **Fill the silence beat with room tone.** The timeline had true digital silence there. Once music plays on either side, a drop to zero sounds like a dropout.
- Give every caption at least 2s. The trial line got about 1s before the end card.

## Music

- **Add music last, after picture lock.** Trimming the picture moves every cue point after the trim.
- Hard-cut it out on the alarm (the first frame of the plank) and on the frame the last tap ends. Bring it back on "So I built AtLeast." and on "Keep going…". Listen to the silence on headphones for any music tail.
- Normalize after the music is in: −14 LUFS, limiter at −1 dBTP.
- **License:** one Envato Elements license covers one project. "LoFi" is registered as `AtLeast-v1-Release` for this video only. Register a new license for any 60-second cut. If YouTube shows a Content ID claim, clear it through Envato with the license code on the certificate. Keep the certificate privately, with the FCP project, not in this public repo.

## YouTube captions

- **FCP's iTT export** uses SMPTE timecode at 24 frames with `frameRateMultiplier="1000 1001"`. Convert each timecode to seconds as `frames × 1001 / 24000`. A flat 24 fps conversion drifts about 0.1s late by 2:00.
- **The transcription mangles the brand name.** Check every caption for these:

  | Transcribed as | Should read |
  | --- | --- |
  | "at least" | AtLeast |
  | "At least as…" | AtLeast is… |
  | "at least on app" | atleast.app |

  Also check for misheard short words, such as "Tear flow" for "your flow".
- Upload the result as an SRT (Subtitles → Upload file → With timing). Check one cue against the audio, such as the first line after the silence beat.

## Contest and YouTube upload

- The rules say "uploaded to and made **publicly visible**". A **Private** video doesn't meet that. Upload it as Unlisted or Public: the URL stays the same when you switch it to Public later.
- After the deadline, nothing about the submission may change. Don't replace, re-upload or make the video Private.
- Before pasting the link into Devpost, open it in a private window while signed out, and check **Checks → Copyright** in YouTube Studio.
- The YouTube description should cover the hook, how it works, the Pro and free split, privacy (no account; your own iCloud), atleast.app, "Made for RevenueCat Shipaton 2026", and the music credit.
