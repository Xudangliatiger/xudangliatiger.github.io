(function () {
  'use strict';

  var roots = document.querySelectorAll('[data-shared-ar-v0191]');
  if (!roots.length) return;

  var STAGES = [
    {
      label: 'L0', phase: 'AR', inputStage: 'L0 token stream', input: 'BOS + shifted coarse RGB',
      embedding: 'E(L0, AR)', hidden: 'h(L0)', detail: 'global coarse semantics',
      local: 'bypassed at L0', output: 'L0 RGB tokens', directOutput: 'one coarse RGB token',
      next: 'retain L0B → L1A', source: 'x_t', result: 'x_{t+1}'
    },
    {
      label: 'L1A', phase: 'A', inputStage: 'L0B carrier', input: 'BOS + L0B[:-1]',
      embedding: 'E(L1, A)', hidden: 'h(L1A) ×128', detail: '128 patch conditions',
      local: '2×2 · 4 local RGB steps', output: 'L1A RGB patches', directOutput: 'L0 path bypassed',
      next: 're-embed L1A → L1B', source: 'L0B', result: 'L1A', oldTarget: 'L0A'
    },
    {
      label: 'L1B', phase: 'B', inputStage: 'L1A carrier', input: 'L1A phase tokens',
      embedding: 'E(L1, B)', hidden: 'h(L1B) ×128', detail: '128 patch conditions',
      local: '2×2 · 4 local RGB steps', output: 'L1B RGB patches', directOutput: 'L0 path bypassed',
      next: 'retain L1B → L2A', source: 'L1A', result: 'L1B', oldTarget: 'L0B'
    },
    {
      label: 'L2A', phase: 'A', inputStage: 'L1B carrier', input: 'BOS + L1B[:-1]',
      embedding: 'E(L2, A)', hidden: 'h(L2A) ×128', detail: '128 patch conditions',
      local: '4×4 · 16 local RGB steps', output: 'L2A RGB patches', directOutput: 'L0 path bypassed',
      next: 're-embed L2A → L2B', source: 'L1B', result: 'L2A', oldTarget: 'L1A'
    },
    {
      label: 'L2B', phase: 'B', inputStage: 'L2A carrier', input: 'L2A phase tokens',
      embedding: 'E(L2, B)', hidden: 'h(L2B) ×128', detail: '128 patch conditions',
      local: '4×4 · 16 local RGB steps', output: 'L2B RGB patches', directOutput: 'L0 path bypassed',
      next: 'retain L2B → L3A', source: 'L2A', result: 'L2B', oldTarget: 'L1B'
    },
    {
      label: 'L3A', phase: 'A', inputStage: 'L2B carrier', input: 'BOS + L2B[:-1]',
      embedding: 'E(L3, A)', hidden: 'h(L3A) ×128', detail: '128 patch conditions',
      local: '8×8 · 64 local RGB steps', output: 'L3A RGB patches', directOutput: 'L0 path bypassed',
      next: 're-embed L3A → L3B', source: 'L2B', result: 'L3A', oldTarget: 'L2A'
    },
    {
      label: 'L3B', phase: 'B', inputStage: 'L3A carrier', input: 'L3A phase tokens',
      embedding: 'E(L3, B)', hidden: 'h(L3B) ×128', detail: '128 patch conditions',
      local: '8×8 · 64 local RGB steps', output: 'L3B RGB patches', directOutput: 'L0 path bypassed',
      next: 'retain L3B → L4A', source: 'L3A', result: 'L3B', oldTarget: 'L2B'
    },
    {
      label: 'L4A', phase: 'A', inputStage: 'L3B carrier', input: 'BOS + L3B[:-1]',
      embedding: 'E(L4, A)', hidden: 'h(L4A) ×128', detail: '128 patch conditions',
      local: '16×16 · 256 local RGB steps', output: 'L4A RGB patches', directOutput: 'L0 path bypassed',
      next: 're-embed L4A → L4B', source: 'L3B', result: 'L4A', oldTarget: 'L3A'
    },
    {
      label: 'L4B', phase: 'B', inputStage: 'L4A carrier', input: 'L4A phase tokens',
      embedding: 'E(L4, B)', hidden: 'h(L4B) ×128', detail: '128 patch conditions',
      local: '16×16 · 256 local RGB steps', output: 'L4B RGB patches', directOutput: 'L0 path bypassed',
      next: 'compose final 256×256 image', source: 'L4A', result: 'L4B', oldTarget: 'L3B'
    }
  ];
  var DURATION = 3600;

  function init(root) {
    if (root.getAttribute('data-shared-ready') === 'true') return;
    root.setAttribute('data-shared-ready', 'true');

    var stageButtons = Array.prototype.slice.call(root.querySelectorAll('[data-shared-stage]'));
    var control = root.querySelector('[data-shared-control]');
    var controlLabel = root.querySelector('[data-shared-control-label]');
    var liveStage = root.querySelector('[data-shared-live-stage]');
    var liveDetail = root.querySelector('[data-shared-live-detail]');
    var stageIndex = root.querySelector('[data-shared-stage-index]');
    var hpaInputLabel = root.querySelector('[data-shared-hpa-input-label]');
    var hpaOutputLabel = root.querySelector('[data-shared-hpa-output-label]');
    var tokenEquation = root.querySelector('[data-shared-token-equation]');
    var outputCode = root.querySelector('[data-shared-output-code]');
    var coreMode = root.querySelector('[data-shared-core-mode]');
    var writeback = root.querySelector('[data-shared-writeback]');
    var tokenCount = root.querySelector('[data-shared-token-count]');
    var inputA = root.querySelector('[data-shared-input-a]');
    var inputB = root.querySelector('[data-shared-input-b]');
    var inputTokens = Array.prototype.slice.call(root.querySelectorAll('[data-shared-input-track] > i'));
    var outputTokens = Array.prototype.slice.call(root.querySelectorAll('.shared-ar-v0191__sequence-track--output > i'));
    var announcement = root.querySelector('[data-shared-announcement]');
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var isEnglish = root.dataset.lang === 'en';
    var paused = reduceMotion;
    var visible = true;
    var stage = 0;
    var elapsed = 0;
    var visualElapsed = 0;
    var previousTime = performance.now();

    function updateControl() {
      root.classList.toggle('is-paused', paused);
      control.setAttribute('aria-label', paused ? root.dataset.playLabel : root.dataset.pauseLabel);
      controlLabel.textContent = paused ? root.dataset.playShort : root.dataset.pauseShort;
    }

    function updateInterface() {
      var current = STAGES[stage];
      var isL0 = current.phase === 'AR';
      root.classList.toggle('is-l0', isL0);
      root.classList.toggle('is-phase-a', current.phase === 'A');
      root.classList.toggle('is-phase-b', current.phase === 'B');

      stageButtons.forEach(function (button, index) {
        var active = index === stage;
        button.classList.toggle('is-active', active);
        button.setAttribute('aria-selected', active ? 'true' : 'false');
      });

      liveStage.textContent = current.label + ' · ' + (isL0 ? 'Global AR' : 'Phase ' + current.phase);
      liveDetail.textContent = current.source + (isL0 ? '' : ' ×128') + ' → ' + current.result + (isL0 ? '' : ' ×128');
      stageIndex.textContent = String(stage + 1).padStart(2, '0') + ' / ' + String(STAGES.length).padStart(2, '0');
      hpaInputLabel.textContent = isL0
        ? (isEnglish ? 'causal input sequence · append one token per step' : 'causal 输入序列 · 每一步追加一个 token')
        : (isEnglish ? 'causal input sequence · A/B shown as contiguous groups' : 'causal 输入序列 · 将 A/B 连续排列以便理解');
      hpaOutputLabel.textContent = isL0
        ? (isEnglish ? 'one next-token prediction' : '单个 next-token prediction')
        : (isEnglish ? 'one parallel phase prediction' : '一次并行 phase prediction');
      tokenEquation.textContent = isL0
        ? 'x_t → HPA / KV → p(x_{t+1})'
        : current.source + ' ×128 → Shared HPA → ' + current.result + ' ×128';
      coreMode.textContent = isL0
        ? (isEnglish ? 'ONE NEXT-TOKEN STEP' : '单次 NEXT-TOKEN STEP')
        : (isEnglish ? 'MASKED PARALLEL GROUP PASS' : 'MASKED 并行 GROUP PASS');
      outputCode.textContent = isL0 ? 'xₜ₊₁' : current.result + ' ×128';
      tokenCount.textContent = isL0 ? '1 / 256 tokens' : '256 positions · 128 A + 128 B';
      inputA.textContent = isL0 ? (isEnglish ? 'generated causal prefix' : '已生成 causal prefix') : 'A slots · ' + (current.phase === 'A' ? 'WRITE ' + current.result : 'READ ' + current.source);
      inputB.textContent = isL0 ? (isEnglish ? 'empty future positions' : '尚未生成的位置') : 'B slots · ' + (current.phase === 'B' ? 'WRITE ' + current.result : 'READ ' + current.source);
      writeback.textContent = isL0
        ? (isEnglish ? 'Append xₜ₊₁ to the top sequence; it becomes the next xₜ' : '将 xₜ₊₁ 追加到顶部序列，作为下一步 xₜ')
        : (isEnglish ? 'Parallel writeback: replace old Phase ' + current.phase + ' slots with ' + current.result : '并行写回：用 ' + current.result + ' 替换旧 Phase ' + current.phase + ' slots');
      announcement.textContent = isL0
        ? liveStage.textContent + '. x t enters the shared HPA. x t plus one loops back as the next input.'
        : liveStage.textContent + '. ' + current.source + ' enters the shared HPA. ' + current.result + ' replaces the Phase ' + current.phase + ' register.';
      updateControl();
    }

    function selectStage(nextStage, manual) {
      stage = (nextStage + STAGES.length) % STAGES.length;
      elapsed = 0;
      visualElapsed = 0;
      if (manual) paused = true;
      updateInterface();
    }

    stageButtons.forEach(function (button, index) {
      button.addEventListener('click', function () { selectStage(index, true); });
    });

    control.addEventListener('click', function () {
      paused = !paused;
      previousTime = performance.now();
      updateControl();
    });

    if (reduceMotion) root.classList.add('is-reduced');
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) { visible = entries[0].isIntersecting; }, { rootMargin: '180px' }).observe(root);
    }

    function updateL0Sequence() {
      if (STAGES[stage].phase !== 'AR') return;
      var progress = Math.min(256, Math.floor((visualElapsed % DURATION) / DURATION * 256) + 1);
      var filled = Math.ceil(progress / 16);
      tokenCount.textContent = progress + ' / 256 tokens';
      inputTokens.forEach(function (token, index) {
        token.classList.toggle('is-filled', index < filled);
        token.classList.toggle('is-frontier', index === filled - 1);
      });
      outputTokens.forEach(function (token, index) {
        token.classList.toggle('is-filled', index < filled);
        token.classList.toggle('is-frontier', index === filled - 1);
      });
    }

    function frame(now) {
      var delta = Math.min(80, now - previousTime);
      previousTime = now;
      if (visible && !reduceMotion) {
        visualElapsed += delta;
        updateL0Sequence();
      }
      if (!paused && visible && !reduceMotion) {
        elapsed += delta;
        if (elapsed >= DURATION) selectStage(stage + 1, false);
      }
      window.requestAnimationFrame(frame);
    }

    updateInterface();
    updateL0Sequence();
    window.requestAnimationFrame(frame);
  }

  Array.prototype.forEach.call(roots, init);
}());
