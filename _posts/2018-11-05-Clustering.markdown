---
#layout:     post
title:      "Clustering"
subtitle:   "A Kind Of Unsupervised Learning"
date:       2018-11-05 13:37:00
author:     "xu"
header-img: "img/in-post/clustering/head.jpg"
header-mask: 0.3
catalog:    true
tags:
    - MachineLearning
---

一般来说做聚类是一种无监督学习方法，我们在一定的维度变化的，里面将所有的信息进行整合，然后对该整合结果进行一种映射变换，使之能够反映出不同的subclass 之间的差别，然后利用这个差别来对整块数据的划分。

那么我们注意到，为什么要对原始数据进行维度变化等trick处理呢？原因如下：在原先的数据表达上面，我们很难直接对数据进行划分。。我们无法对很大维度或者很均匀的数据进行划分。由此得有维数越减或者其它的基本思想在里面。我觉得由此Haohan给我的交流中说的很好，原文如下
>"reducing the dimension" is kind of standard in many machine learning methods, the basic belief is that there is an internal space that accounts for the data we observe and that latent space is hopefully clean and easy to operate on, so we need to figure that out. Even for the deep learning methods that you are familiar with, any layer of a neural net is mapping data into a (usually) lower dimension, which they refer as representation learning, but mathematically, all these are the same thing in the sense of mapping data into some space where the information we care can be easily described.

所以我们提到了intent space，就是隐空间。这个概念我也只能说直观字面的了解了，它在cv里面出现很多，待填


Haohan的[network clustering]里面提到了，我们不能使用这种处理方式：在单个数据的维度为{x,y,z,j,k,l……}的数据集里面，用f(x)来做聚类，然后用f(y,z,j,k,l)来评价聚类算法，比如求均差值等等。