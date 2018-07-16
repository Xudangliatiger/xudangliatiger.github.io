---
layout:     post
title:      "Programing using CUDA & Geometry"
subtitle:   "Solve problems with thounds of Cpus"
date:       2018-07-15 22:48:00
author:     "xu"
header-img: "img/in-post/cuda-programing/head.jpg"
header-mask: 0.3
catalog:    true
tags:
    - CUDA
---

CUDA编程哈，第一次接触，关于gpu的使用问题，以及几何学

cuda程序分为kenerl和host

kenel是一个核函数，应该是具体的业务处理啥的，或者就是功能函数，反正它由GPU运算

host是主机，也就是kenel的负载，就是说是一个上层的管理，main 函数，由CPU运行

render 渲染
meshing
calling
compactions 压缩
transform_reduce map_reduce map:映射 reduce：规约

GPU编程的目的应该是将一个问题转换成数千个流处理器能并行处理的方法然后利用GPU的硬件特性处理问题

cpu和gpu的配合解决问题，solve problems in bottom of whole computer system