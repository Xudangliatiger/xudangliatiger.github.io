/* Pixel Echo: opening film.
 * Five chapters that walk through the measurement. Chapters 2-3 run on a
 * synthetic image (labelled as such); chapters 1, 4 and 5 draw measured
 * cohort fields from data.json. */
(function () {
  'use strict';
  var K = window.ArticleKit;
  var W = 880, H = 440;

  function el(id) { return document.getElementById(id); }

  // ---------- synthetic image for the "how it is measured" chapters ----------
  var N_IMG = 64;
  function mulberry32(a) {
    return function () {
      a |= 0; a = a + 0x6D2B79F5 | 0;
      var t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  function makeSynthetic(template) {
    var rnd = mulberry32(7), img = new Float32Array(N_IMG * N_IMG), tmax = K.maxAbs(template);
    for (var i = 0; i < N_IMG; i++) {
      for (var j = 0; j < N_IMG; j++) {
        var u = j / N_IMG, v = i / N_IMG;
        var sky = 0.78 - 0.35 * v;
        var hill = v > 0.62 + 0.08 * Math.sin(u * 5.2) ? -0.28 : 0;
        var dx = u - 0.68, dy = v - 0.3, sun = Math.exp(-(dx * dx + dy * dy) / 0.012) * 0.2;
        var tex = 0.03 * Math.sin(u * 23 + v * 9) * (v > 0.62 ? 1 : 0.2);
        // A faint pattern locked to the 16-pixel grid: what a decoder would add.
        var echo = 0.035 * template[(i % 16) * 16 + (j % 16)] / tmax;
        img[i * N_IMG + j] = sky + hill + sun + tex + echo + (rnd() - 0.5) * 0.02;
      }
    }
    return img;
  }
  function laplacian(img, n) {
    var out = new Float32Array(n * n);
    function at(i, j) { i = Math.max(0, Math.min(n - 1, i)); j = Math.max(0, Math.min(n - 1, j)); return img[i * n + j]; }
    for (var i = 0; i < n; i++)
      for (var j = 0; j < n; j++)
        out[i * n + j] = Math.abs(4 * at(i, j) - at(i - 1, j) - at(i + 1, j) - at(i, j - 1) - at(i, j + 1));
    return out;
  }
  function percentile(arr, p) {
    var s = Array.prototype.slice.call(arr).sort(function (a, b) { return a - b; });
    return s[Math.floor(p * (s.length - 1))] || 1;
  }
  // Block-average a response map onto 16 x 16 phases, first k blocks only.
  function foldBlocks(resp, k) {
    var acc = new Float32Array(256), nb = N_IMG / 16;
    for (var b = 0; b < k; b++) {
      var bi = Math.floor(b / nb), bj = b % nb;
      for (var i = 0; i < 16; i++)
        for (var j = 0; j < 16; j++) acc[i * 16 + j] += resp[(bi * 16 + i) * N_IMG + bj * 16 + j];
    }
    for (i = 0; i < 256; i++) acc[i] /= Math.max(1, k);
    return acc;
  }
  function centered(a) {
    var m = 0, out = new Float32Array(a.length);
    for (var i = 0; i < a.length; i++) m += a[i];
    m /= a.length;
    for (i = 0; i < a.length; i++) out[i] = a[i] - m;
    return out;
  }

  // ---------- drawing helpers ----------
  function heading(ctx, title, sub) {
    ctx.fillStyle = K.SERIES.ink;
    ctx.font = '600 17px ' + K.FONT;
    ctx.textBaseline = 'alphabetic';
    ctx.fillText(title, 28, 38);
    ctx.fillStyle = K.SERIES.muted;
    ctx.font = '400 13px ' + K.FONT;
    ctx.fillText(sub, 28, 60);
  }
  function label(ctx, text, x, y, opts) {
    opts = opts || {};
    ctx.save();
    ctx.globalAlpha = opts.alpha == null ? 1 : opts.alpha;
    ctx.fillStyle = opts.color || K.SERIES.ink;
    ctx.font = (opts.weight || 500) + ' ' + (opts.size || 12) + 'px ' + (opts.mono ? K.MONO : K.FONT);
    ctx.textAlign = opts.align || 'center';
    ctx.textBaseline = opts.baseline || 'alphabetic';
    ctx.fillText(text, x, y);
    ctx.restore();
  }
  function arrow(ctx, x1, y1, x2, y2, p, color) {
    if (p <= 0) return;
    var x = K.lerp(x1, x2, p), y = K.lerp(y1, y2, p);
    ctx.save();
    ctx.strokeStyle = color || K.SERIES.muted;
    ctx.fillStyle = color || K.SERIES.muted;
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x, y); ctx.stroke();
    if (p > 0.95) {
      var a = Math.atan2(y2 - y1, x2 - x1);
      ctx.beginPath();
      ctx.moveTo(x2, y2);
      ctx.lineTo(x2 - 8 * Math.cos(a - 0.4), y2 - 8 * Math.sin(a - 0.4));
      ctx.lineTo(x2 - 8 * Math.cos(a + 0.4), y2 - 8 * Math.sin(a + 0.4));
      ctx.closePath(); ctx.fill();
    }
    ctx.restore();
  }
  function pill(ctx, text, x, y, alpha, fill, color) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.font = '600 12px ' + K.FONT;
    var w = ctx.measureText(text).width + 22, h = 26;
    ctx.fillStyle = fill || '#fff';
    ctx.strokeStyle = 'rgba(29,35,39,0.18)';
    roundRect(ctx, x - w / 2, y - h / 2, w, h, 13);
    ctx.fill(); ctx.stroke();
    ctx.fillStyle = color || K.SERIES.ink;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(text, x, y + 0.5);
    ctx.restore();
  }
  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }
  function box(ctx, text, x, y, w, h, alpha, strong) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = strong ? '#1d2327' : '#fff';
    ctx.strokeStyle = strong ? '#1d2327' : 'rgba(29,35,39,0.25)';
    roundRect(ctx, x, y, w, h, 8);
    ctx.fill(); ctx.stroke();
    ctx.fillStyle = strong ? '#fff' : K.SERIES.ink;
    ctx.font = '500 12.5px ' + K.FONT;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    var lines = text.split('\n');
    lines.forEach(function (ln, k) { ctx.fillText(ln, x + w / 2, y + h / 2 + (k - (lines.length - 1) / 2) * 16); });
    ctx.restore();
  }
  function colorbar(ctx, x, y, w, lim, text) {
    for (var i = 0; i < w; i++) {
      ctx.fillStyle = K.rgb(K.diverging(i / (w - 1) * 2 - 1));
      ctx.fillRect(x + i, y, 1, 8);
    }
    ctx.strokeStyle = 'rgba(29,35,39,0.3)';
    ctx.strokeRect(x + 0.5, y + 0.5, w - 1, 7);
    label(ctx, '−' + lim, x, y + 21, { size: 10, color: K.SERIES.muted, align: 'left', mono: true });
    label(ctx, '0', x + w / 2, y + 21, { size: 10, color: K.SERIES.muted, mono: true });
    label(ctx, '+' + lim, x + w, y + 21, { size: 10, color: K.SERIES.muted, align: 'right', mono: true });
    if (text) label(ctx, text, x + w / 2, y - 6, { size: 10.5, color: K.SERIES.muted });
  }

  // ---------- chapters ----------
  function buildChapters(D) {
    var em = D.emergence, at = D.atlas;
    function cohort(key) { return em.cohorts.filter(function (c) { return c.key === key; })[0]; }
    function atlasCohort(key) { return at.cohorts.filter(function (c) { return c.key === key; })[0]; }
    var last = em.counts.length - 1;
    var real = cohort('real'), ort = cohort('ort'), ali = cohort('alitok');
    var finals = {
      real: K.decodeMap(real.maps[last]),
      ort: K.decodeMap(ort.maps[last]),
      alitok: K.decodeMap(ali.maps[last])
    };
    var realMaps = real.maps.map(K.decodeMap), ortMaps = ort.maps.map(K.decodeMap);
    var sharedLim = Math.max(K.maxAbs(finals.ort), K.maxAbs(finals.alitok));
    var rOrtAli = em.final_corr.ort.alitok, rOrtReal = em.final_corr.ort.real;

    var img = makeSynthetic(finals.ort);
    var resp = laplacian(img, N_IMG);
    var respHi = percentile(resp, 0.98);
    var foldFull = centered(foldBlocks(resp, 16));
    var foldLim = K.maxAbs(foldFull);

    var aOrt = atlasCohort('ort'), aSd = atlasCohort('sdvae');
    var periods = ['2', '4', '8', '16'];
    var inc = periods.map(function (p) { return K.tile(aOrt.primitive[p], +p, 16); });
    var fullOrt = new Float32Array(aOrt.full);
    var incLim = K.maxAbs(fullOrt);
    function shares(c) {
      var e = periods.map(function (p) { return c.rms[p] * c.rms[p]; });
      var s = e.reduce(function (a, b) { return a + b; }, 0);
      return e.map(function (v) { return v / s; });
    }
    var shOrt = shares(aOrt), shSd = shares(aSd);

    function respColor(v) {
      // Non-negative response: warm white -> red.
      return K.diverging(Math.min(1, v / respHi));
    }
    function drawResp(ctx, x, y, cell, rows, alpha) {
      for (var i = 0; i < rows; i++)
        for (var j = 0; j < N_IMG; j++) {
          ctx.fillStyle = K.rgb(respColor(resp[i * N_IMG + j]), alpha);
          ctx.fillRect(x + j * cell, y + i * cell, Math.ceil(cell), Math.ceil(cell));
        }
    }

    return [
      {
        id: 'claim', en: 'Claim', zh: '结论', dur: 7,
        draw: function (ctx, t) {
          heading(ctx, K.t2('Images that leave the same decoder carry the same echo',
                            '经过同一个 decoder 的图像，带着同一个回声'),
                  K.t2('Pooled 16 × 16 phase field, 1,000 images per route. Same colour scale.',
                       '按 16 × 16 相位池化，每条路径 1,000 张图，同一色标。'));
          var rows = [
            { y: 128, src: K.t2('Real photo', '真实照片'), via: K.t2('no decoder', '不经过 decoder'), map: finals.real, name: 'Real' },
            { y: 242, src: K.t2('Real photo\n→ encode', '真实照片\n→ 编码'), via: 'AliTok decoder ×16', map: finals.alitok, name: 'AliTok RECON' },
            { y: 356, src: K.t2('Generated\nlatent (ORT)', '生成的\nlatent（ORT）'), via: 'AliTok decoder ×16', map: finals.ort, name: 'ORT GEN' }
          ];
          rows.forEach(function (r, k) {
            var p = K.ease(K.seg(t, 0.04 + k * 0.1, 0.3 + k * 0.1));
            box(ctx, r.src, 40, r.y - 24, 128, 48, p);
            var dec = k > 0;
            if (dec) box(ctx, 'decoder', 250, r.y - 18, 96, 36, p, true);
            else label(ctx, r.via, 298, r.y + 4, { alpha: p, color: K.SERIES.muted, size: 11.5 });
            arrow(ctx, 172, r.y, dec ? 246 : 240, r.y, K.seg(t, 0.12 + k * 0.1, 0.3 + k * 0.1));
            arrow(ctx, dec ? 350 : 356, r.y, 420, r.y, K.seg(t, 0.2 + k * 0.1, 0.38 + k * 0.1));
            var mp = K.ease(K.seg(t, 0.28 + k * 0.1, 0.48 + k * 0.1));
            if (mp > 0) {
              K.drawMap(ctx, r.map, 16, 428, r.y - 48, 96, { limit: sharedLim, alpha: mp });
              label(ctx, r.name, 476, r.y + 64, { alpha: mp, size: 11.5, color: K.SERIES.muted });
            }
          });
          var q = K.ease(K.seg(t, 0.62, 0.8));
          if (q > 0) {
            ctx.save();
            ctx.globalAlpha = q;
            ctx.strokeStyle = K.SERIES.accent; ctx.lineWidth = 1.5;
            ctx.beginPath(); ctx.moveTo(540, 210); ctx.quadraticCurveTo(575, 299, 540, 388); ctx.stroke();
            ctx.restore();
            pill(ctx, 'r = ' + rOrtAli.toFixed(2), 640, 299, q, '#fbeee6', K.SERIES.accent);
            label(ctx, K.t2('same decoder, two routes', '同一个 decoder，两条路径'), 640, 329, { alpha: q, size: 11.5, color: K.SERIES.muted });
            ctx.save(); ctx.globalAlpha = q * 0.6; ctx.setLineDash([3, 4]);
            ctx.strokeStyle = K.SERIES.muted; ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(540, 128); ctx.lineTo(600, 128); ctx.stroke();
            ctx.restore();
            pill(ctx, 'r = ' + rOrtReal.toFixed(2) + K.t2(' vs ORT', '（对 ORT）'), 668, 128, q);
          }
          var z = K.ease(K.seg(t, 0.82, 0.95));
          if (z > 0) colorbar(ctx, 720, 400, 120, sharedLim.toFixed(2), K.t2('centered response', '中心化响应'));
        }
      },
      {
        id: 'response', en: 'Local response', zh: '局部响应', dur: 7,
        draw: function (ctx, t) {
          heading(ctx, K.t2('Step 1 · How much does each pixel differ from its four neighbours?',
                            '第 1 步 · 每个像素和上下左右四个邻居差多少？'),
                  K.t2('Synthetic 64 × 64 image with a faint grid-locked pattern added (schematic).',
                       '合成的 64 × 64 图像，叠加了一个很弱的、锁定在网格上的图案（示意）。'));
          var x0 = 56, y0 = 96, cell = 4, S = N_IMG * cell;
          K.drawGray(ctx, img, N_IMG, N_IMG, x0, y0, cell);
          ctx.strokeStyle = 'rgba(29,35,39,0.35)'; ctx.strokeRect(x0 + 0.5, y0 + 0.5, S - 1, S - 1);
          label(ctx, K.t2('image Y', '亮度 Y'), x0 + S / 2, y0 + S + 22, { color: K.SERIES.muted });

          var scan = K.seg(t, 0.08, 0.86), pos = Math.floor(scan * N_IMG * N_IMG);
          var row = Math.min(N_IMG - 1, Math.floor(pos / N_IMG)), col = pos % N_IMG;
          var x1 = 568;
          ctx.fillStyle = '#f7f5f0'; ctx.fillRect(x1, y0, S, S);
          drawResp(ctx, x1, y0, cell, scan >= 1 ? N_IMG : row, 1);
          for (var j = 0; j < col && scan < 1; j++) {
            ctx.fillStyle = K.rgb(respColor(resp[row * N_IMG + j]));
            ctx.fillRect(x1 + j * cell, y0 + row * cell, cell, cell);
          }
          ctx.strokeStyle = 'rgba(29,35,39,0.35)'; ctx.strokeRect(x1 + 0.5, y0 + 0.5, S - 1, S - 1);
          label(ctx, K.t2('response E', '响应 E'), x1 + S / 2, y0 + S + 22, { color: K.SERIES.muted });

          if (scan > 0 && scan < 1) {
            ctx.strokeStyle = K.SERIES.accent; ctx.lineWidth = 1.5;
            ctx.strokeRect(x0 + (col - 1) * cell, y0 + (row - 1) * cell, 3 * cell, 3 * cell);
            ctx.strokeRect(x1 + col * cell, y0 + row * cell, cell, cell);
          }
          // Kernel
          var kx = 372, ky = 150, kc = 34, w = [[0, -1, 0], [-1, 4, -1], [0, -1, 0]];
          for (var a = 0; a < 3; a++) for (var b = 0; b < 3; b++) {
            ctx.fillStyle = w[a][b] === 4 ? '#fbeee6' : (w[a][b] ? '#f3f1ec' : '#fff');
            ctx.fillRect(kx + b * kc, ky + a * kc, kc, kc);
            ctx.strokeStyle = 'rgba(29,35,39,0.2)'; ctx.strokeRect(kx + b * kc + 0.5, ky + a * kc + 0.5, kc - 1, kc - 1);
            label(ctx, String(w[a][b]), kx + b * kc + kc / 2, ky + a * kc + kc / 2 + 4, { mono: true, size: 13, color: w[a][b] ? K.SERIES.ink : K.SERIES.faint });
          }
          label(ctx, 'E = | 4Y − ΣN₄(Y) |', kx + 1.5 * kc, ky + 3 * kc + 34, { mono: true, size: 13 });
          label(ctx, K.t2('content mostly cancels;', '平滑内容基本抵消，'), kx + 1.5 * kc, ky + 3 * kc + 62, { size: 11.5, color: K.SERIES.muted });
          label(ctx, K.t2('edges and grid traces remain', '只剩边缘和网格痕迹'), kx + 1.5 * kc, ky + 3 * kc + 78, { size: 11.5, color: K.SERIES.muted });
        }
      },
      {
        id: 'fold', en: 'Fold onto 16 × 16', zh: '折叠到 16 × 16', dur: 7,
        draw: function (ctx, t) {
          heading(ctx, K.t2('Step 2 · Average every pixel that sits at the same grid position',
                            '第 2 步 · 把网格中同一位置的像素平均起来'),
                  K.t2('Phase (a, b) = (i mod 16, j mod 16). Content averages out; grid-locked traces add up.',
                       '相位 (a, b) = (i mod 16, j mod 16)。内容被平均掉，锁定在网格上的痕迹会累加。'));
          var x0 = 56, y0 = 96, cell = 4, S = N_IMG * cell, B = 16 * cell;
          drawResp(ctx, x0, y0, cell, N_IMG, 0.35);
          ctx.strokeStyle = 'rgba(29,35,39,0.35)'; ctx.lineWidth = 1;
          for (var g = 0; g <= 4; g++) {
            ctx.beginPath(); ctx.moveTo(x0 + g * B + 0.5, y0); ctx.lineTo(x0 + g * B + 0.5, y0 + S); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(x0, y0 + g * B + 0.5); ctx.lineTo(x0 + S, y0 + g * B + 0.5); ctx.stroke();
          }
          var tx = 600, ty = 120, TS = 192;
          var fly = K.seg(t, 0.05, 0.72), nb = 16, landed = 0;
          for (var b = 0; b < nb; b++) {
            var start = b / nb * 0.8, p = K.ease(K.seg(fly, start, start + 0.2));
            if (p >= 1) { landed++; continue; }
            if (p <= 0) continue;
            var bi = Math.floor(b / 4), bj = b % 4;
            var sx = x0 + bj * B, sy = y0 + bi * B;
            var x = K.lerp(sx, tx, p), y = K.lerp(sy, ty, p), s = K.lerp(B, TS, p);
            var c = s / 16;
            for (var i = 0; i < 16; i++) for (var j = 0; j < 16; j++) {
              ctx.fillStyle = K.rgb(respColor(resp[(bi * 16 + i) * N_IMG + bj * 16 + j]), 0.9);
              ctx.fillRect(x + j * c, y + i * c, Math.ceil(c), Math.ceil(c));
            }
          }
          var acc = landed ? centered(foldBlocks(resp, landed)) : null;
          var reveal = K.ease(K.seg(t, 0.74, 0.9));
          ctx.fillStyle = '#fff'; ctx.strokeStyle = 'rgba(29,35,39,0.25)';
          ctx.strokeRect(tx + 0.5, ty + 0.5, TS - 1, TS - 1);
          if (acc) K.drawMap(ctx, acc, 16, tx, ty, TS, { limit: foldLim, alpha: 0.35 + 0.65 * Math.min(1, landed / 16) });
          label(ctx, K.t2(landed + ' / 16 blocks averaged', '已平均 ' + landed + ' / 16 个块'), tx + TS / 2, ty + TS + 24, { color: K.SERIES.muted, mono: true, size: 11.5 });
          label(ctx, K.t2('phase field F(a, b)', '相位场 F(a, b)'), tx + TS / 2, ty - 10, { size: 12, weight: 600 });
          if (reveal > 0) {
            label(ctx, K.t2('One image is noisy.', '一张图还很嘈杂。'), tx + TS / 2, ty + TS + 56, { alpha: reveal, size: 12.5 });
            label(ctx, K.t2('Next: average over many images.', '下一步：对很多张图求平均。'), tx + TS / 2, ty + TS + 74, { alpha: reveal, size: 12.5, color: K.SERIES.muted });
          }
        }
      },
      {
        id: 'average', en: 'Average images', zh: '跨图平均', dur: 8,
        draw: function (ctx, t) {
          heading(ctx, K.t2('Step 3 · Across images, the decoder pattern locks in fast',
                            '第 3 步 · 跨图平均后，decoder 的图案很快稳定下来'),
                  K.t2('Measured fields. Left two panels share one colour scale.',
                       '实测相位场。左边两幅共用同一色标。'));
          var p = K.seg(t, 0.06, 0.82), k = Math.round(K.ease(p) * last), n = em.counts[k];
          var S = 176, y0 = 110;
          K.drawMap(ctx, realMaps[k], 16, 56, y0, S, { limit: sharedLim });
          K.drawMap(ctx, ortMaps[k], 16, 268, y0, S, { limit: sharedLim });
          label(ctx, K.t2('Real photos', '真实照片'), 56 + S / 2, y0 + S + 22, { weight: 600 });
          label(ctx, 'ORT GEN', 268 + S / 2, y0 + S + 22, { weight: 600 });
          label(ctx, 'N = ' + n.toLocaleString('en-US') + K.t2(n === 1 ? ' image' : ' images', ' 张'), 256, y0 - 14, { mono: true, size: 13, weight: 600 });
          label(ctx, K.t2('almost flat at this scale', '在这个色标下几乎是平的'), 56 + S / 2, y0 + S + 40, { size: 11.5, color: K.SERIES.muted });
          label(ctx, K.t2('pattern visible from N = 1', '从 N = 1 就看得见图案'), 268 + S / 2, y0 + S + 40, { size: 11.5, color: K.SERIES.muted });

          // r to final, log-N axis
          var cx = 520, cy = 110, cw = 320, ch = 176;
          ctx.strokeStyle = K.SERIES.faint; ctx.lineWidth = 1;
          [0, 0.5, 1].forEach(function (v) {
            var yy = cy + ch - v * ch;
            ctx.beginPath(); ctx.moveTo(cx, yy + 0.5); ctx.lineTo(cx + cw, yy + 0.5); ctx.stroke();
            label(ctx, v.toFixed(1), cx - 8, yy + 4, { align: 'right', size: 10, color: K.SERIES.muted, mono: true });
          });
          var lx = function (c) { return cx + Math.log10(c) / 3 * cw; };
          var ly = function (r) { return cy + ch - Math.max(-0.2, r) * ch; };
          [1, 10, 100, 1000].forEach(function (c) {
            label(ctx, c.toLocaleString('en-US'), lx(c), cy + ch + 18, { size: 10, color: K.SERIES.muted, mono: true });
          });
          label(ctx, K.t2('images averaged (log)', '平均的图像数（对数轴）'), cx + cw / 2, cy + ch + 38, { size: 11, color: K.SERIES.muted });
          label(ctx, K.t2('similarity to the N = 1,000 field (r)', '与 N = 1,000 时相位场的相关系数 r'), cx, cy - 14, { size: 11, color: K.SERIES.muted, align: 'left' });
          [[real, K.SERIES.blue, 'Real'], [ort, K.SERIES.accent, 'ORT GEN']].forEach(function (s, si) {
            ctx.strokeStyle = s[1]; ctx.lineWidth = 2;
            ctx.beginPath();
            for (var i = 0; i <= k; i++) {
              var X = lx(em.counts[i]), Y = ly(s[0].r_to_final[i]);
              if (i) ctx.lineTo(X, Y); else ctx.moveTo(X, Y);
            }
            ctx.stroke();
            var Xe = lx(em.counts[k]), Ye = ly(s[0].r_to_final[k]);
            ctx.fillStyle = s[1]; ctx.beginPath(); ctx.arc(Xe, Ye, 3.5, 0, 7); ctx.fill();
            // Legend with the live value, placed below the plot so it never collides with the curves.
            var lgx = cx + 20 + si * 150, lgy = cy + ch + 62;
            ctx.fillRect(lgx, lgy - 4, 14, 3);
            label(ctx, s[2] + '  r = ' + s[0].r_to_final[k].toFixed(2), lgx + 20, lgy, { align: 'left', size: 11.5, color: s[1], weight: 600 });
          });
          var z = K.ease(K.seg(t, 0.84, 0.96));
          if (z > 0) colorbar(ctx, 160, 384, 180, sharedLim.toFixed(2), K.t2('centered response', '中心化响应'));
        }
      },
      {
        id: 'split', en: 'Split by period', zh: '按周期拆分', dur: 9,
        draw: function (ctx, t) {
          heading(ctx, K.t2('Step 4 · Split the field into the parts that repeat every 2, 4, 8 and 16 pixels',
                            '第 4 步 · 把相位场拆成每 2、4、8、16 像素重复一次的部分'),
                  K.t2('ORT GEN, 1,000 images. The parts add back to the field exactly; their strengths are the scale profile.',
                       'ORT GEN，1,000 张图。各部分相加精确还原相位场；各部分的强度就是 scale profile。'));
          var S = 120, y0 = 104, x0 = 40;
          K.drawMap(ctx, fullOrt, 16, x0, y0, S, { limit: incLim, grid: 0 });
          label(ctx, 'F', x0 + S / 2, y0 + S + 20, { weight: 600, mono: true });
          label(ctx, '=', x0 + S + 22, y0 + S / 2 + 6, { size: 20, color: K.SERIES.muted });
          for (var q = 0; q < 4; q++) {
            var p = K.ease(K.seg(t, 0.06 + q * 0.12, 0.2 + q * 0.12));
            var x = x0 + S + 44 + q * (S + 34);
            if (q) label(ctx, '+', x - 17, y0 + S / 2 + 6, { size: 20, color: K.SERIES.muted, alpha: p });
            ctx.save(); ctx.globalAlpha = 0.2 + 0.8 * p;
            K.drawMap(ctx, inc[q], 16, x, y0, S, { limit: incLim, grid: +periods[q] < 16 ? +periods[q] : 0, alpha: p });
            ctx.restore();
            label(ctx, 'ΔP' + periods[q], x + S / 2, y0 + S + 20, { weight: 600, mono: true, alpha: p });
          }
          // Scale profile bars: ORT (x16) vs SD VAE (x8)
          var b = K.ease(K.seg(t, 0.58, 0.84));
          var bx = 300, by = 300, bw = 520, rowH = 30;
          label(ctx, K.t2('scale profile: share of energy per period', 'scale profile：各周期的能量占比'), bx, by - 14, { align: 'left', size: 11.5, color: K.SERIES.muted, alpha: Math.min(1, b * 3) });
          var tones = ['#e8d3c8', '#d6a48d', '#c4612f', '#7d3517'];
          [[K.t2('ORT GEN · ×16 decoder', 'ORT GEN · ×16 decoder'), shOrt], [K.t2('SD VAE RECON · ×8 decoder', 'SD VAE RECON · ×8 decoder'), shSd]].forEach(function (row, r) {
            var yy = by + r * (rowH + 18), acc = 0;
            label(ctx, row[0], bx - 12, yy + rowH / 2 + 4, { align: 'right', size: 12, alpha: Math.min(1, b * 3) });
            row[1].forEach(function (v, i) {
              var w = v * bw * b;
              ctx.fillStyle = tones[i];
              ctx.fillRect(bx + acc, yy, Math.max(0, w - 1), rowH);
              if (v * bw > 34 && b > 0.9) label(ctx, 'P' + periods[i] + ' ' + Math.round(v * 100) + '%', bx + acc + w / 2, yy + rowH / 2 + 4, { size: 10.5, color: i >= 2 ? '#fff' : K.SERIES.ink, mono: true });
              acc += w;
            });
          });
          var z = K.ease(K.seg(t, 0.86, 0.97));
          if (z > 0) label(ctx, K.t2('ORT’s ×16 decoder puts most energy at P16; the ×8 SD VAE puts most at P2.', 'ORT 的 ×16 decoder 能量主要在 P16；×8 的 SD VAE 主要在 P2。'), W / 2, 420, { size: 13, weight: 600, alpha: z });
        }
      }
    ];
  }

  // ---------- player ----------
  function Film(root, data) {
    var canvas = root.querySelector('canvas');
    var ctx = K.setupCanvas(canvas, W, H);
    var chapters = buildChapters(data);
    var tabs = root.querySelector('.film-chapters');
    var playBtn = root.querySelector('.film-play');
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var state = { i: 0, t: reduce ? 1 : 0, playing: !reduce, visible: true, last: 0 };

    tabs.innerHTML = '';
    chapters.forEach(function (c, i) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'film-tab';
      b.innerHTML = '<span class="film-tab__bar"><span></span></span><span class="film-tab__label">' +
        '<span data-lang="en">' + c.en + '</span><span data-lang="zh">' + c.zh + '</span></span>';
      b.addEventListener('click', function () { state.i = i; state.t = 0; if (!state.playing) state.t = 1; render(); syncTabs(); });
      tabs.appendChild(b);
    });

    function syncTabs() {
      tabs.querySelectorAll('.film-tab').forEach(function (b, i) {
        b.classList.toggle('is-active', i === state.i);
        b.querySelector('.film-tab__bar span').style.width =
          (i < state.i ? 100 : i === state.i ? state.t * 100 : 0) + '%';
      });
      playBtn.classList.toggle('is-playing', state.playing);
      playBtn.setAttribute('aria-label', state.playing ? 'Pause' : 'Play');
    }
    function render() {
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, W, H);
      chapters[state.i].draw(ctx, state.t);
    }
    function frame(ts) {
      var dt = state.last ? Math.min(0.1, (ts - state.last) / 1000) : 0;
      state.last = ts;
      if (state.playing && state.visible) {
        state.t += dt / chapters[state.i].dur;
        if (state.t >= 1) {
          if (state.t >= 1.25) { state.i = (state.i + 1) % chapters.length; state.t = 0; }
        }
        render(); syncTabs();
      }
      requestAnimationFrame(frame);
    }
    playBtn.addEventListener('click', function () {
      if (!state.playing && state.t >= 1) { state.t = 0; }
      state.playing = !state.playing; syncTabs();
    });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) { state.visible = es[0].isIntersecting; }).observe(root);
    }
    K.onLang(function () { render(); });
    render(); syncTabs();
    requestAnimationFrame(frame);
  }

  function init() {
    var root = el('pe-film');
    if (!root) return;
    K.loadJSON(root.getAttribute('data-src')).then(function (d) { Film(root, d); })
      .catch(function (e) { root.querySelector('.film-status').textContent = 'Could not load data: ' + e.message; });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
