(function () {
  'use strict';

  var roots = document.querySelectorAll('[data-refinement-v0191]');
  if (!roots.length) return;

  var LEVELS = [
    { resolution: 16, patch: 1 },
    { resolution: 32, patch: 2 },
    { resolution: 64, patch: 4 },
    { resolution: 128, patch: 8 },
    { resolution: 256, patch: 16 }
  ];
  var STAGES = [
    { level: 0, phase: -1 },
    { level: 1, phase: 0 }, { level: 1, phase: 1 },
    { level: 2, phase: 0 }, { level: 2, phase: 1 },
    { level: 3, phase: 0 }, { level: 3, phase: 1 },
    { level: 4, phase: 0 }, { level: 4, phase: 1 }
  ];
  var STAGE_DURATION = 3000;
  var COLORS = {
    bg: '#071012',
    line: 'rgba(220,234,230,.15)',
    lineStrong: 'rgba(220,234,230,.42)',
    text: '#f4f1e8',
    muted: '#8c9b99',
    old: '#aab4b1',
    serial: '#d9ff43',
    phaseA: '#ff6548',
    phaseB: '#65a9ff'
  };

  function clamp(value, min, max) { return Math.max(min, Math.min(max, value)); }
  function ease(value) { return 1 - Math.pow(1 - clamp(value, 0, 1), 3); }
  function mix(a, b, amount) { return Math.round(a + (b - a) * amount); }
  function rgba(hex, alpha) {
    var value = hex.replace('#', '');
    var number = parseInt(value, 16);
    return 'rgba(' + ((number >> 16) & 255) + ',' + ((number >> 8) & 255) + ',' + (number & 255) + ',' + alpha + ')';
  }

  function sceneColor(x, y) {
    var skyMix = clamp(y / .62, 0, 1);
    var color = [
      mix(31, 119, skyMix),
      mix(62, 151, skyMix),
      mix(87, 151, skyMix)
    ];

    var sunDistance = Math.sqrt(Math.pow(x - .75, 2) + Math.pow(y - .21, 2));
    if (sunDistance < .105) color = [255, 174, 102];

    var mountain = .52 - .12 * Math.sin(x * 7.2) - .055 * Math.sin(x * 17 + .8);
    if (y > mountain && y < .64) {
      var mountainShade = clamp((y - mountain) / .16, 0, 1);
      color = [mix(54, 35, mountainShade), mix(79, 62, mountainShade), mix(75, 66, mountainShade)];
    }

    if (y >= .58) {
      var groundMix = clamp((y - .58) / .42, 0, 1);
      color = [mix(54, 30, groundMix), mix(88, 60, groundMix), mix(58, 52, groundMix)];
      var riverCenter = .54 + Math.sin((y - .56) * 7) * .09;
      var riverWidth = .035 + (y - .55) * .24;
      if (Math.abs(x - riverCenter) < riverWidth) {
        var waterEdge = clamp(Math.abs(x - riverCenter) / Math.max(.01, riverWidth), 0, 1);
        color = [mix(110, 57, waterEdge), mix(174, 112, waterEdge), mix(178, 132, waterEdge)];
      }
    }

    var roofLeft = .18 + Math.abs(y - .49) * 1.3;
    var roofRight = .39 - Math.abs(y - .49) * 1.3;
    if (y >= .43 && y < .54 && x > roofLeft && x < roofRight) color = [73, 45, 45];
    if (x > .205 && x < .365 && y >= .52 && y < .70) color = [177, 80, 53];
    if (x > .25 && x < .29 && y >= .59 && y < .70) color = [52, 43, 42];
    if (x > .31 && x < .345 && y >= .56 && y < .61) color = [244, 190, 93];
    if (x > .075 && x < .105 && y > .46 && y < .72) color = [34, 55, 45];
    if (Math.abs(x - .09) < (.28 - y) * .23 && y > .27 && y <= .55) color = [39, 73, 55];
    return color;
  }

  function createScene(resolution) {
    var scene = document.createElement('canvas');
    scene.width = resolution;
    scene.height = resolution;
    var context = scene.getContext('2d');
    var image = context.createImageData(resolution, resolution);
    for (var row = 0; row < resolution; row += 1) {
      for (var col = 0; col < resolution; col += 1) {
        var color = sceneColor((col + .5) / resolution, (row + .5) / resolution);
        var offset = (row * resolution + col) * 4;
        image.data[offset] = color[0];
        image.data[offset + 1] = color[1];
        image.data[offset + 2] = color[2];
        image.data[offset + 3] = 255;
      }
    }
    context.putImageData(image, 0, 0);
    return scene;
  }

  function layoutFor(width, height) {
    var mobile = width < 620;
    var top = mobile ? 92 : 74;
    var bottom = mobile ? 56 : 48;
    var size = Math.min(width * (mobile ? .82 : .58), height - top - bottom);
    return {
      mobile: mobile,
      image: { x: (width - size) / 2, y: top, size: size },
      formulaY: height - 22
    };
  }

  function drawBackground(context, width, height) {
    context.fillStyle = COLORS.bg;
    context.fillRect(0, 0, width, height);
    context.fillStyle = 'rgba(255,255,255,.018)';
    for (var x = 0; x < width; x += 24) context.fillRect(x, 0, 1, height);
    for (var y = 0; y < height; y += 24) context.fillRect(0, y, width, 1);
  }

  function drawMacroGrid(context, box) {
    var macro = box.size / 16;
    context.strokeStyle = COLORS.line;
    context.lineWidth = .65;
    for (var index = 0; index <= 16; index += 1) {
      var offset = index * macro;
      context.beginPath();
      context.moveTo(box.x + offset, box.y);
      context.lineTo(box.x + offset, box.y + box.size);
      context.stroke();
      context.beginPath();
      context.moveTo(box.x, box.y + offset);
      context.lineTo(box.x + box.size, box.y + offset);
      context.stroke();
    }
  }

  function drawGlobal(context, scene, box, progress) {
    var cell = box.size / 16;
    var completed = Math.floor(ease(progress) * 256);
    context.save();
    context.imageSmoothingEnabled = false;
    context.drawImage(scene, box.x, box.y, box.size, box.size);
    for (var row = 0; row < 16; row += 1) {
      for (var col = 0; col < 16; col += 1) {
        var index = row * 16 + col;
        if (index >= completed) {
          context.fillStyle = 'rgba(4,10,11,.95)';
          context.fillRect(box.x + col * cell, box.y + row * cell, cell + .4, cell + .4);
        }
      }
    }
    drawMacroGrid(context, box);
    if (completed < 256) {
      var active = Math.min(255, completed);
      var activeRow = Math.floor(active / 16);
      var activeCol = active % 16;
      context.strokeStyle = COLORS.serial;
      context.lineWidth = 2;
      context.shadowColor = COLORS.serial;
      context.shadowBlur = 10;
      context.strokeRect(box.x + activeCol * cell + 1, box.y + activeRow * cell + 1, cell - 2, cell - 2);
      context.shadowBlur = 0;
    }
    context.strokeStyle = COLORS.serial;
    context.lineWidth = 2;
    context.strokeRect(box.x - .5, box.y - .5, box.size + 1, box.size + 1);
    context.restore();
  }

  function drawFinePatch(context, scene, level, row, col, box, completed, activeAlpha) {
    var patch = LEVELS[level].patch;
    var macro = box.size / 16;
    var pixel = macro / patch;
    var x = box.x + col * macro;
    var y = box.y + row * macro;
    var wholePixels = Math.floor(completed);
    var partial = completed - wholePixels;

    context.save();
    context.imageSmoothingEnabled = false;
    for (var index = 0; index < Math.min(patch * patch, wholePixels); index += 1) {
      var localRow = Math.floor(index / patch);
      var localCol = index % patch;
      context.drawImage(scene, col * patch + localCol, row * patch + localRow, 1, 1, x + localCol * pixel, y + localRow * pixel, pixel + .35, pixel + .35);
    }
    if (wholePixels < patch * patch && partial > 0) {
      var activeRow = Math.floor(wholePixels / patch);
      var activeCol = wholePixels % patch;
      context.globalAlpha = partial;
      context.drawImage(scene, col * patch + activeCol, row * patch + activeRow, 1, 1, x + activeCol * pixel, y + activeRow * pixel, pixel + .35, pixel + .35);
      context.globalAlpha = 1;
    }

    if (patch <= 8) {
      context.strokeStyle = 'rgba(244,241,232,' + activeAlpha + ')';
      context.lineWidth = .4;
      for (var line = 1; line < patch; line += 1) {
        context.beginPath();
        context.moveTo(x + line * pixel, y);
        context.lineTo(x + line * pixel, y + macro);
        context.stroke();
        context.beginPath();
        context.moveTo(x, y + line * pixel);
        context.lineTo(x + macro, y + line * pixel);
        context.stroke();
      }
    }
    context.restore();
  }

  function drawActivePixelFront(context, level, phase, box, completed, accent, time) {
    var patch = LEVELS[level].patch;
    var total = patch * patch;
    var macro = box.size / 16;
    var pixel = macro / patch;
    var activeIndex = Math.min(total - 1, Math.floor(completed));
    var localRow = Math.floor(activeIndex / patch);
    var localCol = activeIndex % patch;
    var pulse = .72 + .28 * Math.sin(time / 150);
    var inset = Math.min(1.1, pixel * .16);

    context.save();
    context.beginPath();
    for (var row = 0; row < 16; row += 1) {
      for (var col = 0; col < 16; col += 1) {
        if ((row + col) % 2 !== phase) continue;
        context.rect(
          box.x + col * macro + localCol * pixel + inset,
          box.y + row * macro + localRow * pixel + inset,
          Math.max(1, pixel - inset * 2),
          Math.max(1, pixel - inset * 2)
        );
      }
    }
    context.globalCompositeOperation = 'screen';
    context.fillStyle = rgba(accent, .48 + pulse * .22);
    context.shadowColor = accent;
    context.shadowBlur = 16;
    context.fill();
    context.strokeStyle = rgba(accent, .92 + pulse * .08);
    context.lineWidth = Math.max(1.1, Math.min(2.2, pixel * .2));
    context.stroke();
    context.shadowBlur = 0;
    context.strokeStyle = rgba('#f4f1e8', .72 + pulse * .24);
    context.lineWidth = Math.max(.6, Math.min(1.1, pixel * .1));
    context.stroke();
    context.restore();
  }

  function drawRefinement(context, scenes, level, phase, box, progress, time) {
    var previous = scenes[level - 1];
    var current = scenes[level];
    var patch = LEVELS[level].patch;
    var total = patch * patch;
    var completed = ease(progress) * total;
    var macro = box.size / 16;
    var accent = phase === 0 ? COLORS.phaseA : COLORS.phaseB;

    context.save();
    context.imageSmoothingEnabled = false;
    context.drawImage(previous, box.x, box.y, box.size, box.size);

    for (var row = 0; row < 16; row += 1) {
      for (var col = 0; col < 16; col += 1) {
        var patchPhase = (row + col) % 2;
        var patchProgress = 0;
        if (phase === 0 && patchPhase === 0) patchProgress = completed;
        if (phase === 1 && patchPhase === 0) patchProgress = total;
        if (phase === 1 && patchPhase === 1) patchProgress = completed;
        if (patchProgress > 0) drawFinePatch(context, current, level, row, col, box, patchProgress, patchPhase === phase ? .13 : .07);

        if (patchPhase === phase) {
          var pulse = .07 + .035 * Math.sin(time / 230 + row * .5 + col * .35);
          context.fillStyle = rgba(accent, pulse);
          context.fillRect(box.x + col * macro, box.y + row * macro, macro + .35, macro + .35);
        }
      }
    }

    drawMacroGrid(context, box);
    drawActivePixelFront(context, level, phase, box, completed, accent, time);
    context.strokeStyle = accent;
    context.lineWidth = 2;
    context.shadowColor = accent;
    context.shadowBlur = 8;
    context.strokeRect(box.x - .5, box.y - .5, box.size + 1, box.size + 1);
    context.shadowBlur = 0;
    context.restore();
  }

  function stageName(stage) {
    if (stage.phase < 0) return 'L0 · GLOBAL AR';
    return 'L' + stage.level + ' · PHASE ' + (stage.phase === 0 ? 'A' : 'B');
  }

  function stageEquation(stage) {
    if (stage.phase < 0) return 'EMPTY → L0';
    var previous = stage.level - 1;
    if (stage.phase === 0) return 'L' + previous + 'A + L' + previous + 'B → L' + stage.level + 'A + L' + previous + 'B';
    return 'L' + stage.level + 'A + L' + previous + 'B → L' + stage.level + 'A + L' + stage.level + 'B';
  }

  function init(root) {
    if (root.getAttribute('data-refinement-ready') === 'true') return;
    root.setAttribute('data-refinement-ready', 'true');

    var canvas = root.querySelector('[data-refinement-canvas]');
    var context = canvas.getContext('2d');
    var stageButtons = Array.prototype.slice.call(root.querySelectorAll('[data-refinement-stage]'));
    var control = root.querySelector('[data-refinement-control]');
    var controlLabel = root.querySelector('[data-refinement-control-label]');
    var previousButton = root.querySelector('[data-refinement-previous]');
    var nextButton = root.querySelector('[data-refinement-next]');
    var liveStage = root.querySelector('[data-refinement-live-stage]');
    var liveDetail = root.querySelector('[data-refinement-live-detail]');
    var announcement = root.querySelector('[data-refinement-announcement]');
    var stateTitle = root.querySelector('[data-refinement-state-title]');
    var stateEquation = root.querySelector('[data-refinement-state-equation]');
    var stageIndex = root.querySelector('[data-refinement-stage-index]');
    var scenes = LEVELS.map(function (level) { return createScene(level.resolution); });
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var visible = true;
    var paused = reduceMotion;
    var currentStage = reduceMotion ? STAGES.length - 1 : 0;
    var elapsed = reduceMotion ? STAGE_DURATION : 0;
    var previousTime = performance.now();
    var width = 0;
    var height = 0;
    var dpr = 1;

    function updateControl() {
      root.classList.toggle('is-paused', paused);
      control.setAttribute('aria-label', paused ? root.dataset.playLabel : root.dataset.pauseLabel);
      controlLabel.textContent = paused ? root.dataset.playShort : root.dataset.pauseShort;
    }

    function updateInterface() {
      var stage = STAGES[currentStage];
      var meta = LEVELS[stage.level];
      var label = stageName(stage);
      stageButtons.forEach(function (button, index) {
        var active = index === currentStage;
        button.classList.toggle('is-active', active);
        button.setAttribute('aria-selected', active ? 'true' : 'false');
      });
      liveStage.textContent = label.replace('GLOBAL AR', 'Global AR').replace('PHASE', 'Phase');
      stateTitle.textContent = (stage.phase < 0 ? 'L0' : 'L' + stage.level + (stage.phase === 0 ? 'A' : 'B')) + ' · ' + meta.resolution + '²';
      stateEquation.textContent = stageEquation(stage);
      stageIndex.textContent = String(currentStage + 1).padStart(2, '0') + ' / ' + String(STAGES.length).padStart(2, '0');
      announcement.textContent = label + ', ' + stageEquation(stage);
      updateControl();
    }

    function selectStage(nextStage, manual) {
      currentStage = (nextStage + STAGES.length) % STAGES.length;
      elapsed = manual ? STAGE_DURATION : 0;
      if (manual) paused = true;
      updateInterface();
      draw(performance.now());
    }

    function resize() {
      var rect = canvas.getBoundingClientRect();
      dpr = Math.min(2, window.devicePixelRatio || 1);
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw(performance.now());
    }

    function draw(now) {
      if (!width || !height) return;
      var stage = STAGES[currentStage];
      var meta = LEVELS[stage.level];
      var progress = clamp(elapsed / STAGE_DURATION, 0, 1);
      var layout = layoutFor(width, height);
      var accent = stage.phase < 0 ? COLORS.serial : (stage.phase === 0 ? COLORS.phaseA : COLORS.phaseB);

      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      context.clearRect(0, 0, width, height);
      drawBackground(context, width, height);

      context.textAlign = 'right';
      context.fillStyle = accent;
      context.font = '600 10px ui-monospace, SFMono-Regular, Menlo, monospace';
      context.fillText(stageName(stage), width - 20, 30);
      context.fillStyle = COLORS.muted;
      context.font = '8px ui-monospace, SFMono-Regular, Menlo, monospace';
      context.fillText(meta.resolution + '×' + meta.resolution + ' IMAGE · SAME CANVAS', width - 20, 44);

      if (stage.phase < 0) drawGlobal(context, scenes[0], layout.image, progress);
      else {
        drawRefinement(context, scenes, stage.level, stage.phase, layout.image, progress, now);
        var localSteps = meta.patch * meta.patch;
        context.textAlign = 'left';
        context.fillStyle = accent;
        context.font = '600 8px ui-monospace, SFMono-Regular, Menlo, monospace';
        context.fillText('GLOWING PIXEL STEP ' + Math.ceil(ease(progress) * localSteps) + ' / ' + localSteps + ' · ×128 IN PARALLEL', layout.image.x, layout.image.y - 10);
      }

      context.fillStyle = 'rgba(7,16,18,.86)';
      context.fillRect(width / 2 - Math.min(210, width * .44), layout.formulaY - 14, Math.min(420, width * .88), 24);
      context.textAlign = 'center';
      context.fillStyle = COLORS.text;
      context.font = '600 9px ui-monospace, SFMono-Regular, Menlo, monospace';
      context.fillText(stageEquation(stage), width / 2, layout.formulaY + 2);

      if (stage.phase < 0) {
        liveDetail.textContent = '16×16 · serial RGB ' + Math.floor(ease(progress) * 256) + ' / 256';
      } else {
        var localSteps = meta.patch * meta.patch;
        liveDetail.textContent = meta.resolution + '×' + meta.resolution + ' · ' + (stage.phase === 0 ? 'A' : 'B') + ' ×128 · ' + Math.ceil(ease(progress) * localSteps) + ' / ' + localSteps;
      }
    }

    stageButtons.forEach(function (button, index) {
      button.addEventListener('click', function () { selectStage(index, true); });
    });
    previousButton.addEventListener('click', function () { selectStage(currentStage - 1, true); });
    nextButton.addEventListener('click', function () { selectStage(currentStage + 1, true); });
    control.addEventListener('click', function () {
      paused = !paused;
      if (!paused && elapsed >= STAGE_DURATION * .98) elapsed = 0;
      previousTime = performance.now();
      updateControl();
    });

    if (reduceMotion) root.classList.add('is-reduced');
    if ('ResizeObserver' in window) new ResizeObserver(resize).observe(canvas);
    else window.addEventListener('resize', resize, { passive: true });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) { visible = entries[0].isIntersecting; }, { rootMargin: '180px' }).observe(root);
    }

    function frame(now) {
      var delta = Math.min(80, now - previousTime);
      previousTime = now;
      if (!paused && visible && !reduceMotion) {
        elapsed += delta;
        if (elapsed >= STAGE_DURATION) selectStage(currentStage + 1, false);
      }
      if (visible) draw(now);
      window.requestAnimationFrame(frame);
    }

    updateInterface();
    resize();
    window.requestAnimationFrame(frame);
  }

  Array.prototype.forEach.call(roots, init);
})();
