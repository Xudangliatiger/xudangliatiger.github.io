---
layout:     post
title:      "ML杂记"
subtitle:   "一个月没学习了"
date:       2018-05-11 11:51:00
author:     "xu"
header-img: "img/in-post/post-how-2-computernetworking/head.jpg"
header-mask: 0.3
catalog:    true
tags:
    - Machine Learning
---
线性回归函数

代价函数：惩罚训练集的错误，付出代价：cost（）

权重

学习率

正则化

1/2m和1/m的区别：好像1/2m是均方差
θj:=θj−α1m∑i=1m(hθ(x(i))−y(i))x(i)j[2]θj:=θj−α1m∑i=1m(hθ(x(i))−y(i))xj(i)[2]

等高曲线，展示曲面

学习速率：上面的α

 某些算法能自动选择α而不用自己选择，但是不需要了解内在的问题，只需要在机器学习的过程中使用它们即可


关于工具的问题，学习matlab，或者octave

学习octava中

过拟合问题

Generalize:泛化 指一个假设模型应用到新样本的能力

过拟合后的曲线（函数）是过度贴合原数据样本的，所以会导致代价函数为0或者so on。
于是新的样本对于此模型没得任何判断价值，称为过拟合

在后面加一个正则化惩罚项，对每一个θ进行惩罚缩小，使结构更拟合结构


（activation function）激励函数

可掰弯

程序嵌套的，不需要自己写

也可以自己写，必须保证可微分


单层神经网络。只需要随便扳弯即可

但是深度神经网络，需要考虑激励函数的选择

否则会导致梯度消失和梯度爆炸

少层神经网络，多种选择

卷积神经网络，relu

循环神经网络 relu or tanh·//现在的世界都是relu的天下，或者relu变种函数的天下，或者tanh很少用sigmoid


One-hot vector，独热向量

接下来：对抗网络

CNN：卷积nn 计算机视觉，可以跳过

RNN：循环nn

DNN：深度nn


无监督学习算法

Feld forward learning，Auto encoder//常常通过这个玩意建立深度神经网络
