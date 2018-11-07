---
#layout:     post
title:      "DNA Project Notes"
subtitle:   "First step to bioinformation,solve sequences classification using overfitting of LSTM"
date:       2018-09-25 14:06:00
author:     "xu"
header-img: "img/in-post/DNA-projects/head.jpg"
header-mask: 0.3
catalog:    true
tags:
    - DeepLearning
    - Bioinformation
---

I can not tell you until all the work is down.


 传统的方法中我们使用字符串匹配算法从巨量的数据库中对宏基因进行比对和确定，但是这么一来，无论如何优化传统的查找匹配的数据结构，增加内存占用，多设置几个哈希表，设置几个分类树结构，都是毫无新意的“老套路”。但是我们若使用LSTM和CNN对大批量的原始数据进行过拟合，无论学习到排序信息或者高维度的蛋白质组合信息，我们都能对所有出现在原始数据中的基因片段进行快速的分类。这是一个庞大的网络结构，其中包括了所有古细菌，真菌和病毒的常见信息段。由于网络层数的浅显，将会用超越传统测序分类产品几个量级的速度对希望分类的数据进行分类。该项研究的另一个好处在于大规模的学习常见宏基因序列的情况下，很容易发现过去人们没有预见的“毫无关联”的序列之前的潜在联系，因为它们会被映射到一个非常高的维度进行特征匹配或者分类，在这些维度上面折射的信息常常是过去的研究方法无法直接观察的，这些信息很可能是基因功能的信息，因为我们知道基因的排序是低纬度（1维度）的信息，而它们的生物功能是高维度的（3维）信息。当我们把decoder（转录rna）的信息融合进网路的设计之后,也就是说我们能够通过类似的字符处理网络的手段对相似结构或者相似功能的基因进行高维归类，从而发掘出前人从未发现过的基因之间的新联系和新功能信息。
