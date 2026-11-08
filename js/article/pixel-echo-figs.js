/* Pixel Echo: in-text figures.
 * fig "emergence": pick a cohort and N, see its field and how fast it settles.
 * fig "profiles": per-period increments and energy shares for every cohort. */
(function () {
  'use strict';
  var K = window.ArticleKit;

  var GROUPS = [
    { en: 'Control', zh: '对照', keys: ['real'] },
    { en: 'No latent decoder', zh: '无 latent decoder', keys: ['pixeldit'] },
    { en: '×8 latent decoders', zh: '×8 latent decoder', keys: ['sdvae', 'sdxl'] },
    { en: '×16 latent decoders', zh: '×16 latent decoder', keys: ['alitok', 'ort', 'rae', 'cosmos'] },
    { en: 'Closed API (pipeline unknown)', zh: '闭源 API（流程未知）', keys: ['gptimage1', 'seedream3'] }
  ];
  var ROUTE = {
    real: { en: 'real photos', zh: '真实照片' },
    pixeldit: { en: 'generation, pixel space', zh: '生成，像素空间' },
    sdvae: { en: 'reconstruction', zh: '重建' },
    sdxl: { en: 'reconstruction', zh: '重建' },
    alitok: { en: 'reconstruction', zh: '重建' },
    ort: { en: 'generation via AliTok decoder', zh: '生成，经 AliTok decoder' },
    rae: { en: 'reconstruction', zh: '重建' },
    cosmos: { en: 'reconstruction', zh: '重建' },
    gptimage1: { en: 'generation', zh: '生成' },
    seedream3: { en: 'generation', zh: '生成' }
  };
  var COLORS = {
    real: '#315c78', pixeldit: '#7d8f69', sdvae: '#b48a3c', sdxl: '#d2b36f',
    alitok: '#96473f', ort: '#c4612f', rae: '#6f4a7a', cosmos: '#a07090', gptimage1: '#4f7f8f'
  };

  // ---------------- Figure: emergence explorer ----------------
  function Emergence(root, D) {
    var em = D.emergence, last = em.counts.length - 1;
    var maps = {};
    em.cohorts.forEach(function (c) { maps[c.key] = c.maps.map(K.decodeMap); });
    var state = { key: 'ort', k: 0, playing: false, scale: 'shared' };
    var sharedLim = K.maxAbs(maps.ort[last]);

    var chips = root.querySelector('.fx-chips');
    em.cohorts.forEach(function (c) {
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'fx-chip'; b.dataset.key = c.key;
      b.innerHTML = '<i style="background:' + (COLORS[c.key] || '#888') + '"></i>' + c.label;
      b.addEventListener('click', function () { state.key = c.key; draw(); });
      chips.appendChild(b);
    });
    var slider = root.querySelector('input[type=range]');
    slider.max = String(last);
    slider.addEventListener('input', function () { state.k = +slider.value; state.playing = false; draw(); });
    var play = root.querySelector('.fx-play');
    play.addEventListener('click', function () {
      if (state.k >= last) state.k = 0;
      state.playing = !state.playing; draw(); if (state.playing) tick();
    });
    root.querySelectorAll('[data-scale]').forEach(function (b) {
      b.addEventListener('click', function () { state.scale = b.dataset.scale; draw(); });
    });
    function tick() {
      if (!state.playing) return;
      if (state.k >= last) { state.playing = false; draw(); return; }
      state.k++; draw();
      setTimeout(tick, 90);
    }

    var canvas = root.querySelector('canvas.fx-map');
    var ctx = K.setupCanvas(canvas, 256, 256);
    var svg = root.querySelector('svg.fx-line');
    var CW = 600, CH = 256, m = { l: 40, r: 70, t: 14, b: 36 };
    svg.setAttribute('viewBox', '0 0 ' + CW + ' ' + CH);
    var readout = root.querySelector('.fx-readout');

    function x(c) { return m.l + Math.log10(c) / 3 * (CW - m.l - m.r); }
    function y(r) { return m.t + (1 - (Math.max(-0.2, r) + 0.2) / 1.2) * (CH - m.t - m.b); }

    function drawLine() {
      while (svg.firstChild) svg.removeChild(svg.firstChild);
      [-0.2, 0, 0.5, 1].forEach(function (v) {
        K.svgEl('line', { x1: m.l, x2: CW - m.r, y1: y(v), y2: y(v), class: v === 0 ? 'ax-zero' : 'ax-grid' }, svg);
        K.svgEl('text', { x: m.l - 6, y: y(v) + 3.5, class: 'ax-tick', 'text-anchor': 'end' }, svg).textContent = v.toFixed(1);
      });
      [1, 10, 100, 1000].forEach(function (c) {
        K.svgEl('text', { x: x(c), y: CH - m.b + 16, class: 'ax-tick', 'text-anchor': 'middle' }, svg).textContent = c.toLocaleString('en-US');
      });
      K.svgEl('text', { x: (m.l + CW - m.r) / 2, y: CH - 4, class: 'ax-label', 'text-anchor': 'middle' }, svg).textContent =
        K.t2('images averaged, N (log scale)', '平均的图像数 N（对数轴）');
      K.svgEl('line', { x1: x(em.counts[state.k]), x2: x(em.counts[state.k]), y1: m.t, y2: CH - m.b, class: 'ax-cursor' }, svg);
      em.cohorts.forEach(function (c) {
        var on = c.key === state.key;
        var d = c.r_to_final.map(function (r, i) { return (i ? 'L' : 'M') + x(em.counts[i]).toFixed(1) + ',' + y(r).toFixed(1); }).join('');
        K.svgEl('path', { d: d, fill: 'none', stroke: COLORS[c.key] || '#888', 'stroke-width': on ? 2.4 : 1.2, opacity: on ? 1 : 0.28 }, svg);
        if (on) {
          var r = c.r_to_final[state.k];
          K.svgEl('circle', { cx: x(em.counts[state.k]), cy: y(r), r: 4, fill: COLORS[c.key] || '#888' }, svg);
        }
        var yEnd = y(c.r_to_final[last]);
        if (on) K.svgEl('text', { x: CW - m.r + 6, y: yEnd + 4, class: 'ax-series', fill: COLORS[c.key] || '#888' }, svg).textContent = c.label;
      });
    }

    function draw() {
      var c = em.cohorts.filter(function (z) { return z.key === state.key; })[0];
      var mp = maps[state.key][state.k];
      var lim = state.scale === 'shared' ? sharedLim : K.maxAbs(mp);
      ctx.clearRect(0, 0, 256, 256);
      K.drawMap(ctx, mp, 16, 0, 0, 256, { limit: lim });
      slider.value = String(state.k);
      var n = em.counts[state.k];
      readout.innerHTML =
        '<b>' + c.label + '</b> · N = ' + n.toLocaleString('en-US') +
        ' · r<sub>N→1000</sub> = ' + c.r_to_final[state.k].toFixed(2) +
        ' · ' + K.t2('colour limit ±', '色标 ±') + lim.toPrecision(2) +
        (state.scale === 'shared' ? K.t2(' (shared, ORT max)', '（共享，取 ORT 最大值）') : K.t2(' (this panel)', '（本图自适应）'));
      chips.querySelectorAll('.fx-chip').forEach(function (b) { b.classList.toggle('is-active', b.dataset.key === state.key); });
      root.querySelectorAll('[data-scale]').forEach(function (b) { b.classList.toggle('is-active', b.dataset.scale === state.scale); });
      play.classList.toggle('is-playing', state.playing);
      drawLine();
    }
    K.onLang(draw);
    draw();
  }

  // ---------------- Figure: scale profiles ----------------
  function Profiles(root, D) {
    var at = D.atlas, byKey = {};
    at.cohorts.forEach(function (c) { byKey[c.key] = c; });
    var periods = ['2', '4', '8', '16'];
    var tones = ['#e8d3c8', '#d6a48d', '#c4612f', '#7d3517'];
    var host = root.querySelector('.fx-profiles');

    function build() {
      host.innerHTML = '';
      var head = document.createElement('div');
      head.className = 'pr-row pr-head';
      head.innerHTML = '<div class="pr-name"></div>' + periods.map(function (p) { return '<div class="pr-cell">ΔP' + p + '</div>'; }).join('') +
        '<div class="pr-bar">' + K.t2('energy share by period', '各周期能量占比') + '</div>' +
        '<div class="pr-amp">' + K.t2('RMS vs Real', '相对 Real 的 RMS') + '</div>';
      host.appendChild(head);
      var realTot = total(byKey.real);
      GROUPS.forEach(function (g) {
        var gh = document.createElement('div');
        gh.className = 'pr-group';
        gh.textContent = K.t2(g.en, g.zh);
        host.appendChild(gh);
        g.keys.forEach(function (key) {
          var c = byKey[key]; if (!c) return;
          var row = document.createElement('div');
          row.className = 'pr-row';
          var e = periods.map(function (p) { return c.rms[p] * c.rms[p]; });
          var s = e.reduce(function (a, b) { return a + b; }, 0);
          var lim = Math.max.apply(null, periods.map(function (p) { return K.maxAbs(c.primitive[p]); }));
          var route = ROUTE[key] ? K.t2(ROUTE[key].en, ROUTE[key].zh) : '';
          row.innerHTML = '<div class="pr-name"><b>' + c.label + '</b><span>' + route + ' · ' + c.res + '</span></div>' +
            periods.map(function () { return '<div class="pr-cell"><canvas></canvas></div>'; }).join('') +
            '<div class="pr-bar"><div class="pr-stack">' + e.map(function (v, i) {
              var pct = v / s * 100;
              return '<span style="width:' + pct.toFixed(2) + '%;background:' + tones[i] + '" title="P' + periods[i] + ': ' + pct.toFixed(1) + '%">' +
                (pct >= 14 ? '<em' + (i >= 2 ? ' class="on-dark"' : '') + '>' + Math.round(pct) + '%</em>' : '') + '</span>';
            }).join('') + '</div></div>' +
            '<div class="pr-amp">' + ampCell(Math.sqrt(s) / realTot) + '</div>';
          host.appendChild(row);
          row.querySelectorAll('canvas').forEach(function (cv, i) {
            var p = +periods[i], ctx = K.setupCanvas(cv, 56, 56);
            K.drawMap(ctx, K.tile(c.primitive[periods[i]], p, 16), 16, 0, 0, 56, { limit: lim });
          });
        });
      });
    }
    function total(c) { return Math.sqrt(periods.reduce(function (a, p) { return a + c.rms[p] * c.rms[p]; }, 0)); }
    function ampCell(v) {
      // log scale bar from 0.5x to 50x
      var w = Math.max(2, Math.min(100, (Math.log10(v) + 0.3) / 2 * 100));
      return '<span class="pr-amp__bar"><span style="width:' + w.toFixed(1) + '%"></span></span><span class="pr-amp__val">' +
        (v >= 10 ? v.toFixed(0) : v.toFixed(1)) + '×</span>';
    }
    K.onLang(build);
    build();
  }

  function init() {
    var figs = document.querySelectorAll('[data-pe-fig]');
    if (!figs.length) return;
    K.loadJSON(figs[0].getAttribute('data-src')).then(function (D) {
      figs.forEach(function (f) {
        var kind = f.getAttribute('data-pe-fig');
        if (kind === 'emergence') Emergence(f, D);
        if (kind === 'profiles') Profiles(f, D);
      });
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
