---
layout:     post
title:      "像素级别的生成模型（二）"
date:       2026-01-19 16:00:00
author:     "Dongli Xu"
header-img: "img/in-post/pixel-gen/img.png"
tags:
    - Computer Vision
    - Generative Model
---

本文接上文对Pixel Diff的探索之后，我们开始探索搭建一个高效的Pixel AR

> 方法 B：Dual-level AR。

## 方法 B：Dual-level AR 的探索

在这个设计中，我们使用两个级联的 AR 模型：

- **第一层：Semantic AR**（语义级别）
- **第二层：Pixel AR**（像素级别）

### 核心直觉

第一层 AR 更像是在 **downsample 后的语义表征空间**上做 next-x prediction。  
我这里刻意说 **next-x**，而不是 next-token / next-class，因为我并不强制它回归到某个离散类别或“标准语义 token”。

换句话说：第一层输出可以是任意连续的深度特征（例如一个向量 $X$），只要它能承载“接下来应该生成什么”的语义建议即可。

然后第二层 Pixel AR 把第一层输出当作 condition，在每一个patch中，同时输入所有已生成的像素，逐步回归下一个像素。

你也可以从 **global-to-local** 的角度理解它：

- 第一层负责全局语义和结构的可行性建议
- 第二层负责局部细节建模，但必须服从第一层给出的语义条件

---

### 实现细节：几个关键问题

#### 1. **采样由谁来做？**

   如果采样完全交给第二层 Pixel AR，而第一层只给“语义建议”，那第一层输出的特征就必须在某种意义上“包含当前步所有可能性”。

   举个直观例子：我们已经生成了小狗的耳朵、头部轮廓，现在要预测眼睛这个 patch。  
   眼睛可能是紫色、橙色、棕色……这是一个多峰分布。

   如果第一层不采样，那它输出的特征 $X$ 就得同时表达这些多峰语义。  
   第二层一边生成像素，一边还要“在多峰语义里做选择”。

   于是会出现一个很典型的潜在矛盾：

   - 假设一个 $16 \times 16$ patch，第二层在前 32 个像素时已经“隐式决定”用橙色瞳孔；
   - 但第一层的复合语义特征仍包含紫色/棕色等峰；
   - 后续像素回归仍不断接触这些不相关峰，容易造成干扰，甚至出现“前 32 个像素是橙色，后面又漂移成紫色”的不一致现象。

#### 2. **多峰学习由谁来做？**

   为了避免上面的问题，一个自然方案是：**在第一层就完成语义采样**。

   例如第一层输出一个离散分布（比如 4096 类），并配一个长度为 4096 的“深度字典”。  
   第一层采样得到 index，再从字典里取出一个“单峰语义特征”给第二层。

   这样第二层 Pixel AR 的 condition 就不再是混合多峰，而是一个确定的语义选择。

   **从“多峰学习”角度看：**
   - 语义层的多峰建模 + 采样由第一层解决
   - 像素层的多峰细节建模 + 采样由第二层解决


#### 3. **Pixel AR 的 context 问题**

Dual-level 架构中，一个绕不开的问题是：Pixel AR 在预测下一个 patch / pixel 时，是否需要看到所有已生成像素？
直觉上需要，否则很难保证全局一致性（颜色、结构、边界连续）。

但从理论上看，又似乎**不必如此**：semantic AR 已经吸收了历史像素的全部信息，只是细粒度细节在压缩过程中不可避免地丢失。

问题在于，一旦我们仍选择将全部像素作为 context 输入 Pixel AR，序列长度会迅速膨胀，attention 复杂度达到 $O(N^2)$，显存与计算成本几乎不可承受。


#### 4. **它和传统 tokenizer + AR 的区别是什么？**

   在 dual-level AR 里：
   - 第一层 semantic AR ≈ 传统的 tokenizer-based AR（只不过 token 可以是连续特征而不是离散 token）
   - 第二层 pixel AR ≈ 在“语义 token 条件下”的细节生成器，但它直接在像素空间建模

#### 5. **CFG 怎么实现？**

   这一点在实现中非常关键：  
   CFG 在 dual-level 架构里到底应该施加在第一层、第二层，还是同时施加？  
   以及“uncond”应该去掉的是语义条件、还是像素历史、还是两者的某种组合？

   这个问题我后面会单独开一节展开。

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

我们仔细思考一下MAR的设计，虽然它是搞 AR+diffusion on latent feature的，但是我们完全可以吧$16*16*3$的像素值当成一个768长度的latent嘛，有何不可呢？



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