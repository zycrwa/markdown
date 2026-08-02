---
title: "嵌入式基础：GPIO 输出、Keil 工程与自举电荷泵"
date: 2026-08-01 22:02:00
updated: 2026-08-01 22:02:00
description: "覆盖 GPIO 输出模式、Keil 工程结构和自举电荷泵；通信协议与 STM32 实现由关联文章维护。"
permalink: embedded/embedded-system-basics/
categories:
  - 嵌入式开发
tags:
  - GPIO
  - Keil
  - 电荷泵
aliases:
  - GPIO 输出模式
  - Keil 工程结构
  - 自举电荷泵
related_posts:
  - embedded-communication-protocols
  - stm32-clion-development
  - motor-drive-power-supply
source_docs:
  - "archive/original-posts/嵌入式基础知识.md"
review_status: unverified
toc: true
mathjax: true
---

本文整理三个常见但彼此独立的嵌入式基础主题：GPIO 推挽与开漏输出、Keil 工程目录结构，以及半桥高侧驱动使用的自举电荷泵。

<!-- more -->

## 1、推挽输出和开漏输出
![推挽输出](/images/posts/embedded-system-basics/001-f1bdd24789.png)![开漏输出](/images/posts/embedded-system-basics/002-c0ffdd4372.png)

| 特性 | 推挽输出 (PP) | 开漏输出 (OD) |
| :--- | :--- | :--- |
| **高电平来源** | **内部电源** (VCC) | **外部上拉电源**  |
| **低电平** | 接近 0V | 接近 0V |
| **电压转换** | 固定输出VCC电平 | 可灵活适配，上拉电源决定高电平 |
| **优势** | 速度快，驱动强 | **支持电平转换** (3.3V连5V) |
| **劣势** | 不可直接线与 | 速度慢，必须加上拉电阻 |

## 2、Keil 工程下的文件解析
```c
D:.
│  Clean.bat
│
├─Main
│      main.c
│      startup_stm32f10x_hd.s
│
└─Project
    │  EventRecorderStub.scvd
    │  lesson.uvguix.weidongshan
    │  lesson.uvoptx
    │  lesson.uvprojx
    │
    ├─DebugConfig
    │      lesson1_STM32F103ZE_1.0.0.dbgconf
    │      lesson_STM32F103ZE_1.0.0.dbgconf
    │
    ├─Listings
    │      lesson1.map
    │      startup_stm32f10x_hd.lst
    │
    └─Objects
            lesson1.axf
            lesson1.build_log.htm
            lesson1.hex
            lesson1.htm
            lesson1.lnp
            lesson1.sct
            lesson_lesson.dep
            main.crf
            main.d
            main.o
            startup_stm32f10x_hd.d
            startup_stm32f10x_hd.o
```

一、根目录文件

| 文件 | 类型 | 核心作用 | 新手是否需要关注 |
| --- | --- | --- | --- |
| `Clean.bat` | 批处理脚本 | 一键清理编译产物（Objects/Listings里的.axf/.o/.lst等），相当于Keil的「Clean」按钮，双击即可执行，不用手动删文件 | 🌟 推荐关注：清理工程超方便 |

二、Main目录（源码核心）

| 文件 | 类型 | 核心作用 | 新手是否需要关注 |
| --- | --- | --- | --- |
| `main.c` | C源码文件 | 你的业务代码入口（main函数、my_malloc、a_fun等逻辑都在这里），是整个工程的“核心逻辑文件” | 🌟🌟🌟 必须关注：所有功能代码都写在这里 |
| `startup_stm32f10x_hd.s` | 汇编启动文件 | MCU上电后执行的第一个文件，核心作用：   1. 初始化栈/堆（对应你之前问的堆栈）；   2. 初始化中断向量表；   3. 最终跳转到main函数执行；   （`hd`代表“高密度”，适配STM32F103ZE这类大Flash芯片） | 🌟 了解即可：不用修改，缺了工程编译失败 |

三、Project目录（Keil工程配置+编译产物）

1. Keil工程核心配置文件

| 文件 | 类型 | 核心作用 | 新手是否需要关注 |
| --- | --- | --- | --- |
| `lesson.uvprojx` | Keil工程文件 | 工程的核心配置文件（XML格式），记录：   1. 选中的芯片型号（STM32F103ZE）；   2. 包含的源码文件（main.c/启动文件）；   3. 编译选项（优化等级、栈堆大小）；   4. 调试器配置（ST-Link/J-Link） | 🌟🌟🌟 必须关注：双击打开整个工程，丢了就需要重建 |
| `lesson.uvoptx` | Keil工程选项文件 | 记录你的个性化配置：   1. 窗口布局（比如你习惯的调试窗口位置）；   2. 断点位置；   3. 最近打开的文件 | 🌟 关注即可：丢了只会重置布局，不影响编译 |
| `lesson.uvguix.weidongshan` | Keil用户配置文件 | 针对当前Windows用户（weidongshan）的GUI配置，比如字体、颜色、快捷键 | ❌ 无需关注：自动生成，删了会重新创建 |
| `EventRecorderStub.scvd` | 事件记录器配置 | Keil的调试辅助文件，用于记录程序运行事件（比如函数调用），新手用不到 | ❌ 无需关注：默认生成，可直接删 |

2. DebugConfig目录（调试配置）

| 文件 | 类型 | 核心作用 | 新手是否需要关注 |
| --- | --- | --- | --- |
| `lesson1_STM32F103ZE_1.0.0.dbgconf` | 调试配置文件 | 记录调试器的具体参数：   1. 芯片的调试接口（SWD/JTAG）；   2. Flash烧录算法；   3. 调试时的时钟配置 | 🌟 了解即可：Keil自动生成，调试异常时可删除重建 |

3. Listings目录（编译清单文件）

| 文件 | 类型 | 核心作用 | 新手是否需要关注 |
| --- | --- | --- | --- |
| `lesson1.map` | 链接映射文件 | 工程的“内存地图”，核心信息：   1. 每个函数/变量的内存地址（比如main函数在0x08000100）；   2. 代码/数据占用的Flash/RAM大小（对应你之前看到的Code=392 RO-data=24）；   3. 栈/堆的起始地址 | 🌟🌟 推荐关注：排查内存溢出、变量地址错误时必备 |
| `startup_stm32f10x_hd.lst` | 汇编清单文件 | 启动文件的反汇编代码，显示每一行汇编指令对应的机器码和地址 | ❌ 新手无需关注：仅底层调试时用 |

4. Objects目录（编译产物，可烧录/调试的核心）

| 文件 | 类型 | 核心作用 | 新手是否需要关注 |
| --- | --- | --- | --- |
| `lesson1.axf` | 可执行文件（ELF格式） | Keil调试的核心文件：   1. 包含代码、数据、调试信息；   2. 调试器（ST-Link）通过它加载程序、查看变量（你之前buf看不到就是这个文件里没保留调试信息） | 🌟🌟 必须关注：调试时依赖它，编译成功才会生成 |
| `lesson1.hex` | 十六进制烧录文件 | 可直接烧录到MCU Flash的文件（纯二进制数据，去掉了调试信息）：   1. 用ST-Link Utility、串口下载工具都能烧；   2. 是最终烧到芯片里的文件 | 🌟🌟🌟 必须关注：工程最终产出的可执行文件 |
| `lesson1.build_log.htm` | 编译日志文件 | HTML格式的编译记录，包含：   1. 编译时间、编译器版本；   2. 错误/警告信息；   3. 代码/数据占用大小 | 🌟 关注即可：编译出错时可打开看详细日志 |
| `lesson1.htm` | 工程报告文件 | 汇总工程的配置、编译结果、内存占用，和build_log类似，格式更友好 | ❌ 无需关注：自动生成，可删 |
| `lesson1.lnp` | 链接器参数文件 | 记录传给链接器的参数（比如链接脚本路径、库文件路径） | ❌ 无需关注：Keil自动生成 |
| `lesson1.sct` | 分散加载文件（链接脚本） | 定义MCU的内存布局：   1. Flash的起始地址（0x08000000）、大小；   2. RAM的起始地址（0x20000000）、大小；   3. 栈/堆的大小和位置（对应你之前问的堆栈配置） | 🌟🌟 推荐关注：修改栈堆大小、内存分区时要改它 |
| `lesson_lesson.dep` | 依赖文件 | 记录文件之间的依赖关系（比如main.c依赖stdlib.h），编译时判断哪些文件需要重新编译 | ❌ 无需关注：自动生成 |
| `main.o` / `startup_xxx.o` | 目标文件 | 单个源码文件编译后的产物：   1. main.c → main.o；   2. 启动文件 → startup_xxx.o；   链接器会把所有.o文件合并成.axf/.hex | ❌ 新手无需关注：编译中间产物，可删 |

## 3、电荷泵
![embedded-system-basics 插图 3](/images/posts/embedded-system-basics/003-8d505966f0.png)

阶段1：充电阶段（Q1、Q2闭合，Q3、Q4断开）

+ 电流路径：$ V_{IN} \rightarrow Q1 \rightarrow C_1 \rightarrow Q2 \rightarrow GND $
+ 电容 ($ C_1 $) 被充电至 ($ V_{IN} $)，上极板带正电，下极板带负电
+ 此时输出电容 ($ C_O $) 维持之前的输出电压

阶段2：转移阶段（Q3、Q4闭合，Q1、Q2断开）

+ 电流路径：($ V_{IN} \rightarrow Q4 \rightarrow C_1 \rightarrow Q3 \rightarrow C_O $)
+ 电容 ($ C_1 $) 被**反向串联**在 ($ V_{IN} $) 和输出之间
+ 输出电压叠加为
$ V_O \approx V_{IN} + V_{C1} = 2V_{IN} $
+ 电荷从 ($ C_1 $) 转移到 ($ C_O $)，为负载供电

![embedded-system-basics 插图 4](/images/posts/embedded-system-basics/004-906b2651b1.png)

1. 充电阶段（LS-FET导通，HS-FET关断）

+ SW节点被拉到**地电位（0V）**
+ 电流路径：$ Vin \rightarrow D1 \rightarrow C1 \rightarrow SW(GND) $
+ 自举电容 (C1) 被充电至 ($ V_{C1} \approx Vin - V_{D1} $)
+ 此时BST引脚电压为 ($ V_{BST} \approx Vin - V_{D1} $)

2. 驱动阶段（HS-FET导通，LS-FET关断）

+ SW节点被抬升至**Vin**
+ 自举电容 (C1) 两端电压保持不变（电容特性），因此：
$ V_{BST} = V_{SW} + V_{C1} \approx Vin + (Vin - V_{D1}) $
+ HS Driver利用BST引脚的高电压，驱动HS-FET栅极，保证 (V_{GS}) 足够大，使HS-FET完全导通

纯在不同模式的电荷泵，这种没有办法 100 导通，但是有一些单独电荷泵可以一直高电压。
