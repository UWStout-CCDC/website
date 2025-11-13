/*
  Seamless left->right infinite scroller:
  - the .sponsor-track contains two identical inline blocks side-by-side.
  - CSS animation transforms the track from -100% -> 0, which makes the content appear to move right.
  - JS clones the original set into the clone container, measures widths, and sets animation duration
    based on desired speed (pixels per second) so scrolling rate is constant across sizes.
*/

(function () {
  const track = document.getElementById('sponsorTrack');
  const orig = document.getElementById('origList');
  const clone = document.getElementById('cloneList');

  if (!track || !orig || !clone) return;

  // Duplicate the original logos into the clone container
  function duplicateLogos() {
    clone.innerHTML = orig.innerHTML;
  }

  // Calculate width of one set (orig) and set animation duration from CSS variable --speed (px/s)
  function updateAnimation() {
    // ensure logos have loaded
    const imgs = orig.querySelectorAll('img');
    const loadPromises = Array.from(imgs).map(img => {
      if (img.complete) return Promise.resolve();
      return new Promise(resolve => { img.onload = img.onerror = resolve; });
    });

    Promise.all(loadPromises).then(() => {
      // measure widths
      // We need the computed width of the combined inline block (orig)
      const origRect = orig.getBoundingClientRect();
      const origWidth = Math.ceil(origRect.width);

      // If there are no logos or width is zero, fall back
      if (!origWidth) {
        track.style.setProperty('--duration', 'var(--duration)');
        return;
      }

      // read speed from CSS var --speed (px per second)
      const style = getComputedStyle(document.documentElement);
      let speed = parseFloat(style.getPropertyValue('--speed')) || 120; // px / s

      // We animate the track from -origWidth to 0, but the full translation distance equals origWidth.
      // Duplicate is beside it so the loop is seamless. Duration = distance / speed.
      const durationSeconds = (origWidth) / speed;

      // Add a tiny padding so very small durations don't break visual smoothness
      const minDuration = 6; // seconds
      const finalDuration = Math.max(durationSeconds, minDuration);

      // set CSS animation duration on the track
      track.style.animationDuration = finalDuration + 's';
    });
  }

  // Rebuild/measure on load and on resize
  function refresh() {
    duplicateLogos();
    // Allow next frame for DOM to update
    requestAnimationFrame(updateAnimation);
  }

  // initial run
  refresh();

  // Recalc on window resize (debounced)
  let rtid = null;
  window.addEventListener('resize', () => {
    if (rtid) clearTimeout(rtid);
    rtid = setTimeout(refresh, 150);
  });

  // If new logos are added dynamically, you can call refresh() manually from outside.
  // Expose a simple API to window for convenience:
  window.sponsorBanner = {
    refresh,
    setSpeed(pxPerSec) {
      document.documentElement.style.setProperty('--speed', pxPerSec);
      refresh();
    }
  };
})();
