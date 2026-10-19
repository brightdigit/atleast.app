// Demo video playback fallback.
//
// The demo video is self-hosted (MP4 then WebM) so a normal visit never
// contacts YouTube. If the browser can play neither source — an unsupported
// codec, a blocked or failed download — the visitor would be left with a
// poster and a broken player. In that case only, swap in YouTube's
// privacy-enhanced (youtube-nocookie.com) player for the same video.
//
// Written as an external ES5 file (like hero-video.js) because the site's CSP
// is script-src 'self' — no inline script. The CSP's frame-src allows exactly
// the one origin used here.
(function () {
  var figures = document.querySelectorAll('[data-demo-video]');

  function useYouTube(figure, video) {
    if (figure.hasAttribute('data-demo-video-fallback')) return;
    figure.setAttribute('data-demo-video-fallback', '');

    var id = figure.getAttribute('data-youtube-id');
    var frame = video.parentNode;
    if (!id || !frame) return;

    var iframe = document.createElement('iframe');
    iframe.src = 'https://www.youtube-nocookie.com/embed/' + encodeURIComponent(id) + '?rel=0';
    iframe.title = video.getAttribute('aria-label') || 'Demo video';
    iframe.allow = 'accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen';
    iframe.allowFullscreen = true;
    iframe.referrerPolicy = 'strict-origin-when-cross-origin';
    iframe.className = 'block w-full';
    // Hold the video's aspect ratio so the swap causes no layout shift.
    iframe.style.aspectRatio = (video.getAttribute('width') || 16) + ' / ' + (video.getAttribute('height') || 9);
    iframe.style.border = '0';

    frame.replaceChild(iframe, video);
  }

  for (var i = 0; i < figures.length; i++) {
    (function (figure) {
      var video = figure.querySelector('video');
      if (!video) return;

      var fail = function () {
        useYouTube(figure, video);
      };

      // With <source> children, a failed source fires `error` on the <source>,
      // not the <video>; the browser moves on to the next one. Only the last
      // source failing means nothing is playable.
      var sources = video.querySelectorAll('source');
      if (sources.length) {
        sources[sources.length - 1].addEventListener('error', fail);
      }
      video.addEventListener('error', fail);

      // No source the browser even claims to support: fall back up front.
      var playable = false;
      for (var j = 0; j < sources.length; j++) {
        if (video.canPlayType && video.canPlayType(sources[j].getAttribute('type') || '')) playable = true;
      }
      if (sources.length && !playable) fail();
    })(figures[i]);
  }
})();
