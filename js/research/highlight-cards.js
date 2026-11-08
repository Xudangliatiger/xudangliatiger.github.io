/* Animated visuals for Highlight project cards.
 * A card opts in with data-card-anim on its visual:
 *   "pixel-echo"      measured P16 field sharpening as images are averaged (data-src)
 *   "coarse-to-fine"  the card image refined from coarse blocks to full resolution (data-image)
 * Animations run only while the card is on screen and stay static under reduced motion. */
(function () {
  'use strict';

  var STOPS = ['#315c78', '#b9d0d9', '#f7f5f0', '#ddb3a6', '#96473f'].map(function (h) {
    var n = parseInt(h.slice(1), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  });
  function diverging(v) {
    v = Math.max(-1, Math.min(1, v || 0));
    var x = (v + 1) / 2 * (STOPS.length - 1), i = Math.min(STOPS.length - 2, Math.floor(x)), f = x - i;
    var a = STOPS[i], b = STOPS[i + 1];
    return 'rgb(' + ((a[0] + (b[0] - a[0]) * f) | 0) + ',' + ((a[1] + (b[1] - a[1]) * f) | 0) + ',' + ((a[2] + (b[2] - a[2]) * f) | 0) + ')';
  }
  function decodeMap(entry) {
    var s = entry[0], bin = atob(entry[1]), out = new Float32Array(bin.length);
    for (var i = 0; i < bin.length; i++) { var b = bin.charCodeAt(i); out[i] = (b > 127 ? b - 256 : b) / 127 * s; }
    return out;
  }
  function ease(t) { t = Math.max(0, Math.min(1, t)); return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function fit(canvas) {
    var r = canvas.getBoundingClientRect(), dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = Math.max(1, Math.round(r.width)), h = Math.max(1, Math.round(r.height));
    if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
    }
    var ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingEnabled = false;
    return { ctx: ctx, w: w, h: h };
  }
  function badge(ctx, text, x, y) {
    ctx.font = '600 11px "JetBrains Mono", Menlo, monospace';
    var w = ctx.measureText(text).width + 16;
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.fillRect(x - w, y, w, 22);
    ctx.fillStyle = '#1d2327';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, x - w + 8, y + 11.5);
  }

  // ---- Pixel Echo: the 16 x 16 field tiled like it repeats across an image ----
  function PixelEcho(host, data) {
    var canvas = host.querySelector('canvas');
    var maps = data.maps.map(decodeMap), last = maps.length - 1;
    var lim = 0;
    maps[last].forEach(function (v) { lim = Math.max(lim, Math.abs(v)); });
    var GROW = 6, HOLD = 2.2, FADE = 0.8, T = GROW + HOLD + FADE;

    function drawState(ctx, w, h, k, alpha) {
      var m = maps[k], tiles = w < 420 ? 2 : 3, cell = Math.ceil(w / (tiles * 16));
      ctx.globalAlpha = alpha;
      for (var y = 0, i = 0; y < h; y += cell, i++)
        for (var x = 0, j = 0; x < w; x += cell, j++) {
          ctx.fillStyle = diverging(m[(i % 16) * 16 + (j % 16)] / lim);
          ctx.fillRect(x, y, cell, cell);
        }
      // Faint 16-pixel grid so the repetition reads at a glance.
      ctx.strokeStyle = 'rgba(29,35,39,0.18)'; ctx.lineWidth = 1;
      for (x = 0; x < w; x += cell * 16) { ctx.beginPath(); ctx.moveTo(x + 0.5, 0); ctx.lineTo(x + 0.5, h); ctx.stroke(); }
      for (y = 0; y < h; y += cell * 16) { ctx.beginPath(); ctx.moveTo(0, y + 0.5); ctx.lineTo(w, y + 0.5); ctx.stroke(); }
      ctx.globalAlpha = 1;
    }
    function render(t) {
      var f = fit(canvas), ctx = f.ctx;
      var p = reduce ? 1 : ease(Math.min(1, t / GROW));
      var k = Math.round(p * last);
      ctx.fillStyle = '#f7f5f0'; ctx.fillRect(0, 0, f.w, f.h);
      drawState(ctx, f.w, f.h, k, 1);
      if (!reduce && t > GROW + HOLD) drawState(ctx, f.w, f.h, 0, (t - GROW - HOLD) / FADE);
      badge(ctx, 'P16 · N = ' + data.counts[k].toLocaleString('en-US'), f.w - 12, 12);
    }
    return { period: T, render: render };
  }

  // ---- Coarse to fine: the card image refined one resolution level at a time ----
  function CoarseToFine(host, img) {
    var canvas = host.querySelector('canvas');
    var levels = [32, 16, 8, 4, 2, 1], STEP = 0.7, HOLD = 2.4, T = levels.length * STEP + HOLD;
    var small = document.createElement('canvas');
    function render(t) {
      var f = fit(canvas), ctx = f.ctx;
      var li = reduce ? levels.length - 1 : Math.min(levels.length - 1, Math.floor(t / STEP));
      var b = levels[li];
      // cover-crop the source to the card's aspect
      var ar = f.w / f.h, sw = img.naturalWidth, sh = img.naturalHeight, cw = sw, ch = sw / ar;
      if (ch > sh) { ch = sh; cw = sh * ar; }
      var sx = (sw - cw) / 2, sy = (sh - ch) / 2;
      var tw = Math.max(1, Math.round(cw / b)), th = Math.max(1, Math.round(ch / b));
      small.width = tw; small.height = th;
      var sctx = small.getContext('2d');
      sctx.imageSmoothingEnabled = true;
      sctx.drawImage(img, sx, sy, cw, ch, 0, 0, tw, th);
      ctx.imageSmoothingEnabled = b === 1;
      ctx.drawImage(small, 0, 0, tw, th, 0, 0, f.w, f.h);
      badge(ctx, b === 1 ? 'full resolution' : '1/' + b + ' resolution', f.w - 12, 12);
    }
    return { period: T, render: render };
  }

  function run(host, anim) {
    var start = null, visible = false, raf = 0;
    function loop(ts) {
      if (!visible) { raf = 0; return; }
      if (start === null) start = ts;
      anim.render(((ts - start) / 1000) % anim.period);
      raf = requestAnimationFrame(loop);
    }
    anim.render(reduce ? anim.period : 0);
    if (reduce) return;
    new IntersectionObserver(function (es) {
      visible = es[0].isIntersecting;
      if (visible && !raf) { start = null; raf = requestAnimationFrame(loop); }
    }, { threshold: 0.15 }).observe(host);
    window.addEventListener('resize', function () { if (!visible) anim.render(anim.period); });
  }

  function init() {
    document.querySelectorAll('[data-card-anim]').forEach(function (host) {
      var kind = host.getAttribute('data-card-anim');
      host.classList.add('is-animated');
      if (kind === 'pixel-echo') {
        fetch(host.getAttribute('data-src')).then(function (r) { return r.json(); })
          .then(function (d) { run(host, PixelEcho(host, d)); })
          .catch(function () { host.classList.remove('is-animated'); });
      } else if (kind === 'coarse-to-fine') {
        var img = new Image();
        img.onload = function () { run(host, CoarseToFine(host, img)); };
        img.onerror = function () { host.classList.remove('is-animated'); };
        img.src = host.getAttribute('data-image');
      }
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
