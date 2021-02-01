---
#layout:     post
title:      "VGG's Implement Using Tensorflow"
subtitle:   "Stronger Network In Computer Version"
date:       2018-09-26 21:03:00
author:     "xu"
header-img: "img/in-post/DNA-projects/head.jpg"
header-mask: 0.3
catalog:    true
tags:
    - Deep Learning
    - CNN
    - Computer Vision
    - TensorFlow
---
VGG是2014年ImageNet挑战赛的第一名，也是深度学习在计算机视觉的一个重要节点。由于在SRGAN实验中，需要用VGG来抽取样本的特征，并通过该网络来计算一个损失参数。由此我必须重现一个VGG，可是在现今预训练好的网络中都是用传统的RGB来训练ImageNet的数据的，我需要重写一个demo，使其拥有训练灰度图像的能力

这篇博客包括了VGG的结构，VGG的能力，VGG的代码实现，ImageNet训练的util包实现。


