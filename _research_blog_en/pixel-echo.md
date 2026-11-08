---
layout: article
title: "Pixel Echo: The Pattern a Decoder Writes into Every Image"
title_zh: "Pixel Echo：decoder 写进每张图里的图案"
summary: "Generated images carry a faint pattern locked to the pixel grid. Measured by phase and period, it points back to the decoder that wrote it."
summary_zh: "生成图像里有一层锁定在像素网格上的微弱图案。按相位和周期把它测出来，就能追溯到写下它的 decoder。"
date: 2026-11-08 09:00:00
author: "Dongli Xu"
hide_byline: true
lang: en
content_type: blog
topic: "Generative Models"
math: true
scripts:
  - /js/article/pixel-echo-film.js
  - /js/article/pixel-echo-figs.js
toc:
  - { id: traces, en: "Traces on the grid", zh: "网格上的痕迹" }
  - { id: measure, en: "The measurement", zh: "测量方法" }
  - { id: emerge, en: "One image is enough", zh: "一张图就够" }
  - { id: route, en: "Same decoder, same echo", zh: "同一 decoder，同一回声" }
  - { id: periods, en: "Periods and upsampling", zh: "周期与上采样" }
  - { id: attribution, en: "Attribution", zh: "来源归因" }
  - { id: limits, en: "Limitations", zh: "局限" }
  - { id: source, en: "Source", zh: "来源" }
tags:
  - Generative Model
  - Image Forensics
---

<figure class="film" id="pe-film" data-fig="film" data-src="/assets/blog/pixel-echo/data.json">
  <div class="film-stage">
    <canvas aria-label="Animated walkthrough of the Pixel Echo measurement"></canvas>
    <div class="film-status"></div>
  </div>
  <div class="film-controls">
    <button type="button" class="film-play" aria-label="Pause"></button>
    <div class="film-chapters"></div>
  </div>
</figure>

<h2 id="traces"><span data-lang="en">Generated images carry traces locked to the pixel grid</span><span data-lang="zh">生成图像带着锁定在像素网格上的痕迹</span></h2>

<div data-lang="en" markdown="1">
Model fingerprints, checkerboard artifacts and spectral discrepancies in generated images are well documented. A classifier can use them to tell sources apart, but it does not say *which stage* of image formation wrote them. That matters more now than it used to: many diffusion and autoregressive generators decode their outputs through the same, or closely related, latent decoders.

The Pixel Echo paper asks a narrower question: **what does a recurring pixel pattern reveal about the pipeline that produced the image?** Where a trace comes from decides what it can attribute an image to, and which operations erase it.
</div>
<div data-lang="zh" markdown="1">
生成图像中的模型指纹、棋盘格伪影和频谱差异早有大量研究。分类器可以借这些痕迹区分来源，但它说不清痕迹是由成像流程中的**哪一步**写下的。这个问题现在更重要了：很多扩散模型和自回归生成器，最后都通过同一个、或者非常相近的 latent decoder 输出图像。

Pixel Echo 这篇论文问了一个更具体的问题：**一个反复出现的像素图案，能透露成像流程的什么信息？** 痕迹从哪里来，决定了它能把图像归因到什么，也决定了哪些操作会把它抹掉。
</div>

<h2 id="measure"><span data-lang="en">Pixel Echo folds local responses onto a 16 × 16 phase grid</span><span data-lang="zh">Pixel Echo 把局部响应折叠到 16 × 16 的相位网格上</span></h2>

<div data-lang="en" markdown="1">
The measurement has two steps, shown in the film above. First, compute how much each pixel's luminance differs from its four neighbours, the absolute Laplacian response:

$$E_x(i,j) = \bigl|\,4Y(i,j) - Y(i{-}1,j) - Y(i{+}1,j) - Y(i,j{-}1) - Y(i,j{+}1)\,\bigr|$$

Second, average that response over every pixel that sits at the same position within a repeating 16 × 16 grid, across all images in a cohort:

$$F(a,b) = \frac{\sum_{x}\sum_{i \equiv a,\ j \equiv b \ (\mathrm{mod}\ 16)} E_x(i,j)}{\#\{\text{pixels at phase }(a,b)\}}$$

Image content lands at random phases and averages out. A pattern tied to fixed grid positions adds up.
</div>
<div data-lang="zh" markdown="1">
测量分两步，就是上面动画演示的过程。第一步，计算每个像素的亮度和上下左右四个邻居差多少，也就是拉普拉斯响应的绝对值：

$$E_x(i,j) = \bigl|\,4Y(i,j) - Y(i{-}1,j) - Y(i{+}1,j) - Y(i,j{-}1) - Y(i,j{+}1)\,\bigr|$$

第二步，在一组图像里，把所有位于 16 × 16 重复网格中同一位置的像素响应平均起来：

$$F(a,b) = \frac{\sum_{x}\sum_{i \equiv a,\ j \equiv b \ (\mathrm{mod}\ 16)} E_x(i,j)}{\#\{\text{相位为 }(a,b)\text{ 的像素}\}}$$

图像内容落在哪个相位是随机的，会被平均掉；锁定在固定网格位置上的图案则会累加起来。
</div>

<h2 id="emerge"><span data-lang="en">One image already shows the decoder’s pattern</span><span data-lang="zh">一张图就已经能看到 decoder 的图案</span></h2>

<div data-lang="en" markdown="1">
How many images does it take? Fewer than you might expect. In the paper's canonical measurement, a single 16 × 16 block barely shows Pixel Echo (median $r = 0.165$ to the cohort template), but one whole image already does: $r = 0.690$ for reconstructions and $0.686$ for ORT generations, against $0.009$ for real photos. Averaging 1,000 images sharpens it to $0.995$, while real photos stay at $0.160$.

Figure <a data-figref="emergence"></a> lets you scrub through the same effect cohort by cohort.
</div>
<div data-lang="zh" markdown="1">
需要多少张图？比想象的少。按论文的标准测量，单个 16 × 16 块几乎看不出 Pixel Echo（与 cohort 模板的相关系数中位数 $r = 0.165$），但一整张图就已经能看到：重建图 $r = 0.690$，ORT 生成图 $0.686$，而真实照片只有 $0.009$。平均 1,000 张图后提高到 $0.995$，真实照片仍只有 $0.160$。

图 <a data-figref="emergence"></a> 可以逐个 cohort 拖动查看这个过程。
</div>

<figure data-fig="emergence" data-pe-fig="emergence" data-src="/assets/blog/pixel-echo/data.json">
  <div class="fig-frame">
    <div class="fx-chips"></div>
    <div class="fx-grid">
      <canvas class="fx-map" aria-label="Phase field"></canvas>
      <svg class="fx-line" role="img" aria-label="Similarity to final field versus number of images"></svg>
    </div>
    <div class="fx-row">
      <button type="button" class="fx-play" aria-label="Play"></button>
      <input type="range" min="0" max="64" value="0" step="1" aria-label="Number of images">
      <div class="fx-seg">
        <button type="button" data-scale="shared"><span data-lang="en">Shared scale</span><span data-lang="zh">共享色标</span></button>
        <button type="button" data-scale="own"><span data-lang="en">Per panel</span><span data-lang="zh">单图自适应</span></button>
      </div>
    </div>
    <div class="fx-readout"></div>
  </div>
  <figcaption>
    <span data-lang="en"><b>Figure <span class="fig-num"></span>. The P16 field as images are averaged.</b> Left: centred 16 × 16 phase field after averaging N images. Right: correlation of each cohort's field at N with its own field at N = 1,000. Decoder cohorts (ORT, AliTok, RAE) settle within a few images; real photos keep drifting because their field is mostly content. “Shared scale” uses one colour limit for every cohort, so weak fields look nearly white. Data: exploratory estimator from the project page (valid boundary, per-image normalised), so values differ slightly from the canonical numbers in the text.</span>
    <span data-lang="zh"><b>图 <span class="fig-num"></span>. 随着平均图像数增加的 P16 相位场。</b>左：平均 N 张图后的中心化 16 × 16 相位场。右：每个 cohort 在 N 张图时的相位场与它自己在 N = 1,000 时的相关系数。decoder 类 cohort（ORT、AliTok、RAE）几张图就稳定了；真实照片一直在变，因为它的相位场主要来自图像内容。"共享色标"对所有 cohort 用同一个色标上限，所以弱的相位场看起来几乎是白的。数据来自项目页的探索性估计器（valid 边界、逐图归一化），数值和正文里的标准测量略有不同。</span>
  </figcaption>
</figure>

<h2 id="route"><span data-lang="en">The same decoder writes the same echo, whatever the input route</span><span data-lang="zh">同一个 decoder 写下同一个回声，与输入路径无关</span></h2>

<div data-lang="en" markdown="1">
To trace the pattern to its source, the study exchanges one stage of the pipeline at a time and hold everything else fixed. Keep the decoder and change only its input — a real image encoded and reconstructed, versus a latent produced by a generator — and the pattern does not change. In two decoder families the same-decoder fields agree at $r = 0.996$ and $0.846$, against $0.06$ across different decoders. Pixel-head replay then locates one decoder's pattern in phase-specific projection weights.
</div>
<div data-lang="zh" markdown="1">
为了找到图案的来源，论文每次只替换流程中的一个环节，其他全部固定。固定 decoder、只改它的输入（真实图像编码后再重建，或者生成器产生的 latent），图案不变。在两个 decoder 家族里，同一 decoder 的相位场相关系数分别是 $r = 0.996$ 和 $0.846$，不同 decoder 之间只有 $0.06$。再通过 pixel-head replay，可以把其中一个 decoder 的图案定位到与相位相关的投影权重上。
</div>

<h2 id="periods"><span data-lang="en">A decoder’s own pattern sits at periods up to its upsampling factor</span><span data-lang="zh">decoder 自己的图案集中在不超过其上采样倍数的周期上</span></h2>

<div data-lang="en" markdown="1">
A latent decoder enlarges its input by repeated doubling. Each doubling turns one position into a 2 × 2 block; if the network treats those four pixels differently, it leaves a pattern that repeats every 2 pixels, and every later doubling stretches it. So the method splits the phase field exactly into four count-weighted, orthogonal parts — the structure that first appears at periods 2, 4, 8 and 16 — and call their strengths the **scale profile** (film, last chapter).

Swapping decoders on fixed latents shows the rule. Six ×8 decoders applied to the same latents differ at P2–P8 yet share their P16 component with each other and with real photos; ×16 decoders write P16 themselves. Two of those decodings agree at only $r = 0.12$ in the full field, but at $0.82$ in P16 — which is what the decomposition is for.

Figure <a data-figref="profiles"></a> shows the scale profile of every cohort in the released measurements. Note that the share alone is not a signature: real photos also put most of their (tiny) energy at P16. What separates the ×16 decoders is amplitude — about 20× real — together with the shape of the field.
</div>
<div data-lang="zh" markdown="1">
latent decoder 通过反复翻倍来放大输入。每翻倍一次，一个位置变成一个 2 × 2 的块；如果网络对这四个像素的处理不同，就会留下每 2 像素重复一次的图案，之后的每次翻倍都会把它拉长。所以这个方法把相位场精确拆成四个按像素数加权、彼此正交的部分，分别是在周期 2、4、8、16 首次出现的结构，并把它们的强度称为 **scale profile**（见动画最后一章）。

在固定 latent 上替换 decoder，就能看到这条规律。六个 ×8 decoder 作用在同一批 latent 上，在 P2–P8 各不相同，但 P16 分量彼此一致，也和真实照片一致；×16 decoder 则自己写出 P16。其中两个解码结果在完整相位场上相关系数只有 $r = 0.12$，在 P16 上却有 $0.82$，这正是做分解的意义。

图 <a data-figref="profiles"></a> 列出了公开测量数据里每个 cohort 的 scale profile。注意，仅看能量占比并不能区分来源：真实照片的（很小的）能量也大部分在 P16。把 ×16 decoder 区分出来的是幅度（约为真实照片的 20 倍）以及相位场的形状。
</div>

<figure data-fig="profiles" data-pe-fig="profiles" data-src="/assets/blog/pixel-echo/data.json">
  <div class="fig-frame">
    <div class="fx-profiles"></div>
    <div class="pr-legend">
      <span><i style="background:#e8d3c8"></i>P2</span><span><i style="background:#d6a48d"></i>P4</span><span><i style="background:#c4612f"></i>P8</span><span><i style="background:#7d3517"></i>P16</span>
    </div>
  </div>
  <figcaption>
    <span data-lang="en"><b>Figure <span class="fig-num"></span>. Scale profiles across decoders.</b> For each cohort (1,000 images): the four primitive increments ΔP2–ΔP16, tiled over the 16 × 16 grid (shared colour limit within each row); the share of increment energy at each period; and total RMS relative to real photos (log bar). Unnormalised estimator; cohorts differ in domain and resolution, so absolute amplitudes include those factors.</span>
    <span data-lang="zh"><b>图 <span class="fig-num"></span>. 各 decoder 的 scale profile。</b>每个 cohort 各 1,000 张图：四个基本增量 ΔP2–ΔP16 平铺在 16 × 16 网格上（每行共用一个色标上限）；各周期增量的能量占比；以及相对真实照片的总 RMS（对数条）。使用未归一化的估计器；各 cohort 的图像领域和分辨率不同，绝对幅度里包含这些因素。</span>
  </figcaption>
</figure>

<h2 id="attribution"><span data-lang="en">The echo is enough to attribute images to their decoder pipeline</span><span data-lang="zh">回声足以把图像归因到它的 decoder 流程</span></h2>

<div data-lang="en" markdown="1">
Having traced the pattern to the decoder, the paper uses the measurement as it stands. On a class-to-image benchmark (real images plus generators) and a text-to-image benchmark with seven sources, linear heads and thresholds frozen on validation attribute **95.1%** (four-way) and **90.9%** (seven-way) of held-out test images to the correct source — **98.6%** and **94.9%** with frequency features appended — at per-source false-positive rates of **0–1.4%** on real images. Permutation tests separate real images and the four class-to-image sources pairwise (Holm-adjusted $p \le .0012$).
</div>
<div data-lang="zh" markdown="1">
确认图案来自 decoder 之后，论文直接用这个测量做归因。在类别到图像（真实图像加若干生成器）和文本到图像（七个来源）两个基准上，在验证集上冻结的线性分类头和阈值，在留出的测试集上把 **95.1%**（四分类）和 **90.9%**（七分类）的图像归到正确来源；加上频域特征后是 **98.6%** 和 **94.9%**；对真实图像的逐来源误报率为 **0–1.4%**。置换检验表明，真实图像和四个类别到图像的来源两两之间都有显著差异（Holm 校正后 $p \le .0012$）。
</div>

<h2 id="limits"><span data-lang="en">Limitations</span><span data-lang="zh">局限</span></h2>

<div data-lang="en" markdown="1">
- **Closed-set.** Attribution identifies the decoder and export pipeline among known sources, not the upstream generator, and not sources it has never seen.
- **The grid must survive.** Phase labels follow the raster origin, so crops, shifts and resizing change or destroy the echo.
- **Not the first periodic trace.** Periodic artifacts and fingerprints are long known; Pixel Echo is a way to resolve them by phase and period and read them back to a stage of the pipeline.
</div>
<div data-lang="zh" markdown="1">
- **闭集。**归因只能在已知来源里识别 decoder 和导出流程，识别不了上游生成器，也识别不了从没见过的来源。
- **网格必须保留。**相位标签跟随像素栅格的原点，裁剪、平移、缩放都会改变甚至抹掉回声。
- **不是第一个发现周期性痕迹的工作。**周期性伪影和模型指纹早就有人研究；Pixel Echo 是按相位和周期把它们分辨出来、并追溯到流程中具体环节的一种方法。
</div>

<h2 id="source"><span data-lang="en">Source</span><span data-lang="zh">来源</span></h2>

<div data-lang="en" markdown="1">
This post explains *Pixel Echo: Multiscale Phase Decomposition of Generator Fingerprints* (preprint, 2026). Numbers in the text are quoted from the paper; Figures 2 and 3 are redrawn from its released measurement files.
</div>
<div data-lang="zh" markdown="1">
本文解读的是 *Pixel Echo: Multiscale Phase Decomposition of Generator Fingerprints*（预印本，2026）。正文中的数字引自论文；图 2 和图 3 根据其公开的测量数据重新绘制。
</div>
