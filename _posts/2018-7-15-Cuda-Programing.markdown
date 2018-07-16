---
layout:     post
title:      "Programing using CUDA & Geometry"
subtitle:   "Solve problems with thousands of Cpus"
date:       2018-07-15 22:48:00
author:     "xu"
header-img: "img/in-post/cuda-programing/head.jpg"
header-mask: 0.3
catalog:    true
tags:
    - CUDA
---

CUDA编程哈，第一次接触，关于gpu的使用问题，以及几何学


render 渲染
meshing
calling
compactions 压缩
transform_reduce map_reduce map:映射 reduce：规约

GPU编程的目的应该是将一个问题转换成数千个流处理器能并行处理的方法然后利用GPU的硬件特性处理问题

cpu和gpu的配合解决问题，solve problems in bottom of whole computer system


cuda程序分为kenerl和host

kenel是一个核函数，应该是具体的业务处理啥的，或者就是功能函数，反正它由GPU运算

host是主机，也就是kenel的负载，就是说是一个上层的管理，main 函数，由CPU运行
就像CPU instructing GPU to do an assignment (kernel) 

cpu在global memory中放进了全部的工作，每一个GPU流处理器从GM中选择自己的工作数据，按照kernel处理，然后返回global memory，最后由CPU收走global memory中的所有数据

在编程中用的malloc函数有两种，一个是在显存中取，一个是在内存中取，得到了两种交互

只有一个block中的thread才能相互对话，（shared memory）

一个业务功能可以分为N个kernel函数由不同grid的来处理,每个grid中有很多的block
不同的block可以在globalmemory中存取，也算是一种talk to each other

design goals：
>focus in 

不同的grim，block，thread 的坐标可以用1，2，3 dimension来标识，

在编程中最关键用变量表示符号定义不同存储空间中的变量，这样就控制了分层处理机制


在每一个pixl中控制像素点，得到像素点的ID，然后控制它们

画了projct3的点，方块，颜色分割，不知道在干什么……好像是在计算O()……是，计算为O（n^2 m）,通过gpu编程，并行处理每一个像素点，我们可以把时间复杂度降低为O（n^2m/the unmber of gpus processor SM）

每32个thread封装在一起，叫做一个SIMT warp，也不知道是什么啊

regist 是最快的记忆体

然后估计以后的项目将是一个用thrust做的项目

thrust：Scan Reduce

67页，真的没听懂