// Hero loop autoplay detection.
//
// The hero video is decorative: it has no controls and nothing to hear. When a
// browser refuses muted autoplay — Safari's per-site "Auto-Play" setting, Low
// Power Mode, or iOS Low Data Mode — it falls back to showing the poster with a
// play button. That button is a dead end here: the video is background texture,
// not content someone came to watch, and tapping it starts a silent loop with
// no way to stop it.
//
// So instead of leaving a non-functional control on screen, ask the browser to
// play and see what happens. If it refuses, swap in the poster <img> that
// already exists for the prefers-reduced-motion case. Same markup, same
// dimensions, no layout shift.
//
// Written as an external ES5 file (like ab.js) because the site's CSP is
// script-src 'self' — no inline script.
(function () {
  var video = document.querySelector('.hero-loop');
  var fallback = document.querySelector('.hero-loop-fallback');
  if (!video || !fallback) return;

  // Under prefers-reduced-motion the stylesheet has already swapped these two,
  // and we must not fight it: leave the still frame in place.
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  function showPoster() {
    // Only swap once, and only if CSS has not already hidden the video.
    if (video.hasAttribute('data-autoplay-blocked')) return;
    video.setAttribute('data-autoplay-blocked', '');
    // Stop the download; the poster <img> is what the visitor will actually see.
    video.removeAttribute('autoplay');
    try {
      video.pause();
    } catch (e) {
      /* pause() can throw if the element is already torn down */
    }
  }

  function attempt() {
    // play() returns a promise in every browser that can block autoplay.
    // Older browsers return undefined and simply autoplay as instructed.
    var p;
    try {
      p = video.play();
    } catch (e) {
      showPoster();
      return;
    }
    if (!p || typeof p.then !== 'function') return;
    p['catch'](function () {
      // NotAllowedError (autoplay refused) or NotSupportedError (no playable
      // source). Either way the visitor gets a play button we do not want.
      showPoster();
    });
  }

  // A media error means no source could be decoded — same outcome for the user.
  video.addEventListener('error', showPoster);

  if (video.readyState >= 2) {
    attempt();
  } else {
    video.addEventListener('loadeddata', attempt, { once: true });
    // If metadata never arrives (blocked download, offline), fall back rather
    // than leaving the element in limbo.
    video.addEventListener('stalled', showPoster);
  }
})();
