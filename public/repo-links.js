// Hidden quick-reference links to the source repos. Obscurity, not security.
// Unlocks: Option-click or ~1s long-press on the footer app icon.
// External ES5 file because the site's CSP is script-src 'self'.
(function () {
  // [label, url, Phosphor icon path]: a watch for the app, a globe for the site.
  var LINKS = [
    ['App repo', 'https://github.com/brightdigit/AtLeast', "m175.3 63.53l-6.24-34.38A16 16 0 0 0 153.32 16h-50.64a16 16 0 0 0-15.74 13.15L80.7 63.53a79.9 79.9 0 0 0 0 128.94l6.24 34.38A16 16 0 0 0 102.68 240h50.64a16 16 0 0 0 15.74-13.15l6.24-34.38a79.9 79.9 0 0 0 0-128.94M102.68 32h50.64l3.91 21.55a79.75 79.75 0 0 0-58.46 0Zm50.64 192h-50.64l-3.91-21.55a79.75 79.75 0 0 0 58.46 0ZM168 136h-40a8 8 0 0 1-8-8V88a8 8 0 0 1 16 0v32h32a8 8 0 0 1 0 16"],
    ['Site repo', 'https://github.com/brightdigit/atleast.app', "M128 24a104 104 0 1 0 104 104A104.12 104.12 0 0 0 128 24m87.62 96h-39.83c-1.79-36.51-15.85-62.33-27.38-77.6a88.19 88.19 0 0 1 67.22 77.6ZM96.23 136h63.54c-2.31 41.61-22.23 67.11-31.77 77c-9.55-9.9-29.46-35.4-31.77-77m0-16c2.31-41.61 22.23-67.11 31.77-77c9.55 9.93 29.46 35.43 31.77 77Zm52.18 93.6c11.53-15.27 25.56-41.09 27.38-77.6h39.84a88.19 88.19 0 0 1-67.22 77.6"]
  ];
  var SVG_NS = 'http://www.w3.org/2000/svg';
  var revealed = false;

  function reveal() {
    var mount = document.querySelector('[data-repo-links]');
    if (revealed || !mount) return;
    revealed = true;
    for (var i = 0; i < LINKS.length; i++) {
      var a = document.createElement('a');
      a.href = LINKS[i][1];
      a.setAttribute('aria-label', LINKS[i][0]);
      a.title = LINKS[i][0];
      a.target = '_blank';
      a.rel = 'nofollow noopener noreferrer';
      a.className = 'text-brand-muted transition-colors hover:text-brand-text';
      var svg = document.createElementNS(SVG_NS, 'svg');
      svg.setAttribute('viewBox', '16 16 224 224');
      svg.setAttribute('fill', 'currentColor');
      svg.setAttribute('aria-hidden', 'true');
      svg.setAttribute('class', 'h-[18px] w-[18px]');
      var path = document.createElementNS(SVG_NS, 'path');
      path.setAttribute('d', LINKS[i][2]);
      svg.appendChild(path);
      a.appendChild(svg);
      mount.appendChild(a);
    }
  }

  var icon = document.querySelector('[data-repo-reveal]');
  if (icon) {
    var HOLD_MS = 1000;
    var SLOP = 10;
    var timer = null;
    var startX = 0;
    var startY = 0;
    var fired = false;

    function cancel() {
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
    }

    icon.style.webkitTouchCallout = 'none';

    icon.addEventListener('click', function (e) {
      if (e.altKey || fired) {
        e.preventDefault();
        if (e.altKey) reveal();
      }
      fired = false;
    });

    icon.addEventListener('pointerdown', function (e) {
      if (e.button !== 0) return;
      cancel();
      fired = false;
      startX = e.clientX;
      startY = e.clientY;
      timer = setTimeout(function () {
        timer = null;
        fired = true;
        reveal();
      }, HOLD_MS);
    });

    icon.addEventListener('pointermove', function (e) {
      if (timer && (Math.abs(e.clientX - startX) > SLOP || Math.abs(e.clientY - startY) > SLOP)) cancel();
    });
    icon.addEventListener('pointerup', cancel);
    icon.addEventListener('pointercancel', cancel);
    icon.addEventListener('pointerleave', cancel);

    icon.addEventListener('contextmenu', function (e) {
      if (timer || fired) e.preventDefault();
    });
  }
})();
