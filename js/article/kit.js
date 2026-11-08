/* Article kit: shared drawing helpers for long-form posts.
 * One palette, one heatmap renderer, one chart style, so every figure in a
 * post reads as part of the same system. */
(function (global) {
  'use strict';

  // Signed-phase palette shared with the Pixel Echo paper figures:
  // negative blue, zero warm white, positive red.
  var DIVERGING = ['#315c78', '#b9d0d9', '#f7f5f0', '#ddb3a6', '#96473f'];

  var SERIES = {
    ink: '#1d2327',
    muted: '#6b7479',
    faint: '#d9dcd8',
    accent: '#c4612f',
    blue: '#315c78',
    red: '#96473f',
    gold: '#b48a3c'
  };

  function hexToRgb(h) {
    var n = parseInt(h.slice(1), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  var STOPS = DIVERGING.map(hexToRgb);

  // v in [-1, 1] -> [r, g, b]
  function diverging(v) {
    if (!(v === v)) v = 0;
    v = Math.max(-1, Math.min(1, v));
    var x = (v + 1) / 2 * (STOPS.length - 1);
    var i = Math.min(STOPS.length - 2, Math.floor(x));
    var f = x - i, a = STOPS[i], b = STOPS[i + 1];
    return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, a[2] + (b[2] - a[2]) * f];
  }
  function rgb(c, alpha) {
    return alpha == null
      ? 'rgb(' + (c[0] | 0) + ',' + (c[1] | 0) + ',' + (c[2] | 0) + ')'
      : 'rgba(' + (c[0] | 0) + ',' + (c[1] | 0) + ',' + (c[2] | 0) + ',' + alpha + ')';
  }

  // Decode a map stored as [scale, base64(int8)].
  function decodeMap(entry) {
    var s = entry[0], bin = atob(entry[1]), out = new Float32Array(bin.length);
    for (var i = 0; i < bin.length; i++) {
      var b = bin.charCodeAt(i);
      out[i] = (b > 127 ? b - 256 : b) / 127 * s;
    }
    return out;
  }

  function maxAbs(arr) {
    var m = 0;
    for (var i = 0; i < arr.length; i++) m = Math.max(m, Math.abs(arr[i]));
    return m || 1;
  }

  // Tile a q x q template over an n x n grid.
  function tile(template, q, n) {
    var out = new Float32Array(n * n);
    for (var i = 0; i < n; i++)
      for (var j = 0; j < n; j++) out[i * n + j] = template[(i % q) * q + (j % q)];
    return out;
  }

  /* Draw an n x n signed map into ctx at (x, y, size).
   * opts: limit (shared color limit), alpha, grid (cell lines every k cells), outline */
  function drawMap(ctx, values, n, x, y, size, opts) {
    opts = opts || {};
    var lim = opts.limit || maxAbs(values), cell = size / n, a = opts.alpha == null ? 1 : opts.alpha;
    for (var i = 0; i < n; i++) {
      for (var j = 0; j < n; j++) {
        ctx.fillStyle = rgb(diverging(values[i * n + j] / lim), a);
        ctx.fillRect(x + j * cell, y + i * cell, Math.ceil(cell), Math.ceil(cell));
      }
    }
    if (opts.grid) {
      ctx.save();
      ctx.strokeStyle = 'rgba(29,35,39,' + (0.18 * a) + ')';
      ctx.lineWidth = 1;
      for (var k = opts.grid; k < n; k += opts.grid) {
        var p = Math.round(k * cell) + 0.5;
        ctx.beginPath(); ctx.moveTo(x + p, y); ctx.lineTo(x + p, y + size); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x, y + p); ctx.lineTo(x + size, y + p); ctx.stroke();
      }
      ctx.restore();
    }
    if (opts.outline !== false) {
      ctx.save();
      ctx.strokeStyle = 'rgba(29,35,39,' + (0.35 * a) + ')';
      ctx.lineWidth = 1;
      ctx.strokeRect(Math.round(x) + 0.5, Math.round(y) + 0.5, Math.round(size) - 1, Math.round(size) - 1);
      ctx.restore();
    }
  }

  // Grayscale image (values in [0,1]).
  function drawGray(ctx, values, w, h, x, y, cell, alpha) {
    for (var i = 0; i < h; i++)
      for (var j = 0; j < w; j++) {
        var g = Math.max(0, Math.min(1, values[i * w + j])) * 255;
        ctx.fillStyle = rgb([g, g, g], alpha == null ? 1 : alpha);
        ctx.fillRect(x + j * cell, y + i * cell, Math.ceil(cell), Math.ceil(cell));
      }
  }

  // HiDPI canvas with a logical coordinate system of w x h.
  function setupCanvas(canvas, w, h) {
    var dpr = Math.min(global.devicePixelRatio || 1, 2);
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    var ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingEnabled = false;
    return ctx;
  }

  function pearson(a, b) {
    var n = a.length, ma = 0, mb = 0;
    for (var i = 0; i < n; i++) { ma += a[i]; mb += b[i]; }
    ma /= n; mb /= n;
    var sab = 0, saa = 0, sbb = 0;
    for (i = 0; i < n; i++) {
      var da = a[i] - ma, db = b[i] - mb;
      sab += da * db; saa += da * da; sbb += db * db;
    }
    return saa && sbb ? sab / Math.sqrt(saa * sbb) : 0;
  }

  // Easing
  function clamp01(t) { return Math.max(0, Math.min(1, t)); }
  function ease(t) { t = clamp01(t); return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
  function seg(t, a, b) { return clamp01((t - a) / (b - a)); }
  function lerp(a, b, t) { return a + (b - a) * t; }

  // Current language ('en' | 'zh'), driven by <html data-lang>.
  function lang() { return document.documentElement.getAttribute('data-lang') === 'zh' ? 'zh' : 'en'; }
  function t2(en, zh) { return lang() === 'zh' ? zh : en; }

  // Font stacks used inside canvases (match article.css).
  var FONT = '"Inter", "PingFang SC", "Hiragino Sans GB", "Noto Sans SC", system-ui, sans-serif';
  var MONO = '"JetBrains Mono", "SFMono-Regular", Menlo, monospace';

  function svgEl(tag, attrs, parent) {
    var el = document.createElementNS('http://www.w3.org/2000/svg', tag);
    for (var k in attrs) if (attrs[k] != null) el.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(el);
    return el;
  }

  // Load JSON once per URL.
  var cache = {};
  function loadJSON(url) {
    if (!cache[url]) cache[url] = fetch(url).then(function (r) {
      if (!r.ok) throw new Error(url + ': ' + r.status);
      return r.json();
    });
    return cache[url];
  }

  // Notify charts when language changes so canvases can redraw text.
  var langListeners = [];
  function onLang(fn) { langListeners.push(fn); }

  function initArticle() {
    var root = document.documentElement, saved = null;
    try { saved = localStorage.getItem('article-lang'); } catch (e) {}
    var param = new URLSearchParams(global.location.search).get('lang');
    if (param === 'zh' || param === 'en') saved = param;
    if (saved === 'zh' || saved === 'en') root.setAttribute('data-lang', saved);
    document.querySelectorAll('[data-set-lang]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var l = btn.getAttribute('data-set-lang');
        root.setAttribute('data-lang', l);
        try { localStorage.setItem('article-lang', l); } catch (e) {}
        syncLangButtons();
        langListeners.forEach(function (fn) { fn(l); });
      });
    });
    syncLangButtons();

    // Number figures in document order and resolve [data-figref] links.
    var figs = document.querySelectorAll('figure[data-fig]'), map = {};
    figs.forEach(function (f, i) {
      map[f.getAttribute('data-fig')] = i + 1;
      f.querySelectorAll('.fig-num').forEach(function (s) { s.textContent = String(i + 1); });
    });
    document.querySelectorAll('[data-figref]').forEach(function (a) {
      var id = a.getAttribute('data-figref');
      if (map[id]) { a.textContent = String(map[id]); a.setAttribute('href', '#fig-' + id); }
    });
    figs.forEach(function (f) { f.id = f.id || 'fig-' + f.getAttribute('data-fig'); });

    // Contents rail: highlight the section in view.
    var links = document.querySelectorAll('.article-toc a[href^="#"]');
    if ('IntersectionObserver' in global && links.length) {
      var byId = {};
      links.forEach(function (a) { byId[a.getAttribute('href').slice(1)] = a; });
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting && byId[e.target.id]) {
            links.forEach(function (a) { a.classList.remove('is-active'); });
            byId[e.target.id].classList.add('is-active');
          }
        });
      }, { rootMargin: '-20% 0px -70% 0px' });
      Object.keys(byId).forEach(function (id) { var s = document.getElementById(id); if (s) io.observe(s); });
    }
  }
  function syncLangButtons() {
    var l = lang();
    document.querySelectorAll('[data-set-lang]').forEach(function (b) {
      b.classList.toggle('is-active', b.getAttribute('data-set-lang') === l);
      b.setAttribute('aria-pressed', b.getAttribute('data-set-lang') === l ? 'true' : 'false');
    });
  }

  global.ArticleKit = {
    DIVERGING: DIVERGING, SERIES: SERIES, FONT: FONT, MONO: MONO,
    diverging: diverging, rgb: rgb, decodeMap: decodeMap, maxAbs: maxAbs, tile: tile,
    drawMap: drawMap, drawGray: drawGray, setupCanvas: setupCanvas, pearson: pearson,
    ease: ease, seg: seg, lerp: lerp, clamp01: clamp01,
    lang: lang, t2: t2, onLang: onLang, svgEl: svgEl, loadJSON: loadJSON
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initArticle);
  else initArticle();
})(window);
