// Hidden quick-reference links to the source repos. Obscurity, not security.
// Unlocks: Option-click or ~1s long-press on the footer app icon, or ?src=1.
// External ES5 file because the site's CSP is script-src 'self'.
(function () {
  var LINKS = [
    ['Site repo', 'https://github.com/brightdigit/atleast.app'],
    ['App repo', 'https://github.com/brightdigit/AtLeast']
  ];
  var revealed = false;

  function reveal() {
    var mount = document.querySelector('[data-repo-links]');
    if (revealed || !mount) return;
    revealed = true;
    for (var i = 0; i < LINKS.length; i++) {
      var a = document.createElement('a');
      a.href = LINKS[i][1];
      a.textContent = LINKS[i][0];
      a.target = '_blank';
      a.rel = 'nofollow noopener noreferrer';
      a.className = 'text-brand-muted transition-colors hover:text-brand-text';
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

  try {
    var url = new URL(location.href);
    if (url.searchParams.get('src') === '1') {
      reveal();
      url.searchParams.delete('src');
      history.replaceState(history.state, '', url.pathname + url.search + url.hash);
    }
  } catch (err) {}
})();
