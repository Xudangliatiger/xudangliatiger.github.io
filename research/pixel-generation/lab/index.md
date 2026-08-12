---
layout: research_lab
title: "PixelGen 实验总结"
description: "从直接像素生成的可行性、语义与细节分工、RGB 层级和空间排序，一直整理到 HPA 误差诊断与 Phase-Parallel Pixel AR 的当前验证计划。"
project_id: pixel-generation
permalink: /research/pixel-generation/lab/
og_image: /img/research/research-social-card-minimal.png
lang: zh
alternate_url: /en/research/pixel-generation/lab/
current_hypothesis: "全局结构仍需要 coarse spatial AR，但高分辨率像素不必进行全图串行生成。A/B checkerboard phase、有限的跨 patch 通信，以及由大模型状态调制的 tiny raster Pixel AR，可能在保留局部边界关系的同时显著缩短依赖路径。"
current_blocker: "完整 Phase-Parallel 方案尚未训练。v0.19.1 只有 [1,16] 原型，没有 checkpoint、日志或样本；它仍使用独立 phase-context layer、64 维 prefix 和 GT Phase-A 训练条件，尚未验证 AdaLN conditioning、sampled-history gap、rolling KV eviction 与跨 phase 边界连续性。"
next_run: "先在 [1,2,4] 上完成 mask、cache parity 和 128-patch batching 的正确性测试；随后比较 prefix 与 AdaLN condition、完全串行 patch AR 与 A/B phase、以及 pre-evict / post-evict / no-evict。统一报告 NLL、样本、phase/seam 指标、延迟和峰值显存，再决定是否扩展到五层。"
summary_findings:
  - title: "直接像素生成已经通过可行性验证"
    summary: "PixelDiT-style baseline 在统一训练设置下能够稳定训练和采样；现在真正需要优化的是细节质量、效率与扩展方式。"
  - title: "语义模式选择与局部像素生成需要不同的依赖范围"
    summary: "Dual-level AR 与 Latent AR + Pixel Diffusion 都表明，全局类别与布局需要长程上下文，而 patch 内细节更适合局部、并行或轻量的生成器；现有分支尚未同时解决速度与一致性。"
  - title: "低分辨率 RGB 能提供布局，却不能稳定恢复局部模式"
    summary: "v0.16.8 与 v0.17.4–17.5 表明 coarse RGB 是有用条件，但 mean decode、hard sampled history 与简单 cascade 都会留下模糊或块状误差。"
  - title: "空间排序会改变周期性误差的方向"
    summary: "diagonal 与 column cohorts 的 period-32 横向梯度相位变化约为 5.6% 与 30.2%；该证据只支持组级偏差，不支持单图固定水印。"
  - title: "HPA 的主要漂移始于粗层 history，细层 residual 同时偏弱"
    summary: "GT forcing 把主要误差定位到 L0 / sampled history；五层 free run 的相邻尺度 residual 又明显小于真实数据，解释了层级增多但细节不增。"
  - title: "损失重加权和小型 decoder 不能替代显式空间依赖"
    summary: "v0.17.9 的 hard-detail loss 退化为高频模板，初版 compact cross-attention 又因 pixel state 与读出容量不足产生纯噪声；局部像素关系需要直接进入生成结构。"
  - title: "Phase-parallel 是可检验方案，不是已经成立的结果"
    summary: "A/B checkerboard 与 patch batching 已有原型，但还没有 checkpoint 或样本；质量、速度和边界连续性都必须通过控制实验验证。"
  - title: "Decoder fingerprint 是支持 pixel-space 路线的辅助诊断"
    summary: "共享 AliTok decoder 的 ORT generation 与 oracle reconstruction 呈现高度相关的 P16 cohort pattern，说明 decoder 可以引入额外 RGB 分布偏移；该结果不决定当前生成架构，也不代表单图固定水印。"
experiments:
  - id: "PXD-00"
    state: kept
    question: "PixelDiT-style baseline 能否稳定复现？"
    config: "4×H100 · batch 256 · 187.5K iters · 256px"
    observation: "训练和推理稳定；图像语义结构完整，但局部细节仍偏软。"
    decision: "作为后续所有实验的固定 baseline。"
  - id: "HYB-01"
    state: kept
    question: "如何拆分语义多峰选择与 patch 内像素生成？"
    config: "Dual-level AR → Semantic AR + Pixel Diffusion"
    observation: "分层职责更清楚，但 pixel mixer 的成本与局部一致性仍未解决。"
    decision: "保留为早期架构基线，继续测试纯 Pixel AR 路径。"
  - id: "PXD-04"
    state: kept
    question: "Pixel-JiT 是否能去掉 patchify，并用一步 decoder 输出 RGB？"
    config: "v0.11.9.3 · one-step RGB decoder"
    observation: "有可识别语义与稳定样本，说明直接 pixel state → RGB 路径可训练。"
    decision: "进入无预训练 tokenizer 的 RGB-as-tokenizer 实验。"
  - id: "RGB-01"
    state: mixed
    question: "低分辨率 RGB 能否作为充分 latent？"
    config: "v0.16.8 + v0.17.4–17.5 CascadeAR"
    observation: "布局可恢复；细节平均、block artifact 与 sampled-history drift 持续出现。"
    decision: "把 value、belief、history 与 decoder capacity 分开诊断。"
  - id: "ORD-01"
    state: mixed
    question: "去掉 patchify 后，整图像素应按什么顺序生成？"
    config: "v0.18.1 diagonal · v0.18.2 column"
    observation: "两种顺序都能生成，但留下不同的方向性 period-32 统计。"
    decision: "不把 ordering 当成工程细节；后续报告 phase / seam 指标。"
  - id: "HPA-01"
    state: kept
    question: "一个共享 Transformer 能否建模 [1,2,4] RGB 层级？"
    config: "v0.17.7 · shared HPA · KV cache"
    observation: "训练与采样路径成立，共享参数可以跨尺度工作。"
    decision: "用该骨架扩展层级并进行 GT forcing。"
  - id: "HPA-02"
    state: mixed
    question: "五层 HPA 为什么没有恢复更多细节？"
    config: "v0.17.8 · [1,2,4,8,16] · GT forcing"
    observation: "L0/history 是主要漂移源；generated fine residual 低于 GT；40k 诊断延迟 1.69×。"
    decision: "停止仅靠增加层级；分开修复 history 与 fine-detail objective。"
  - id: "PAR-01"
    state: mixed
    question: "一次 Patch AR 加非 AR residual decoders 是否足够？"
    config: "v0.17.9.2–17.9.3 · noisy history · residual DMoL · hard loss"
    observation: "强 hard loss 退化为灰度高频模板；随机 history corruption 未证明有效。"
    decision: "保留 residual target，拒绝用强重加权替代空间结构。"
  - id: "PAR-02"
    state: dropped
    question: "Compact cross-attention 能否补充 refinement 容量？"
    config: "v0.17.9.4 / 17.9.4b"
    observation: "初版 6k 为纯噪声；修正版跑到 66k，但没有足够结果证明改善。"
    decision: "恢复强 pixel state 与 position-specific readout，转向显式局部 AR。"
  - id: "PHA-00"
    state: open
    question: "A/B phase 能否替代每层 256 个 patch 的完全串行 AR？"
    config: "[1,2,4] · 128 patches/phase · shared 64×2 Pixel AR · AdaLN"
    observation: "v0.19.1 有 [1,16] checkerboard 代码与配置，但未找到训练 checkpoint、日志或样本。"
    decision: "先验证正确性、batching、condition sensitivity 与 phase communication，不直接训练五层版本。"
  - id: "DFP-01"
    state: mixed
    question: "Latent decoder 是否会在 RGB 空间留下额外的多尺度格点偏移？"
    config: "EXP-11 · 8 cohorts × 1,000 · P2/P4/P8/P16 · 5-fold grouped CV"
    observation: "共享 AliTok decoder 的 ORT/reconstruction 在 P16 上高度相关；不同 decoder family 呈现不同尺度响应。"
    decision: "作为解释 pixel-space 路线的辅助证据保留，不把 fingerprint detection 当作当前生成模型主线。"
log_entries:
  - date: "2026-01-18"
    label: "建立 baseline"
    title: "确认直接像素生成可以稳定训练"
    summary: "复现结果足以确认 direct pixel generation 可以稳定训练；后续关注点从 feasibility 转为 quality / efficiency trade-off。"
    decision: "围绕同一 baseline 分叉，不再反复更换训练 recipe。"
    url: /2026/01/18/Pixel-level-generation-1/
    state: done
  - date: "2026-01-19"
    label: "架构拆分"
    title: "拆分语义多峰建模与像素细节生成"
    summary: "Dual-level AR 把问题拆成全局语义采样与局部像素采样，但也暴露了上下文长度和条件冲突。"
    decision: "让 diffusion 同步处理 patch 内像素。"
    url: /2026/01/19/PIxel-level-generation-2/
    state: done
  - date: "2026-06-20"
    label: "一步解码与 RGB latent"
    title: "直接 RGB 路径成立，但 coarse RGB 不足以唯一决定 patch"
    summary: "Pixel-JiT 一步 decoder 能训练；无 tokenizer 的 low-res RGB 路径随后反复出现细节平均与 sampled-history drift。"
    decision: "把一次跨尺度跳跃改成可诊断的层级生成。"
    url: /research/experiments/pixel-generation-05/
    state: done
  - date: "2026-06-29"
    label: "空间排序"
    title: "diagonal 与 column 分组留下不同的周期偏差"
    summary: "空间顺序直接改变总体误差方向，因此任何并行化方案都需要显式测量 phase 与边界。"
    decision: "把 spatial factorization 纳入模型假设，而不是只计吞吐。"
    url: /research/experiments/pixel-generation-06/
    state: done
  - date: "2026-07-17"
    label: "HPA 诊断"
    title: "共享层级骨架成立，误差始于 history，细节止于 residual"
    summary: "v0.17.7 验证共享 Transformer；v0.17.8 的 GT forcing 与 residual 统计把层级失败拆成两个问题。"
    decision: "不再只增加 level 数，转向 history robustness 与显式局部依赖。"
    url: /research/experiments/pixel-generation-08/
    state: done
  - date: "2026-07-28"
    label: "Patch AR"
    title: "损失重加权不能替代像素之间的空间关系"
    summary: "Residual DMoL 保留，但 hard-detail loss 与 compact-CA 分别暴露纹理模板和读出容量问题。"
    decision: "把局部 raster AR 加回 patch 内部。"
    url: /research/experiments/pixel-generation-09/
    state: done
  - date: "2026-08-07"
    label: "Phase-parallel 设计"
    title: "把 A/B 两阶段偏序定义为下一条待验证假设"
    summary: "同 phase 的 128 个 patches 并行推进局部 Pixel AR；当前只有实现原型，没有端到端结果。"
    decision: "用 [1,2,4] 严格拆分实现、condition、phase factorization、sampling gap 与 KV eviction。"
    url: /research/experiments/pixel-generation-10/
    state: done
  - date: "2026-08-11"
    label: "Decoder fingerprint"
    title: "把 latent decoder 的 patch lattice 定位到 RGB 分布"
    summary: "8×1,000 图像、五折 OOF 与 energy tests 显示不同 decoder 具有不同 P2–P16 response；共享 AliTok decoder 的 ORT/reconstruction 几乎复现同一 P16 pattern。"
    decision: "将 decoder-induced distribution shift 保留为辅助动机与独立诊断，不让检测任务取代生成架构的核心问题。"
    url: /research/experiments/pixel-generation-11/
    state: done
  - date: "2026-08-11"
    label: "主线收束"
    title: "回到并行 Pixel AR 的核心验证问题"
    summary: "此前实验已经把失败拆成 coarse mode、sampled history、局部依赖和空间排序四部分；Phase-Parallel 是把这些诊断汇总为一个可控制测试的下一步。"
    decision: "优先完成 [1,2,4] 的正确性、conditioning、phase factorization 和 KV eviction 消融；fingerprint controls 作为辅助分析独立推进。"
    url: /research/experiments/pixel-generation-10/
    state: current
---

## 记录方式

这个页面负责项目层面的阶段总结。上方先提炼跨实验仍然成立的结论，再用矩阵记录可比较的实验结果；下方的完整记录由项目编号自动汇总。后续只需新增一条实验记录，并在结论发生变化时更新这里的总结与矩阵。
