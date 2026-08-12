---
layout: research_lab
title: "PixelGen Experiment Log"
description: "A project-level synthesis from direct-pixel feasibility, semantic/detail factorization, RGB hierarchies, and spatial ordering to HPA error diagnosis and the current Phase-Parallel Pixel AR validation plan."
project_id: pixel-generation
permalink: /en/research/pixel-generation/lab/
og_image: /img/research/research-social-card-en.png
lang: en
alternate_url: /research/pixel-generation/lab/
current_hypothesis: "Global structure still needs a coarse spatial AR, but high-resolution pixels need not be generated through a fully serial image-wide order. A/B checkerboard phases, limited cross-patch communication, and a tiny raster Pixel AR modulated by the large-model state may preserve local boundaries while shortening the dependency path."
current_blocker: "The complete Phase-Parallel design has not been trained. v0.19.1 is only a [1,16] prototype with no checkpoint, log, or sample; it still uses a separate phase-context layer, a 64-dimensional prefix, and GT Phase-A conditioning during training, leaving AdaLN conditioning, sampled-history mismatch, rolling KV eviction, and cross-phase boundary continuity untested."
next_run: "First validate masks, cache parity, and 128-patch batching on [1,2,4]. Then compare prefix versus AdaLN conditioning, fully serial patch AR versus A/B phases, and pre-evict versus post-evict versus no-evict. Report NLL, samples, phase/seam metrics, latency, and peak memory under one protocol before scaling to five levels."
summary_findings:
  - title: "Direct pixel generation has passed the feasibility test"
    summary: "The PixelDiT-style baseline trains and samples reliably under a fixed setup. The remaining work concerns detail quality, efficiency, and scaling behavior."
  - title: "Semantic mode selection and local pixel generation need different dependency ranges"
    summary: "Dual-level AR and Latent AR + Pixel Diffusion both indicate that category and layout need long-range context, while within-patch detail is better handled by a local, parallel, or lightweight generator. No tested branch has yet solved both speed and consistency."
  - title: "Low-resolution RGB carries layout but does not recover local modes reliably"
    summary: "v0.16.8 and v0.17.4–17.5 show that coarse RGB is a useful condition, while mean decoding, hard sampled history, and simple cascades retain blur or block errors."
  - title: "Spatial order changes the direction of periodic error"
    summary: "Period-32 horizontal-gradient phase variation is about 5.6% for the diagonal cohort and 30.2% for the column cohort. This supports a cohort bias, not a fixed per-image watermark."
  - title: "HPA drift begins in coarse history while fine residuals remain weak"
    summary: "GT forcing localizes the main error to L0 / sampled history. Five-level free runs also under-produce adjacent-scale residuals, explaining why more levels fail to add detail."
  - title: "Loss reweighting and a small decoder cannot replace explicit spatial dependence"
    summary: "In v0.17.9, the hard-detail loss degenerates into high-frequency templates, while the first compact cross-attention model produces noise because its pixel state and readout are too weak. Local pixel relations need to enter the generation structure directly."
  - title: "Phase parallelism is a testable design, not an established result"
    summary: "A/B checkerboarding and patch batching have a prototype but no checkpoint or sample. Quality, speed, and boundary continuity still require controlled experiments."
  - title: "Decoder fingerprints are an auxiliary diagnosis for the pixel-space route"
    summary: "ORT generation and oracle reconstruction through the shared AliTok decoder show a highly correlated P16 cohort pattern, indicating that a decoder can add RGB distribution shift. This result does not select the current generator architecture and is not a fixed per-image watermark."
experiments:
  - id: "PXD-00"
    state: kept
    question: "Can a PixelDiT-style baseline be reproduced reliably?"
    config: "4×H100 · batch 256 · 187.5K iterations · 256px"
    observation: "Training and sampling are stable. Semantic structure is coherent, although local details remain soft."
    decision: "Use this model as the fixed baseline for all subsequent experiments."
  - id: "HYB-01"
    state: kept
    question: "How should semantic multimodality and within-patch pixel generation be separated?"
    config: "Dual-level AR → Semantic AR + Pixel Diffusion"
    observation: "Responsibilities become clearer, but pixel-mixer cost and local consistency remain unresolved."
    decision: "Keep it as an early architecture baseline and continue with pure Pixel AR."
  - id: "PXD-04"
    state: kept
    question: "Can Pixel-JiT remove patchify and decode RGB in one step?"
    config: "v0.11.9.3 · one-step RGB decoder"
    observation: "Recognizable semantics and stable samples show that a direct pixel-state-to-RGB path can train."
    decision: "Proceed to RGB-as-tokenizer without a pretrained tokenizer."
  - id: "RGB-01"
    state: mixed
    question: "Can low-resolution RGB serve as a sufficient latent?"
    config: "v0.16.8 + v0.17.4–17.5 CascadeAR"
    observation: "Layout recovers, while detail averaging, block artifacts, and sampled-history drift persist."
    decision: "Diagnose value, belief, history, and decoder capacity separately."
  - id: "ORD-01"
    state: mixed
    question: "How should full-image pixels be ordered without patchify?"
    config: "v0.18.1 diagonal · v0.18.2 column"
    observation: "Both orders generate images but leave different directional period-32 statistics."
    decision: "Treat order as a modeling assumption and report phase/seam metrics."
  - id: "HPA-01"
    state: kept
    question: "Can one shared Transformer model the [1,2,4] RGB hierarchy?"
    config: "v0.17.7 · shared HPA · KV cache"
    observation: "Training and sampling work; shared parameters can operate across scales."
    decision: "Use this skeleton for scale expansion and GT forcing."
  - id: "HPA-02"
    state: mixed
    question: "Why does five-level HPA fail to recover more detail?"
    config: "v0.17.8 · [1,2,4,8,16] · GT forcing"
    observation: "L0/history drives the main drift; generated fine residuals are below GT; the 40k diagnostic is 1.69× slower."
    decision: "Stop adding levels alone; separate history robustness from the fine-detail objective."
  - id: "PAR-01"
    state: mixed
    question: "Is one Patch AR plus non-AR residual decoding sufficient?"
    config: "v0.17.9.2–17.9.3 · noisy history · residual DMoL · hard loss"
    observation: "Strong hard loss degenerates into grayscale high-frequency templates; noisy history is not proven effective."
    decision: "Keep residual targets but reject strong reweighting as a substitute for spatial structure."
  - id: "PAR-02"
    state: dropped
    question: "Can compact cross-attention supply refinement capacity?"
    config: "v0.17.9.4 / 17.9.4b"
    observation: "The first model is pure noise at 6k; the revision reaches 66k without enough evidence of improvement."
    decision: "Restore a stronger pixel state and position-specific readout, then move to explicit local AR."
  - id: "PHA-00"
    state: open
    question: "Can A/B phases replace 256 fully serial patch steps at every level?"
    config: "[1,2,4] · 128 patches/phase · shared 64×2 Pixel AR · AdaLN"
    observation: "v0.19.1 has [1,16] checkerboard code and configuration, but no located training checkpoint, log, or sample."
    decision: "Validate correctness, batching, condition sensitivity, and phase communication before attempting the five-level model."
  - id: "DFP-01"
    state: mixed
    question: "Does a latent decoder add a multiscale pixel-lattice shift in RGB space?"
    config: "EXP-11 · 8 cohorts × 1,000 · P2/P4/P8/P16 · 5-fold grouped CV"
    observation: "ORT generation and reconstruction through the shared AliTok decoder are highly correlated at P16; decoder families have different scale responses."
    decision: "Retain this as auxiliary evidence for the pixel-space route, not as the current generator-modeling mainline."
log_entries:
  - date: "2026-01-18"
    label: "Baseline established"
    title: "Direct pixel generation trains reliably"
    summary: "The reproduction is sufficient to establish feasibility. The focus shifts from whether pixel generation works to the quality-efficiency trade-off."
    decision: "Branch from one stable baseline rather than repeatedly changing the training recipe."
    url: /en/research/notes/pixelgen-01/
    state: done
  - date: "2026-01-19"
    label: "Architecture split"
    title: "Separated semantic multimodality from pixel detail"
    summary: "Dual-level AR separates global semantic sampling from local pixel sampling, but exposes context-length and conditioning conflicts."
    decision: "Let diffusion process all pixels within a patch jointly."
    url: /en/research/notes/pixelgen-02/
    state: done
  - date: "2026-06-20"
    label: "One-step decoding and RGB latent"
    title: "Direct RGB works, but coarse RGB does not uniquely determine a patch"
    summary: "The Pixel-JiT one-step decoder trains. The tokenizer-free low-resolution RGB path then repeatedly shows detail averaging and sampled-history drift."
    decision: "Replace one cross-scale jump with a diagnosable hierarchy."
    url: /en/research/experiments/pixel-generation-05/
    state: done
  - date: "2026-06-29"
    label: "Spatial ordering"
    title: "Diagonal and column grouping leave different periodic bias"
    summary: "Spatial order directly changes the aggregate error direction, so any parallel factorization must measure phases and boundaries explicitly."
    decision: "Treat spatial factorization as part of the model, not only a throughput choice."
    url: /en/research/experiments/pixel-generation-06/
    state: done
  - date: "2026-07-17"
    label: "HPA diagnosis"
    title: "The shared hierarchy works; errors begin in history and details stop in residuals"
    summary: "v0.17.7 validates the shared Transformer. v0.17.8 GT forcing and residual statistics split hierarchical failure into two mechanisms."
    decision: "Stop scaling level count alone and move to history robustness plus explicit local dependence."
    url: /en/research/experiments/pixel-generation-08/
    state: done
  - date: "2026-07-28"
    label: "Patch AR"
    title: "Loss reweighting cannot replace spatial relations between pixels"
    summary: "Residual DMoL remains useful, while hard-detail loss and compact CA expose texture-template and readout-capacity failures."
    decision: "Restore local raster AR inside each patch."
    url: /en/research/experiments/pixel-generation-09/
    state: done
  - date: "2026-08-07"
    label: "Phase-parallel design"
    title: "Defined the A/B partial order as the next unvalidated hypothesis"
    summary: "The 128 patches in one phase advance local Pixel AR together. The current evidence is an implementation prototype, not an end-to-end result."
    decision: "Use [1,2,4] to isolate implementation, conditioning, factorization, sampling-gap, and KV-eviction failures."
    url: /en/research/experiments/pixel-generation-10/
    state: done
  - date: "2026-08-11"
    label: "Decoder fingerprint"
    title: "Localized the latent-decoder patch lattice in the RGB distribution"
    summary: "Across 8×1,000 images, five-fold OOF tests and energy effects show decoder-specific P2–P16 responses. ORT and reconstruction using the same AliTok decoder almost reproduce one P16 pattern."
    decision: "Retain decoder-induced distribution shift as an auxiliary motivation and independent diagnosis without letting the detection task replace the generator-design question."
    url: /en/research/experiments/pixel-generation-11/
    state: done
  - date: "2026-08-11"
    label: "Mainline synthesis"
    title: "Returned to the core validation problem for parallel Pixel AR"
    summary: "The preceding experiments separate failure into coarse mode selection, sampled history, local dependence, and spatial order. Phase-Parallel turns these diagnoses into one controlled next test."
    decision: "Prioritize [1,2,4] ablations for correctness, conditioning, phase factorization, and KV eviction; continue fingerprint controls as an independent auxiliary analysis."
    url: /en/research/experiments/pixel-generation-10/
    state: current
---

## Recording convention

This page owns the project-level synthesis. It first states the conclusions that still hold across runs, then keeps comparable results in the matrix; the complete record list below is assembled automatically by project ID. New work only needs a new experiment record, plus an update here when the synthesis or matrix changes.
