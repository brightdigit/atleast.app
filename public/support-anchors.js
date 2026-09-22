// Open the support question a bookmark points at, on load and on in-page jumps.
(function () {
  function openLinkedAnswer() {
    var target = location.hash && document.getElementById(decodeURIComponent(location.hash.slice(1)));
    if (target && target.tagName === 'DETAILS') {
      target.open = true;
      target.scrollIntoView();
    }
  }
  openLinkedAnswer();
  window.addEventListener('hashchange', openLinkedAnswer);
})();
