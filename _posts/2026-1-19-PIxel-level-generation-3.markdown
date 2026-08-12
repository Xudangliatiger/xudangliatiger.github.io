---
layout:     post
title:      "像素级别的生成模型（三）"
date:       2026-01-31 11:00:00
author:     "Dongli Xu"
lang:       zh
content_type: experiment
alternate_url: /en/research/notes/pixelgen-03/
project_id: pixel-generation
record_id: "EXP-03"
experiment_stage: "Hybrid AR + Diffusion"
summary: "探索 Latent AR + Pixel Diffusion 混合架构，并根据 pixel attention 的噪点与计算代价收敛轻量 decoder 的后续方向。"
header-img: "img/in-post/pixel-gen/img.png"
tags:
    - Computer Vision
    - Generative Model
    - Pixel Generation
    - Autoregression
    - Diffusion
---

本文接上文对Dual-level AR的探索之后，我们开始探索搭建一个Hybrid的Latent AR + Pixel Diff

## 方法 C: Hybrid Model, AR+Diffusion架构的探索

在这个架构中，我们依旧采用semantic AR的设计，但是在pixel回归的阶段，我们把它弄成一个diffusion即可。

这样做的好处：

> 1: 复合语义特征不再会恶搞像素采样了

这非常好理解，之前我们讲到 如果第一个阶段的AR不采样的话，第二个阶段的AR在采样的时候就需要处理多峰语义信息和已经采样的像素之间的可能出现的矛盾。
那么有什么生成框架没有这样的矛盾呢？答案是diffusion，原因也很简单，diffusion在单步采样的时候会同时处理所有的像素点，绝对保障了像素之间的采样不会出现冲突。

> 2: 多峰采样可以由第二阶段的diffusion单独搞定（不一定优于分开采样）

在AR+Diffusion的框架下，AR提供一个多峰语义，diffusion提供一个最后的像素结果。

这就是TiDAR: Think in Diffusion, Talk in Autoregression精神的反面嘛。那到底谁对了 谁错了呢


也许也可以类似刚刚的设计，让第一阶段的AR还是进行采样再输入pixel diff。

> 3: 这样的设计经过MAR的检验，大概率会起作用。

我们仔细思考一下[MAR](https://arxiv.org/abs/2406.11838)的设计，虽然它是搞 AR+diffusion on latent feature的，但是我们完全可以吧$16*16*3$的像素值当成一个768长度的latent嘛，有何不可呢？



### 实现问题

但是在实现中，我们也发现了不少问题，其中很有意思的就是CFG的逻辑问题。

#### CFG 如何在多层生成模型中实现

在传统生成模型的CFG，我们有非常清晰的两路：

- **cond**：输入条件 $c$（文本/类别/语义）
- **uncond**：把条件置空（null token / 空提示）


在传统生成模型的CFG 中，我们通常写成：
$$
\text{pred}_{\text{cfg}} = \text{pred}_{\text{uncond}} + s * \big(\text{pred}_{\text{cond}} - \text{pred}_{\text{uncond}}\big)
$$
这里的 $\text{pred}$ 可以是：$\epsilon$-pred, $x$-pred 和 $v$-pred 甚至是 AR 中的 logits。 
本质上它只是“模型当前步的预测输出”，与具体参数化形式无关。这里 $s$ 是 cfg scale。

但在 AR+Diffusion 中，我们的“条件”不止一个，Pixel diffusion 的条件至少包含两类信息：

1. 外部条件 $c$（class / text / prompt）
2. semantic AR 给出的语义特征 $z$（可能还是多峰的）

于是问题来了：**uncond 到底该去掉哪一个？**

##### 方案 1：通过 $z$ 实现 CFG（最合理也最稳妥）

在该架构中，pixel generator 并不会直接看到外部条件 $c$，  
它的唯一条件输入是 semantic AR 输出的语义表示 $z$。  
因此，CFG 实际上发生在 **两种语义表示之间**：

- 条件语义：$z_c = f_{\text{AR}}(c)$  
- 无条件语义：$z_{\varnothing} = f_{\text{AR}}(\varnothing)$  

pixel generator 定义为：

- cond：$\text{pred}(x_t \mid z_c)$  
- uncond：$\text{pred}(x_t \mid z_{\varnothing})$  

CFG 为：
$$
\text{pred}_{\text{cfg}} = \text{pred}(x_t \mid z_{\varnothing})+ s\Big(
\text{pred}(x_t \mid z_c)- \text{pred}(x_t \mid z_{\varnothing})\Big)
$$

本质上，这是在**语义表征空间上做 guidance**，而不是在像素空间。


##### 更本质的问题

在这个 Hybrid 框架下，CFG 的困难并不是公式层面，而是概念层面：

> 条件不再是单一 prompt，而是一个分层条件系统。  
> uncond 如何定义 → guidance 的语义就如何定义。
> 
> 
> 


### 问题，pixel decoder到底怎么设计？ 在每个patch中，像素是否需要相互交互呢？

首先我们要明确一个问题，AR的多峰预测，暗示了我们的pixel decoder不能像diff那样这么轻量。这是因为semantic diff本身输入就有当前的像素值了，还是一个单峰问题。

如果要让pixel decoder来解码目前的像素的具体值，我们需要给多一点参数才行。

> 1: 如果是MLP mixer方案，我觉得非常简单，直接伸维就行了。

但是每个pixel之间没有进行显示的交互。但是这种方案会出现大量的噪声 不知道为啥

> 2: 如果是pixel attn。问题来了：我们给每个pixel的维度达到128的时候，我们的显存就爆了。
   
这也很好理解，毕竟我们的样本多了256倍。但是有一说一，我们每个像素需要那么多的dim么，我觉得不用。  
所以也许维度维持一个小维度就行了，最近几篇工作推荐的维度是16或者32

> 3: 维度从16->64,能提升性能。 如果维度提升到之后，我们的pixel adaln怎么办，pixel adaln需要的参数量已经达到了400M，如果该用普通的adaln的话，性能在MLP mixer的时候不会掉，在attn的时候会掉。
      
那我们可以在pixel attn之前，保持低维度，并且用上pixel adaln。只是进入到attn后用高维度 多head来进行像素之间的交互。

> 4. 如果在维度很小的情况下，我们的head还需要给吗？

dim=16的情况下，head从1->4,能提升性能。像素之间交互的东西其实除了像素值之外，还有整个patch的语义，以及一些更前特征的事情，所以就算attn dim很小，也得用多个head，保障像素间交换信息的模式不止一个，attnmap不止一个。比如当前像素的语义由相似语义的像素控制，但是实际的亮度却由反光/折射光的像素控制。你可以想象一个太阳下戴帽子的人脸，脸一半在阴影中，一半在阳光中。

但是dim=64的情况下，head从1->4,性能暴降，噪点特别多？这说明单个的head中的dim最好还是有64个，这个设计难道不就是贴近传统的attn了吗，太难了


> 5. attn之后的mlp还需要维度提升吗？

mlp从dim*4->1024,能略微提升性能。但这里的mlp能存储的信息太少，参数量只有1-10M。但是缺点是参数量又增加不大，但是计算量堆到天上去了，我先对此保持怀疑吧。



奇怪，最后我们继续使用 64 head 1，也出现了不少噪点，这是为什么呢？难道是实现的bug，我们确实在input attn前加入了一个dim modify mlp，我们试着取消这个试试。


### 放弃，上面的研究让我觉得每个像素之间的attn似乎没有必要 非常浪费时间。

即使我们使用global attn的思路，但是在这种设计中，像素的交互也是不存在的。像素的交互就是一个简单的mlp mixer就行了。



### 简单地复用MAR的decoder试试：

尝试使用DeCo的decoder，我发现这个decoder有个很有意思的设计，那就是不用任何的mlp mixer。
可惜效果更差，这到底是为什么呢？难道说pixel只是一个高维度的信息在低维度的投影？



### 看来pixel之间还是需要mixer的，不过这个mixer到底怎么设计最合理 最节省参数空间和计算量呢
