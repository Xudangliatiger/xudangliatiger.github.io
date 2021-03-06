---
layout:     post
title:      "计算机网络的学习"
subtitle:   "缘分是一张网，将世人缠绕，却不让他们拥抱"
date:       2018-03-10 18:00:00
author:     "xu"
header-img: "img/in-post/post-how-2-computernetworking/head.jpg"
header-mask: 0.3
catalog:    true
tags:
    - 计算机网络
---
## 课本参考：
第一本是不知道那个地方的很薄的国内课本，计算机网络，是委托蒋蒋在清水寺借的，很薄，讲了个大概，我只拿来看懂了计算机网络这门课的知识结构，另外一个成都信息工程大学的学长给我指点了考试重点，我大致明白了这门课的授课目的，以后对于上课和考试的把握应该会大一点吧...
<br>
第二本是回学校的第二天借的，计算机网络自顶向下方法（computer networking a top-down approach）
<br>
Approach应该是学习方法吧...窃以为这是和自顶向下设计那本书的区别...
由于这本书关键是从应用层开始讲的，所以学起来比香港记者还要快
<br>
第三本是 TCP/IP协议原理与应用.这个我打算做补充，哪儿不懂查哪儿，慢慢就学了很多。


  尤其注意一点，对于CS专业的同学来说，接触到很多的就是应用层的各种协议，可以说是应用层是一个计算机同学来理解计算机网络的根本的东西。
  <br>在自顶向下这本书里面也是应用层为首要目标。<br>
下课问了老师一句，是不是考试更突出应用层。
老师说不是，这门课主要教学大纲并没有把应用层放到很重要的地方，而是把整个网络的实现的架构，包括底层的东西，硬件的东西看的更重要。
我估摸着，tcp/ip是重点。还有很多疑问，等等问老师，慢慢更新



## 应用层：
关于http（s），这个协议请求很多（request），目前操作过的：
Post提交一个表单（form），有在几种地方提交的，比如URL链接后面再跟一串字符，但是肯定不安全，所以是要
```
<div class="margin-bottom-30">
           <div class="anchor">
             <a name="3" class="uncolor"></a>
           </div>
   		<div class="headline">
   		   <h3>js提交form表单</h3>
   		</div>
   		<div class="row">
   			<div class="col-xs-12">
   				<p>js事件触发表单提交，通过button、链接等触发事件，js调用submit()方法提交表单数据，jquery通过submit()方法
                 </p>
                 <pre>&lt;form id="form" action="/url.do" method="post"&gt;
      &lt;input type="text" name="name"/&gt;
   &lt;/form&gt;
                 </pre>
                   <p>js: document.getElementById("form").submit();<br>
                   jquery: $("#form").submit();
     </p>
   			</div>
   		</div>
   	</div>
```
	


## 运输层
> tcp是面向链接的运输，是一种全双工的工作模式，三次握手建立连接，四次握手释放连接

## 网络层
7
## 链路层
链路，就是连接两台通信主机的物理线路。链路层是指一个节点到另一个节点的过程中的那一层，emmm，包括你的网卡，交换机和路由器，以及各色服务器

>**链路层的基本概念**
>> 帧

在链路层被我们传输的“旅客”的单位叫做帧。<br>

>> 链路分类：

* 点对点链路:协议有点对点协议ppp，高级数据链路控制
* **广播链路**：例子有**以太网**和**无线LAN**

>> 链路层提供的服务：

* 成帧
* 链路接入
* 可靠交付：（通过确认和重传实现，但是一般只是在无线链路容易出错的地方使用，在光纤同轴电缆等不提供可靠交付的服务。是指在链路传输时纠正错误，而不是在应用层或者传输层tcp等发现错误再重传）<br>
注意：**在无线lan提供可靠交付，但是在以太网上面不提供可靠交付**
* 流量控制：由于每一个链路层的节点都有一个很小容量的帧缓存能力（想一想小米路由器的广告，强调了路由器有一个大缓存...真狂牛），那么当该节点接受的过多，传出的过少，就会导致缓存区移除，造成帧的丢失。由此控制流量，防止发生此类事故
* 差错检测和纠正，坑待填，注意在现今手段下**仍旧能出现未检出比特差错**。（传输过程中的常见三种检测差错的技术：奇偶校验是基本方法，校验和方法应用于传输层，循环冗余检测用于适配器中的链路层）
* 半双工和全双工传输，都有

>> 链路层的服务主要是在网卡实现（PC上面）

网卡提供服务有:成帧、链路接入、流量控制、差错检查等

>> 链路层的协议：

* 点对点协议（ppp，point2point protocol）
* 高级数据链路控制（Highlevel Data Link Control ）
* 如以太网协议
* 802.11WiFi协议

> 链路层的差错检测和纠错技术

巨坑待填

> 链路层的协议详解之多路访问协议

  以太网和无线LAN协议就是广播链路协议，现在来讨论它们实现的一个基本问题：多路访问
  * 信道划分协议
  * 随机接入协议
  * 轮流协议

  巨坑待填

> 链路层的编址

链路层的编址主要是mac地址，而mac地址是节点的适配器具有的链路层地址


<br>

> 以太网——最常见链路

是一个部署最广泛的LAN网。<br>
涉及到交换机，路由器，巨坑待填<br>
* 提供无连接服务，与udp差不多
* **向网路层提供不可靠服务**，它会校验帧，却不能要求重传帧，只会丢弃帧




> 链路层的交换机

交换机是星型拓扑结构的中间点，是一种更加智能的集线器

* 即插即用
* 本身透明，只向上负责到链路层
*
>> 路由器是链路层节点，同时也是网络层节点，所以信息也是会进入路由器的网络层，估计就是ip协议啥子的

> ppp——研究了这么久广播链路，现在来看一下点对点链路

> ATM——常常出现的异步传输网络，与ipv6有关