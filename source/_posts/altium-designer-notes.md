---
title: "Altium Designer 原理图与 PCB 使用笔记"
date: 2026-08-01 22:05:00
updated: 2026-08-01 22:05:00
description: "覆盖 Altium Designer 原理图库、原理图和 PCB 编辑操作；电机功率板布局规范由独立文章维护。"
permalink: tools/altium-designer-notes/
categories:
  - 开发工具
tags:
  - Altium Designer
  - 原理图
  - PCB
aliases:
  - AD
  - Altium
  - AD 原理图与 PCB
related_posts:
  - motor-drive-pcb-layout
  - component-selection-parameters
review_status: unverified
toc: true
---

本文整理 Altium Designer 中原理图库、原理图和 PCB 的常用操作，重点覆盖引脚与封装关联、ERC/DRC、板层、丝印和板框等容易遗漏的环节。

<!-- more -->

## 项目组成

一个完整项目通常包含原理图、PCB、原理图库和 PCB 封装库四类核心文件。

## 原理图库
AD（Altium Designer）元件符号必须包含**图形主体、引脚定义、核心属性、关联封装、电气/仿真信息**五大类信息，以确保原理图逻辑清晰、与PCB/生产/仿真完全匹配。

### 一、图形主体（视觉表达）
+ **标准符号轮廓**：遵循 IEEE 315 规范，如电阻矩形、电容平行线、运放三角形、IC矩形框。
+ **极性/功能标记**：二极管箭头、电解电容+/-、三极管箭头、MOSFET衬底箭头、晶振波浪线等。
+ **多单元拆分**：如 74HC00 拆为 4 个与非门（Part A/B/C/D），电源引脚可全局隐藏。

### 二、引脚定义（电气连接核心）
每个引脚必须包含：

1. **引脚编号（Number）**：与实物管脚、PCB 封装焊盘号**严格一一对应**（必填）。
2. **引脚名称（Name）**：功能名（如 VCC、GND、SDA、PA0、OUT），可隐藏但必须正确。
3. **电气类型（Electrical Type）**：Input/Output/Power/Passive/Open Collector 等，用于 DRC 检查。
4. **引脚长度/方向**：标准 100mil，编号朝外、名称朝内；可设置隐藏（如全局电源）。

### 三、核心属性（标识与描述）
+ **Designator（位号）**：唯一标识符，如 R?、C?、U?、J?（必填，自动编号用）。
+ **Comment（注释/值）**：阻值 10k、容值 0.1μF、型号 ATmega328P、LED 等（必填）。
+ **Description（描述）**：功能说明，如“双运放、轨到轨”。
+ **Component Name（库内名称）**：如 RES、CAP、LM358（库内唯一）。

### 四、关联封装与生产信息（原理图→PCB 桥梁）
+ **Footprint（封装）**：如 0805、SOIC-8、DIP-16、SOT-23（必须与引脚编号匹配）。
+ **Link（厂商和联系方式）**。
+ **其他参数**：功率、耐压、精度、温度等级等（按需添加）。

### 五、电气/仿真/高级信息
+ **隐藏电源/地**：VCC、GND 设为全局网络（Power Port），简化图纸。
+ **仿真模型链接**：SPICE 子电路、IBIS 模型路径（仿真用）。
+ **3D 模型关联**：STEP 文件（3D 预览用）。
+ **设计规则（DRC）**：引脚电气类型、网络约束。

## 原理图操作
### 1. Compiler Off Grid：电气栅格未对齐
右键→对齐→对齐到栅格上

### 2. 引脚悬空
放置→指示→通用 No_ERC

防止报错

### 3. 原理图接线角度切换
切换：shift+space

### 4. 标注 Designator
工具-标注-原理图标注

标注类型：

| **R** | Resistor「电阻」 |
| :--- | :--- |
| **C** | Capacitor「电容」 |
| **U** | IC/Integrated Circuit「集成电路」 |
| **D** | Diode「二极管」 |
| **Q** | Transistor「晶体管」 |
| **J** | Connector/Jumper「连接器 / 接插件」 |
| **L** | Inductor「电感」 |
| **F** | Fuse「保险丝」 |

### 5. X/Y 方向移动
M

## PCB 操作
### 1. 清除 PCB 测量标记
 	SHIFT+C

### 2. PCB 各层
| **Mechanical ** | 机械层  | 用于标注尺寸、工艺说明、板框、定位孔 |
| :--- | :--- | :--- |
| **Top Overlay** | 顶层丝印层 | 放置元件位号（R1/C2/U3）、元件轮廓 |
| **Bottom Overlay** | 底层丝印层 | 底层元件的丝印、位号、标识 |
| **Top Paste** | 顶层锡膏层 | 生成 SMT 贴片钢网，控制焊盘上锡量 |
| **Bottom Paste** | 底层锡膏层 | 底层贴片元件的钢网开口 |
| **Top Solder** | 顶层阻焊层 | 阻焊绿油层， |
| **Bottom Solder** | 底层阻焊层 | 底层阻焊绿油层 |
| **Drill Guide** | 钻孔引导层 | 生成钻孔位置、孔径的参考图 |
| **Keep-Out Layer** | 禁止布线层 | 定义 PCB 板框、禁止布线 |
| **Drill Drawing** | 钻孔图层 | 汇总所有钻孔的孔径、数量、位置 |
| **Multi-Layer** | 多层 | 贯穿所有层，用于通孔焊盘、过孔 |

### 3. X/Y 方向移动
选中，按 M

### 4. 单层与多层显示
shift+s

### 5. 丝印裁剪
丝印不能放到焊盘上

编辑-移动-打断走线

### 6. 3D 视图旋转
panels-View_Configuration-3D

shift+鼠标右键：旋转

Ctrl+鼠标右键：放大缩小

鼠标右键：移动

### 7. 从设计生成 PCB 库
设计-生成 PCB 库

### 8. 使用封装管理器检查封装
工具-封装管理器

### 9. 更新原理图库
修改了原理图库之后->更新到原理图 ->

工具-从库更新

![altium-designer-notes 插图 1](/images/posts/altium-designer-notes/001-7d12c0486a.png)

 图形属性：原理图里元件的**图形、引脚、线、形状**

 更新参数: 元器件参数

 更新模型: PCB 封装->footprint

### 10. 矩形器件摆放
全选器件-工具-器件摆放

### 11. PCB 板框
画线->设计-板子形状

### 12. 设置原点
EOS

### 13. 绘制板框尺寸
放置-尺寸-线性尺寸

space 纵横切换

### 14. 多层板层叠设置
d-k

core->中间层两边都是铜箔

prepreg->两层没有铜箔

plane->负极片->铜覆盖所有，画线去铜

signal->正极片
