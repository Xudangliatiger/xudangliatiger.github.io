---
#layout:     post
title:      "Study on sc-RNA-seq"
subtitle:   "单细胞基因的处理问题"
date:       2018-11-12 10:13:00
author:     "xu"
header-img: "img/in-post/sc-RNA-seq/head.jpg"
header-mask: 0.3
catalog:    true
tags:
    - Meachine Learning
    - Bioinformation
---

第一步是对高维数据的约减，常用的方法有PCA, tSNE, ZIFA and CIDR.
（但是在进行降维时，我们必须要用填补的方法处理为0的seq）。所以我们涉及的工作内容如下
* simulation
* dropoout & imputation
* dimensional reduction & clustering
>什么是 bulk-RNAseq data 

然后是对于单细胞rna数据仿真的问题

具体使用的是scanpy这个包中的scanpy.api.sim，在使用scanpy中的时候涉及到两种模式，分别是'krumsiek11'和''

这仿真涉及的原理是来自这篇论文：






drop out事件之后的特征选择
https://www.biorxiv.org/content/early/2018/05/17/065094
sc-RNA tools 的介绍
https://cloud.tencent.com/developer/news/331557
