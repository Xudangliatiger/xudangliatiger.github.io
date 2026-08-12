(function () {
  'use strict';

  var roots = document.querySelectorAll('[data-pipeline-v0191]');
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
  var STAGE_DURATION = 3400;
  var STAGE_COUNT = STAGES.length;
  var COLORS = {
    bg: '#071012',
    line: 'rgba(220,234,230,.16)',
    lineStrong: 'rgba(220,234,230,.34)',
    text: '#f4f1e8',
    muted: '#82918f',
    serial: '#d9ff43',
    phaseA: '#ff6548',
    context: '#c68cff',
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
    var panel;
    if (mobile) {
      panel = Math.min(width * .68, height * .31);
      return {
        mobile: true,
        global: { x: (width - panel) / 2, y: (height - panel) / 2 + 18, size: panel },
        a: { x: (width - panel) / 2, y: 90, size: panel },
        b: { x: (width - panel) / 2, y: height - panel - 35, size: panel }
      };
    }
    panel = Math.min(width * .35, height * .62);
    return {
      mobile: false,
      global: { x: (width - panel) / 2, y: (height - panel) / 2 + 22, size: panel },
      a: { x: width * .065, y: (height - panel) / 2 + 22, size: panel },
      b: { x: width - width * .065 - panel, y: (height - panel) / 2 + 22, size: panel }
    };
  }

  function drawPanelLabel(context, title, detail, box, color, active) {
    context.textAlign = 'left';
    context.fillStyle = active ? color : COLORS.muted;
    context.font = '600 10px ui-monospace, SFMono-Regular, Menlo, monospace';
    context.fillText(title.toUpperCase(), box.x, box.y - 25);
    context.fillStyle = COLORS.muted;
    context.font = '8px ui-monospace, SFMono-Regular, Menlo, monospace';
    context.fillText(detail.toUpperCase(), box.x, box.y - 11);
  }

  function drawGlobalPanel(context, scene, box, progress) {
    var cell = box.size / 16;
    var completed = Math.floor(ease(progress) * 256);
    context.save();
    context.imageSmoothingEnabled = false;
    context.drawImage(scene, box.x, box.y, box.size, box.size);
    for (var row = 0; row < 16; row += 1) {
      for (var col = 0; col < 16; col += 1) {
        var index = row * 16 + col;
        var x = box.x + col * cell;
        var y = box.y + row * cell;
        if (index >= completed) {
          context.fillStyle = 'rgba(4,10,11,.94)';
          context.fillRect(x, y, cell + .4, cell + .4);
        }
        context.strokeStyle = COLORS.line;
        context.lineWidth = .65;
        context.strokeRect(x + .25, y + .25, cell - .5, cell - .5);
      }
    }
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

  function drawPhasePanel(context, scene, box, panelPhase, activePhase, progress) {
    var macro = box.size / 16;
    var eased = ease(progress);
    var accent = panelPhase === 0 ? COLORS.phaseA : COLORS.phaseB;
    var isActive = panelPhase === activePhase;

    context.save();
    context.imageSmoothingEnabled = false;
    context.globalAlpha = isActive ? 1 : .72;
    context.drawImage(scene, box.x, box.y, box.size, box.size);
    context.globalAlpha = 1;

    for (var row = 0; row < 16; row += 1) {
      for (var col = 0; col < 16; col += 1) {
        var phase = (row + col) % 2;
        var visible = 0;
        if (panelPhase === 0) visible = phase === 0 ? (activePhase === 0 ? eased : 1) : 0;
        if (panelPhase === 1 && activePhase === 0) visible = phase === 0 ? eased : 0;
        if (panelPhase === 1 && activePhase === 1) visible = phase === 0 ? 1 : eased;

        var x = box.x + col * macro;
        var y = box.y + row * macro;
        if (visible < 1) {
          context.fillStyle = visible === 0 ? 'rgba(4,10,11,.92)' : 'rgba(4,10,11,.88)';
          context.fillRect(x, y + macro * visible, macro + .4, macro * (1 - visible) + .4);
        }
        if (visible > 0) {
          var phaseColor = phase === 0 ? COLORS.phaseA : COLORS.phaseB;
          context.fillStyle = rgba(phaseColor, isActive ? .10 : .05);
          context.fillRect(x, y, macro + .4, macro * visible + .4);
        }
        context.strokeStyle = COLORS.line;
        context.lineWidth = .65;
        context.strokeRect(x + .25, y + .25, macro - .5, macro - .5);

        if (isActive && phase === activePhase && visible > 0 && visible < 1) {
          context.strokeStyle = accent;
          context.lineWidth = 1;
          context.beginPath();
          context.moveTo(x + 1, y + macro * visible);
          context.lineTo(x + macro - 1, y + macro * visible);
          context.stroke();
        }
      }
    }

    context.strokeStyle = isActive ? accent : COLORS.lineStrong;
    context.lineWidth = isActive ? 2 : 1;
    context.strokeRect(box.x - .5, box.y - .5, box.size + 1, box.size + 1);
    context.restore();
  }

  function drawContextBridge(context, layout, activePhase, progress, time) {
    var startX;
    var startY;
    var endX;
    var endY;
    if (layout.mobile) {
      startX = layout.a.x + layout.a.size / 2;
      startY = layout.a.y + layout.a.size + 17;
      endX = layout.b.x + layout.b.size / 2;
      endY = layout.b.y - 17;
    } else {
      startX = layout.a.x + layout.a.size + 18;
      startY = layout.a.y + layout.a.size / 2;
      endX = layout.b.x - 18;
      endY = layout.b.y + layout.b.size / 2;
    }

    context.strokeStyle = rgba(COLORS.context, activePhase === 1 ? .62 : .22);
    context.setLineDash([3, 5]);
    context.lineWidth = 1;
    context.beginPath();
    context.moveTo(startX, startY);
    context.lineTo(endX, endY);
    context.stroke();
    context.setLineDash([]);

    context.fillStyle = COLORS.context;
    context.textAlign = 'center';
    context.font = '8px ui-monospace, SFMono-Regular, Menlo, monospace';
    context.fillText('A → B CONTEXT', (startX + endX) / 2, (startY + endY) / 2 - 9);

    if (activePhase !== 1) return;
    for (var index = 0; index < 3; index += 1) {
      var travel = (progress * .72 + time * .00018 + index / 3) % 1;
      context.fillStyle = COLORS.context;
      context.shadowColor = COLORS.context;
      context.shadowBlur = 9;
      context.beginPath();
      context.arc(startX + (endX - startX) * travel, startY + (endY - startY) * travel, 2.4, 0, Math.PI * 2);
      context.fill();
      context.shadowBlur = 0;
    }
  }

  function init(root) {
    if (root.getAttribute('data-pipeline-ready') === 'true') return;
    root.setAttribute('data-pipeline-ready', 'true');

    var canvas = root.querySelector('[data-pipeline-canvas]');
    var context = canvas.getContext('2d');
    var levelButtons = Array.prototype.slice.call(root.querySelectorAll('[data-pipeline-level]'));
    var phaseButtons = Array.prototype.slice.call(root.querySelectorAll('[data-pipeline-phase]'));
    var globalPhase = root.querySelector('[data-pipeline-global]');
    var control = root.querySelector('[data-pipeline-control]');
    var controlLabel = root.querySelector('[data-pipeline-control-label]');
    var previous = root.querySelector('[data-pipeline-previous]');
    var next = root.querySelector('[data-pipeline-next]');
    var stageIndex = root.querySelector('[data-pipeline-stage-index]');
    var liveStage = root.querySelector('[data-pipeline-live-stage]');
    var liveCount = root.querySelector('[data-pipeline-live-count]');
    var announcement = root.querySelector('[data-pipeline-announcement]');
    var scenes = LEVELS.map(function (level) { return createScene(level.resolution); });
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var visible = true;
    var paused = reduceMotion;
    var stage = reduceMotion ? STAGE_COUNT - 1 : 0;
    var elapsed = reduceMotion ? STAGE_DURATION : 0;
    var previousTime = performance.now();
    var width = 0;
    var height = 0;
    var dpr = 1;

    function levelIndex() { return STAGES[stage].level; }
    function phaseIndex() { return STAGES[stage].phase; }
    function stageFor(level, phase) {
      if (level === 0) return 0;
      return 1 + (level - 1) * 2 + phase;
    }

    function updateControl() {
      root.classList.toggle('is-paused', paused);
      control.setAttribute('aria-label', paused ? root.dataset.playLabel : root.dataset.pauseLabel);
      controlLabel.textContent = paused ? root.dataset.playShort : root.dataset.pauseShort;
    }

    function updateInterface() {
      var level = levelIndex();
      var phase = phaseIndex();
      var meta = LEVELS[level];
      levelButtons.forEach(function (button, index) {
        var active = index === level;
        button.classList.toggle('is-active', active);
        button.setAttribute('aria-selected', active ? 'true' : 'false');
      });
      phaseButtons.forEach(function (button, index) {
        var active = index === phase;
        button.classList.toggle('is-active', active);
        button.setAttribute('aria-selected', active ? 'true' : 'false');
        button.disabled = level === 0;
      });
      globalPhase.classList.toggle('is-active', phase === -1);
      globalPhase.setAttribute('aria-selected', phase === -1 ? 'true' : 'false');
      globalPhase.disabled = level !== 0;
      var phaseLabel = phase === -1 ? root.dataset.globalLabel : (phase === 0 ? root.dataset.phaseALabel : root.dataset.phaseBLabel);
      var stageLabel = 'L' + level + ' · ' + phaseLabel;
      liveStage.textContent = stageLabel;
      liveCount.textContent = meta.resolution + '×' + meta.resolution + ' · ' + meta.patch + '×' + meta.patch + ' / patch';
      stageIndex.textContent = String(stage + 1).padStart(2, '0') + ' / ' + String(STAGE_COUNT).padStart(2, '0');
      announcement.textContent = stageLabel + ', ' + meta.resolution + ' by ' + meta.resolution;
      updateControl();
    }

    function selectStage(nextStage, manual) {
      stage = (nextStage + STAGE_COUNT) % STAGE_COUNT;
      elapsed = manual ? STAGE_DURATION : 0;
      if (manual) paused = true;
      updateInterface();
      draw();
    }

    function resize() {
      var rect = canvas.getBoundingClientRect();
      dpr = Math.min(2, window.devicePixelRatio || 1);
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw();
    }

    function draw() {
      if (!width || !height) return;
      var level = levelIndex();
      var phase = phaseIndex();
      var progress = clamp(elapsed / STAGE_DURATION, 0, 1);
      var layout = layoutFor(width, height);
      var meta = LEVELS[level];

      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      context.clearRect(0, 0, width, height);
      context.fillStyle = COLORS.bg;
      context.fillRect(0, 0, width, height);

      context.fillStyle = 'rgba(255,255,255,.018)';
      for (var gx = 0; gx < width; gx += 24) context.fillRect(gx, 0, 1, height);
      for (var gy = 0; gy < height; gy += 24) context.fillRect(0, gy, width, 1);

      if (phase === -1) {
        drawPanelLabel(context, root.dataset.globalLabel, root.dataset.globalDetail, layout.global, COLORS.serial, true);
        drawGlobalPanel(context, scenes[level], layout.global, progress);
      } else {
        drawPanelLabel(context, root.dataset.phaseALabel, root.dataset.phaseADetail, layout.a, COLORS.phaseA, phase === 0);
        drawPanelLabel(context, root.dataset.phaseBLabel, root.dataset.phaseBDetail, layout.b, COLORS.phaseB, phase === 1);
        drawPhasePanel(context, scenes[level], layout.a, 0, phase, progress);
        drawPhasePanel(context, scenes[level], layout.b, 1, phase, progress);
        drawContextBridge(context, layout, phase, progress, elapsed);
      }

      context.fillStyle = COLORS.muted;
      context.textAlign = 'center';
      context.font = '8px ui-monospace, SFMono-Regular, Menlo, monospace';
      context.fillText(phase === -1
        ? 'L0 · 16×16 IMAGE · 256 GLOBAL AUTOREGRESSIVE ROUNDS'
        : 'L' + level + ' · ' + meta.resolution + '×' + meta.resolution + ' IMAGE · ' + meta.patch + '×' + meta.patch + ' PIXELS / MACRO PATCH', width / 2, height - 10);

      if (phase === -1) {
        liveCount.textContent = '16×16 · serial RGB ' + Math.floor(ease(progress) * 256) + ' / 256';
      } else {
        var localSteps = meta.patch * meta.patch;
        var completed = Math.ceil(ease(progress) * localSteps);
        if (phase === 0) liveCount.textContent = meta.resolution + '×' + meta.resolution + ' · A ×128 · ' + completed + ' / ' + localSteps;
        if (phase === 1) liveCount.textContent = meta.resolution + '×' + meta.resolution + ' · B ×128 · ' + completed + ' / ' + localSteps;
      }
    }

    levelButtons.forEach(function (button, index) {
      button.addEventListener('click', function () {
        var phase = phaseIndex() < 0 ? 0 : phaseIndex();
        selectStage(stageFor(index, phase), true);
      });
    });
    phaseButtons.forEach(function (button, index) {
      button.addEventListener('click', function () {
        if (levelIndex() > 0) selectStage(stageFor(levelIndex(), index), true);
      });
    });
    previous.addEventListener('click', function () { selectStage(stage - 1, true); });
    next.addEventListener('click', function () { selectStage(stage + 1, true); });
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
        if (elapsed >= STAGE_DURATION) selectStage(stage + 1, false);
      }
      if (visible) draw();
      window.requestAnimationFrame(frame);
    }

    updateInterface();
    resize();
    window.requestAnimationFrame(frame);
  }

  roots.forEach(init);
}());
