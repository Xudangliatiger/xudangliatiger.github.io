---
layout: research_note
lang: en
content_type: experiment
project_id: pixel-generation
record_id: "EXP-02"
part: "Note 02"
title: "Pixel-level Generative Models (II)"
date: 2026-01-19 16:00:00
author: "Dongli Xu"
experiment_stage: "Dual-level AR"
summary: "A two-stage autoregressive design that separates semantic decisions from pixel regression, together with its context, sampling, and CFG problems."
alternate_url: /2026/01/19/PIxel-level-generation-2/
header-img: "img/in-post/pixel-gen/img.png"
og_image: /img/research/research-social-card-en.png
tags:
  - Computer Vision
  - Generative Model
  - Pixel Generation
  - Autoregression
  - Diffusion
---

Following the pixel-diffusion experiments in Note 01, we began building an efficient pixel-space autoregressive model.

> **Method B: Dual-level AR**

## Exploring Dual-level AR

The design uses two cascaded autoregressive models:

- **Stage 1: Semantic AR**, operating at the semantic level.
- **Stage 2: Pixel AR**, operating directly on pixels.

### Core intuition

The first stage performs next-$x$ prediction in a downsampled semantic representation space. I use the term **next-$x$** deliberately rather than next-token or next-class, because the output is not required to correspond to a discrete category or a canonical semantic token.

Instead, the first stage may output any continuous deep feature—such as a vector $X$—provided that it carries a useful semantic proposal for what should be generated next.

The second-stage Pixel AR treats that proposal as a condition. Within each patch, it consumes all pixels generated so far and regresses the next pixel step by step.

This can also be viewed as a global-to-local decomposition:

- The semantic stage proposes a globally feasible structure.
- The pixel stage models local detail while remaining consistent with that semantic condition.

---

### Implementation questions

#### 1. Which stage performs sampling?

If sampling is delegated entirely to Pixel AR and Semantic AR supplies only a semantic proposal, the first-stage feature must somehow contain all plausible alternatives at the current step.

Consider a dog image in which the ears and head outline have already been generated and the next patch contains an eye. The iris could plausibly be purple, orange, or brown: the conditional target is multimodal.

If the first stage does not sample, its feature $X$ must represent all these modes simultaneously. The second stage must then generate pixels while also choosing among the modes encoded in $X$.

This creates a potential inconsistency. Suppose that, for a $16 \times 16$ patch, the first 32 generated pixels have implicitly committed to an orange iris. The composite semantic feature still contains the purple and brown alternatives. Later pixel regressions continue to receive those irrelevant modes, which may cause interference or even a color drift within the patch.

#### 2. Which stage learns the multimodal distribution?

A natural way to avoid the conflict is to sample at the semantic stage. For example, the first model could predict a 4,096-way discrete distribution together with a dictionary of 4,096 deep features. After sampling an index, it would pass one selected, effectively single-mode semantic feature to Pixel AR.

Under this decomposition:

- Semantic-level multimodality and sampling are handled by Stage 1.
- Pixel-level detail and its remaining multimodality are handled by Stage 2.

#### 3. How much context does Pixel AR need?

A difficult question is whether Pixel AR must see every previously generated pixel when predicting the next patch or pixel. Intuitively, it should: global color, structure, and boundary continuity all depend on the image history.

In principle, however, Semantic AR has already absorbed that history. Only fine-grained details were lost during compression, so perhaps the pixel stage does not need the full sequence.

If we nevertheless pass all generated pixels to Pixel AR, the sequence becomes extremely long. Attention cost grows as $O(N^2)$, making both memory and computation nearly prohibitive.

#### 4. How does this differ from tokenizer-based AR?

The two systems are closely related:

- Semantic AR is approximately a conventional tokenizer-based AR model, except that its tokens may be continuous features rather than discrete codes.
- Pixel AR is a detail generator conditioned on the semantic token, but it models the output directly in pixel space.

#### 5. Where should CFG be applied?

Classifier-free guidance is no longer attached to a single obvious model. It could be applied to the semantic stage, the pixel stage, or both. The definition of the unconditional branch is also ambiguous: should it remove the semantic condition, the pixel history, or some combination of the two?

This becomes even clearer in the hybrid model below.

## Method C: a hybrid AR + diffusion architecture

The hybrid design retains Semantic AR but replaces the pixel-regression stage with diffusion.

This has three potential advantages.

#### 1. A composite semantic feature no longer conflicts with sequential pixel sampling

When Stage 1 does not sample, a second autoregressive stage must reconcile a multimodal semantic feature with pixels that have already committed to one mode. Diffusion avoids this particular conflict because each denoising step updates all pixels in the patch jointly rather than locking them in one at a time.

#### 2. The pixel diffusion stage can perform multimodal sampling

In the AR + diffusion design, Semantic AR provides a multimodal semantic representation and diffusion turns it into one pixel result. This reverses the spirit of TiDAR—“think in diffusion, talk in autoregression”—and raises a useful empirical question: which direction should perform which part of the uncertainty reduction?

It is also possible to keep sampling in Stage 1 and pass an already selected semantic feature to pixel diffusion. The experiments need to compare both variants.

#### 3. MAR provides evidence that the composition can work

[MAR](https://arxiv.org/abs/2406.11838) applies AR plus diffusion to latent features. A $16 \times 16 \times 3$ pixel patch can equally be interpreted as a 768-dimensional continuous vector, so the same construction should be applicable in pixel space.

### CFG in a hierarchical generator

In a conventional conditional generator, classifier-free guidance has two clear branches:

- **Conditional:** receive condition $c$, such as text, class, or prompt.
- **Unconditional:** replace the condition with a null token or empty prompt.

The guided prediction is

$$
\mathrm{pred}_{\mathrm{cfg}} = \mathrm{pred}_{\mathrm{uncond}} + s \cdot \bigl(\mathrm{pred}_{\mathrm{cond}} - \mathrm{pred}_{\mathrm{uncond}}\bigr),
$$

where $\mathrm{pred}$ may be an $\epsilon$-, $x$-, or $v$-prediction, or even autoregressive logits. The expression only requires a model output at the current step; $s$ is the guidance scale.

In AR + diffusion, the pixel generator has at least two kinds of conditioning information:

1. An external condition $c$, such as a class or text prompt.
2. A semantic representation $z$ produced by Semantic AR, which may itself remain multimodal.

The central question is therefore: **what exactly is removed in the unconditional branch?**

#### Option 1: implement CFG through $z$

This is the most natural and stable formulation when the pixel generator does not see $c$ directly. Its only condition is the representation $z$ produced by Semantic AR. Guidance then compares two semantic representations:

- Conditional semantics: $z_c = f_{\mathrm{AR}}(c)$
- Unconditional semantics: $z_{\varnothing} = f_{\mathrm{AR}}(\varnothing)$

The pixel model evaluates

- Conditional branch: $\mathrm{pred}(x_t \mid z_c)$
- Unconditional branch: $\mathrm{pred}(x_t \mid z_{\varnothing})$

and combines them as

$$
\mathrm{pred}_{\mathrm{cfg}} = \mathrm{pred}(x_t \mid z_{\varnothing}) + s\Bigl(
\mathrm{pred}(x_t \mid z_c) - \mathrm{pred}(x_t \mid z_{\varnothing})\Bigr).
$$

This is best understood as guidance in the semantic representation space, not guidance defined directly in pixel space.

The difficulty is conceptual rather than algebraic: the condition is now hierarchical rather than a single prompt. The definition of “unconditional” determines the meaning of the guidance signal.

### How should the pixel decoder scale?

Autoregressive prediction is multimodal, so its pixel decoder cannot necessarily remain as lightweight as the decoder in pixel diffusion. The diffusion model already receives the current noisy pixel values and often faces a more locally single-mode prediction problem. A decoder that must infer exact pixels from semantic information alone needs more capacity.

#### 1. MLP mixer

For an MLP-mixer design, capacity can be increased simply by widening the feature dimension. The drawback is that there is no explicit pixel-to-pixel interaction. In our experiments, this variant produced substantial noise, and the cause is not yet clear.

#### 2. Pixel attention

Explicit pixel attention becomes too memory-intensive when each pixel has a 128-dimensional embedding: the number of items increases by a factor of 256. It is not obvious that each pixel needs such a large representation; recent work often uses dimensions of 16 or 32.

#### 3. Width and AdaLN

Increasing the pixel dimension from 16 to 64 improved performance. But a high-dimensional pixel-wise AdaLN would require roughly 400M parameters. Replacing it with ordinary AdaLN did not hurt the MLP mixer, yet it degraded the attention variant.

One compromise is to keep the representation narrow while applying pixel AdaLN, then expand it only before attention so that multi-head interaction happens in a wider space.

#### 4. Number of attention heads

At dimension 16, increasing the number of heads from one to four improved performance. Pixel interaction is not only about RGB values; it also carries patch semantics and longer-range signals. Multiple heads can support multiple interaction patterns—for example, semantic identity may depend on visually similar pixels while brightness depends on reflected or refracted light elsewhere in the patch.

At dimension 64, however, moving from one head to four sharply degraded quality and introduced many noisy points. This suggests that each head may still need approximately 64 dimensions, bringing the design uncomfortably close to conventional attention and its computational cost.

#### 5. Wider MLP after attention

Increasing the MLP from $4 \times \mathrm{dim}$ to 1,024 dimensions produced a small improvement. The module adds only about 1–10M parameters, but its compute cost becomes very high. For now, that trade-off remains unconvincing.

These results leave the decoder design unresolved. The next note focuses on the hybrid experiments and whether explicit pixel attention is necessary at all.
