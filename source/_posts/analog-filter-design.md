---
title: "模拟滤波器设计：参数、Sallen-Key 与 MFB"
date: 2026-08-01 22:07:00
updated: 2026-08-01 22:07:00
description: "覆盖模拟滤波器指标、Sallen-Key 与 MFB 设计；控制算法中的低通离散化由 PMSM 控制基础文章维护。"
permalink: hardware/analog-filter-design/
categories:
  - 硬件设计
tags:
  - 模拟滤波器
  - Sallen-Key
  - MFB
  - 运算放大器
aliases:
  - 有源滤波器
  - Sallen-Key 滤波器
  - MFB 滤波器
related_posts:
  - pmsm-control-basics
  - motor-drive-pcb-layout
source_docs:
  - "archive/original-posts/滤波器设计.md"
review_status: unverified
toc: true
---

本文从截止频率、品质因数和响应类型入手，整理 Sallen-Key 与多重反馈（MFB）有源滤波器的拓扑、计算关系和器件选择要点。

<!-- more -->

**【数字时代还需要学习模拟滤波器设计吗？滤波器是怎么设计出来的？】**[**https://www.bilibili.com/video/BV1MA4m1L72c?vd_source=aca1ede7fcbd3c2ebbaa4b638f88f631**](https://www.bilibili.com/video/BV1MA4m1L72c?vd_source=aca1ede7fcbd3c2ebbaa4b638f88f631)

## 1、滤波器参数
![analog-filter-design 插图 1](/images/posts/analog-filter-design/001-c8f01aa0d4.png)

类型:低通；高通；带通；带阻；全通

增益： 通带内增益（0dB、10dB…）

阶数：阶数越高，滤波越陡

1 阶：-20db

2 阶：-40db

通道频率：

截止频率 fc：

阻带衰减  ： 截止频率时的衰减强度；

品质因数 Q:较小比较好

相位延迟：电机电流采样相位延迟需要较小

共模抑制：

运算放大器的核心参数：单位增益带宽（GBW）

一般情况下，带宽*增益=常数；对于低频滤波，必须在截至之前，增益够大才能负反馈；GBW>10*闭环增益*最大工作频率

+ **Q 小（如 < 0.707）**：幅频响应曲线圆钝、平缓，通带内没有凸起，相位线性度好。 响应**过冲小，无振铃**，波形平滑。Q 值越小，响应越平缓
+ **Q = 0.707**：这是巴特沃斯（Butterworth）滤波器的标准值，通带 “最大平坦”。 响应有轻微过冲（约 4.3%），是临界阻尼状态。
+ **Q 大（如 > 0.707）**：幅频响应会出现一个明显的 “峰值”，即通带内产生波纹（如切比雪夫 Chebyshev 滤波器），同时阻带衰减更陡峭。 响应会出现明显的**过冲和振铃**，Q 值越大，震荡越剧烈，恢复到稳态的时间越长。

滤波器设计：

## 2、主流滤波器类型
![analog-filter-design 插图 2](/images/posts/analog-filter-design/002-ec474530ce.png)

## 3. Sallen-Key 拓扑

参考资料：[https://blog.csdn.net/weixin_42837669/article/details/127375511](https://blog.csdn.net/weixin_42837669/article/details/127375511)
![analog-filter-design 插图 3](/images/posts/analog-filter-design/003-7e3968050b.png)

**sk 拓扑可以设计不同类型滤波器,以低通设计为例子**

![analog-filter-design 插图 4](/images/posts/analog-filter-design/004-8fa67026ac.png)

低通滤波

![analog-filter-design 插图 5](/images/posts/analog-filter-design/005-f5da488c39.png)

![analog-filter-design 插图 6](/images/posts/analog-filter-design/006-36d73fb8b5.png)

![analog-filter-design 插图 7](/images/posts/analog-filter-design/007-a945fb0445.png)

![analog-filter-design 插图 8](/images/posts/analog-filter-design/008-7b5cb74f59.png)

![analog-filter-design 插图 9](/images/posts/analog-filter-design/009-2be258931b.png)

![analog-filter-design 插图 10](/images/posts/analog-filter-design/010-24e1c729b2.png)

![analog-filter-design 插图 11](/images/posts/analog-filter-design/011-f870bcdc2c.png)

![analog-filter-design 插图 12](/images/posts/analog-filter-design/012-2376edf504.png)

![analog-filter-design 插图 13](/images/posts/analog-filter-design/013-a2c28098e5.png)

## 4、MFB多反馈滤波器
低通滤波

![analog-filter-design 插图 14](/images/posts/analog-filter-design/014-d8be388d38.png)

![analog-filter-design 插图 15](/images/posts/analog-filter-design/015-b442860f38.png)

![analog-filter-design 插图 16](/images/posts/analog-filter-design/016-52d02241cc.png)

![analog-filter-design 插图 17](/images/posts/analog-filter-design/017-815eb7841a.png)
