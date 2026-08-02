---
title: "电机驱动 PCB 布局与布线要点"
date: 2026-08-01 22:09:00
updated: 2026-08-01 22:09:00
description: "覆盖电机驱动 PCB 的接地、散热、功率回路和采样布局；器件原理与电源保护由关联文章维护。"
permalink: hardware/motor-drive-pcb-layout/
categories:
  - 硬件设计
tags:
  - 电机驱动
  - PCB
  - 接地
  - 热设计
  - 电流采样
aliases:
  - 电机驱动板布局
  - 功率 PCB 布线
related_posts:
  - altium-designer-notes
  - analog-filter-design
  - component-selection-parameters
  - motor-drive-power-supply
  - semiconductor-basics
source_docs:
  - "archive/original-posts/电机驱动PCB-翻译总结.md"
review_status: unverified
toc: true
---

电机驱动 PCB 同时面对大电流、高开关频率、热密度和微弱采样信号。本篇按接地、散热、过孔、功率回路和电流采样整理布局布线原则。

<!-- more -->

电机驱动系统主要考虑功率效率、高速开关频率、低噪声与低抖动、紧凑的电路板设计，本文主要介绍热设计，MOS 布局与电流检测电路，主要注意采样电路尽量不受功率电路干扰，并且要考虑 MOS 散热与布局。过孔要注意过流能力与排列间隔，防止导致地电路分割。

## 1、Grounding Optimization
4 种接地方式：

1. 单点接地

所有的负载的地线不共用、不交叉，各自独立走回电源，所有负载接地路径完全独立。

优势：完全隔离不同回路的地噪声，适合大功率回路。

![motor-drive-pcb-layout 插图 1](/images/posts/motor-drive-pcb-layout/001-7185b7c965.png)

2. 星型接地

所有负载的地线汇聚到一个中心->公共地节点，再从这个节点统一接回电源。

优势：统一参考电位，抑制信号回路电位差，MCU，编码器，信号地。

![motor-drive-pcb-layout 插图 2](/images/posts/motor-drive-pcb-layout/002-2ad5b1bf70.png)

3. 区分接地

PCB 板子：功率区、数字区、模拟区各自独立占一块独立区域，不同区域的信号不混走，最后在电源地单点汇合，也就是模拟地有一段区域，数字地有一段区域，两者会汇总在电源地。

![motor-drive-pcb-layout 插图 3](/images/posts/motor-drive-pcb-layout/003-c1195ed765.png)

4. 网格接地

PCB 接地铺铜，整个板子的地连成一个连续、低阻抗的整体，相当于给所有信号都铺了一条最短的回家路。

PCB 的一层设为连续接地层，可让所有信号拥有最短回流路径 ，最小化接地层不连续，过孔分散布局避免接地层断裂。

![公共接地与分割接地层](/images/posts/motor-drive-pcb-layout/004-b0c7d83b4c.png)

## 2、热设计
![芯片散热](/images/posts/motor-drive-pcb-layout/005-ce5c7a11ed.png)

Encapsulated Material：封装塑料

Die：芯片裸片

Bond Wire：芯片与引脚的电气连接

Pad-to-Board Solder Area：焊盘区

Lead：引脚

Thermal Via Area：散热过孔区

主流散热方法：底部金属焊盘->焊接区->散热过孔->PCB 内层铜平面。

![驱动器下方接地覆铜断裂与连续时的温升对比](/images/posts/motor-drive-pcb-layout/006-d58f1edd11.png)

保持驱动器下方的铜质热焊盘连续，是器件高效散热的关键

![直接连接过孔与散热焊盘连接](/images/posts/motor-drive-pcb-layout/007-94998c441d.png)

散热焊盘->十字花焊盘

十字花焊盘也就是焊盘周围铺铜被挖空，改方式可确保回流焊焊接，但不利于热量传递

![推荐过孔布局](/images/posts/motor-drive-pcb-layout/008-a7cf1ce56a.png)

推荐焊盘 7.874mil 孔径 19.874mil 直径   ->最小化焊锡流失，热阻最低。

Thermal Pad Via Array：底部散热焊盘内

Layer Bond Thermal Via Array：芯片外围 PCB 铜箔区

## 3、过孔
![motor-drive-pcb-layout 插图 9](/images/posts/motor-drive-pcb-layout/009-dc415d22eb.png)

1oz 铜厚 PCB 全开窗过孔过流能力。

![过孔导致接地层分割](/images/posts/motor-drive-pcb-layout/010-2af8b0b483.png)

## 4、通用布局技巧
1. 栅极驱动走线应尽量宽和短，至少 20mil 走线
2. 高端栅极信号走线与开关节点走线贴近
3. 禁止直角走线

![motor-drive-pcb-layout 插图 11](/images/posts/motor-drive-pcb-layout/011-6c63fe2a97.png)

4.  过孔向焊盘过渡，引脚从细走线过渡到粗走线时，采用泪滴工艺

![motor-drive-pcb-layout 插图 12](/images/posts/motor-drive-pcb-layout/012-6d9821d852.png)

5. 绕开障碍物时，走线采用并行布线

![motor-drive-pcb-layout 插图 13](/images/posts/motor-drive-pcb-layout/013-ac5bfc8e2b.png)

6. 模拟数字地分离

![motor-drive-pcb-layout 插图 14](/images/posts/motor-drive-pcb-layout/014-e4abd1461f.png)

## 5、电容布局
+ 大容值多过孔

![motor-drive-pcb-layout 插图 15](/images/posts/motor-drive-pcb-layout/015-bb6de0b803.png)

+ 旁路电容与有源器件禁止过孔

![motor-drive-pcb-layout 插图 16](/images/posts/motor-drive-pcb-layout/016-aff30d8633.png)

+ 通常电容尽量靠近有源器件

## 6、MOSFET 布局及布线
+ 常见功率 MOSFET 封装

![TO-252](/images/posts/motor-drive-pcb-layout/017-142d52f314.png)

![motor-drive-pcb-layout 插图 18](/images/posts/motor-drive-pcb-layout/018-e56d9276d0.png)

![TO-220](/images/posts/motor-drive-pcb-layout/019-78674e5704.png)

![motor-drive-pcb-layout 插图 20](/images/posts/motor-drive-pcb-layout/020-6374300c6d.png)

![SOP-8](/images/posts/motor-drive-pcb-layout/021-310d451911.png)

![motor-drive-pcb-layout 插图 22](/images/posts/motor-drive-pcb-layout/022-6b71506866.png)

+ MOSFET 布局

![半桥堆叠](/images/posts/motor-drive-pcb-layout/023-0eda526078.png)

![半桥并排](/images/posts/motor-drive-pcb-layout/024-87eb2105d6.png)

![开关节点寄生参数](/images/posts/motor-drive-pcb-layout/025-43cbbe580a.png)

![电压过冲波形](/images/posts/motor-drive-pcb-layout/026-b62820789c.png)

开关节点振铃->LC 震荡->开关节点过冲/下冲电压->最小化长度，最大化连接铜层宽度，小寄生电感 MOSFET

![典型布局-大电流粗布线](/images/posts/motor-drive-pcb-layout/027-8ee70148af.png)

+ 高端电流检测引脚-VDRAIN

电流采样仅引从 DRAIN 铜箔引出一根线，可使用 NET-TIE 器件来实现单点连接

![motor-drive-pcb-layout 插图 28](/images/posts/motor-drive-pcb-layout/028-99af522cbb.png)

## 7、电流检测放大器布线
![三种电流采样方式](/images/posts/motor-drive-pcb-layout/029-6e55dfc3e9.png)

+ high-side current sense：直接检测电源电流，可检测负载短路，不受地电位干扰，高共模电压
+ Low-Side Current Shunt：低共模电压，地干扰，无法检测接地短路
+ 相电流采样：共模电压低，单独每相采样，精度高，需软件计算总电流。

+ 采样电阻设计：采样电压与电阻功耗平衡，一般电阻 —— 几毫欧
+ 布线建议：电阻两端差分布线引出

![motor-drive-pcb-layout 插图 30](/images/posts/motor-drive-pcb-layout/030-5f43e89d68.png)

如图必须采用卡尔文连接，采样芯片通过一段较细电路连接至采样电阻两端，而非直接和 GND 或者 MOS 源极相连，可以使用 Net-Tie 工具。
