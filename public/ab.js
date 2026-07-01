// Lightweight A/B assignment for the "Use Cases" nav/footer label.
// Loaded blocking in <head> so the variant is set before first paint (no flicker).
// Reports click-through to Plausible (already loaded on the site) tagged with the variant.
(function () {
  var KEY = 'ab_usecases_label';
  var VARIANTS = ['how-to-use-it', 'ways-to-use-it', 'where-it-fits'];

  var variant;
  try {
    variant = localStorage.getItem(KEY);
    if (VARIANTS.indexOf(variant) === -1) {
      variant = VARIANTS[Math.floor(Math.random() * VARIANTS.length)];
      localStorage.setItem(KEY, variant);
    }
  } catch (e) {
    // Storage unavailable (e.g. private mode) — assign for this pageview only.
    variant = VARIANTS[Math.floor(Math.random() * VARIANTS.length)];
  }

  document.documentElement.dataset.abLabel = variant;

  function track(name, props) {
    if (typeof window.plausible === 'function') {
      window.plausible(name, { props: props });
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    // Which A/B label a visitor clicked in the nav/footer.
    var labelLinks = document.querySelectorAll('[data-ab-usecases-link]');
    for (var i = 0; i < labelLinks.length; i++) {
      labelLinks[i].addEventListener('click', function () {
        track('Nav: UseCases click', { variant: variant });
      });
    }

    // TestFlight click-through, tagged with the variant so signup-intent can be
    // attributed to the label a visitor saw. (Plausible's outbound-links extension
    // also logs its own generic event; this one carries the variant + location.)
    var tfLinks = document.querySelectorAll('[data-testflight-link]');
    for (var j = 0; j < tfLinks.length; j++) {
      tfLinks[j].addEventListener('click', function (e) {
        var location = e.currentTarget.getAttribute('data-tf-location') || 'unknown';
        track('TestFlight: Click', { variant: variant, location: location });
      });
    }
  });
})();
