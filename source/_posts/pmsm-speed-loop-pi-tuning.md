---
title: "PMSM 转速环 PI 参数整定推导"
date: 2026-08-01 22:14:00
updated: 2026-08-24 19:56:00
description: "覆盖带有功阻尼的 PMSM 转速环 PI 推导；电流环、完整电机模型、反馈估计和代码实现由关联文章维护。"
permalink: motor-control/pmsm-speed-loop-pi-tuning/
categories:
  - 电机控制
tags:
  - PMSM
  - PI 控制
  - 转速环
  - 有功阻尼
aliases:
  - 转速环 PI
  - 速度环参数整定
  - PMSM 速度环
related_posts:
  - pmsm-control-basics
  - dengfoc-control-code
  - three-phase-pmsm
  - motor-embedded-software-roadmap
  - encoder-pll-speed-estimation
source_docs:
  - "archive/original-posts/转速环PI参数整定.md"
review_status: unverified
toc: true
mathjax: true
---

本文在电流环近似理想、采用 $i_d=0$ 控制的前提下，推导带有功阻尼反馈的 PMSM 转速环 PI 参数，并给出闭环验证和工程整定顺序。

<!-- more -->

## 一、推导前提与核心假设
1. **电流环带宽远高于转速环**：忽略电流环动态，电流环传递函数近似为 $ 1 $，q轴电流指令可瞬时跟踪。
2. **解耦控制策略**：$ i_d=0 $，转矩仅由 $ i_q $ 决定；空载条件 $ T_L=0 $。
3. **有功阻尼电流引入**：最终作用于电机的q轴电流

$ i_q = i_q' - B_s\omega_m $

式中：$ i_q' $ 为转速环PI控制器输出指令；

   $ B_s $ 为有功阻尼系数；

4. **开环传递函数目标**：设计转速环**开环传递函数为 **$ \frac{\beta}{s} $，结合单位负反馈，得到期望闭环传递函数

$ \frac{\omega_m(s)}{\omega_m^*(s)}=\frac{\beta}{s+\beta} $

## 二、核心方程推导
### 1.  转速动态微分方程
根据电机机械运动方程和电磁转矩公式，代入 $ i_d=0 $、$ T_L=0 $，得到修正后转速动态方程：

$ \frac{d\omega_m}{dt}=\frac{1.5p_n\psi_f}{J}i_q'-\left(\frac{1.5p_n\psi_f B_s+B}{J}\right)\omega_m $

定义**转矩系数** $ K_t=1.5p_n\psi_f $，方程简化为

$ \frac{d\omega_m}{dt}=\frac{K_t}{J}i_q'-\frac{K_t B_s+B}{J}\omega_m $

式中参数含义：

| 参数 | 含义 |
| --- | --- |
| $ J $ | 电机+负载总转动惯量 |
| $ \omega_m $ | 电机机械角速度 |
| $ p_n $ | 电机极对数 |
| $ \psi_f $ | 永磁体磁链 |
| $ B $ | 电机机械阻尼系数 |

### 2.  转速动态方程的拉普拉斯变换
对动态方程做拉普拉斯变换：

$ s\omega_m(s)=\frac{K_t}{J}i_q'(s)-\frac{K_t B_s+B}{J}\omega_m(s) $

整理得**电机环节传递函数**（输入 $ i_q'(s) $，输出 $ \omega_m(s) $）：

$ G_m(s)=\frac{\omega_m(s)}{i_q'(s)}=\frac{\frac{K_t}{J}}{s+\frac{K_t B_s+B}{J}} \tag{1} $

### 3.  转速环PI控制器传递函数
转速环采用PI控制器，输入为转速误差 $ \Delta\omega=\omega_m^*(s)-\omega_m(s) $，输出为 $ i_q'(s) $，PI控制器传递函数：

$ G_{PI}(s)=K_{P\omega}+\frac{K_{I\omega}}{s}=\frac{K_{P\omega}s+K_{I\omega}}{s} \tag{2} $

式中：$ K_{P\omega} $ 为比例系数；$ K_{I\omega} $ 为积分系数。

## 三、开环传递函数构建与匹配
### 1.  转速环开环传递函数定义
转速环采用**单位负反馈**结构，开环传递函数为PI控制器与电机环节的串联：

$ G_{open}(s)=G_{PI}(s) \cdot G_m(s) $

将式(1)、(2)代入，得

$ G_{open}(s)=\frac{K_{P\omega}s+K_{I\omega}}{s} \cdot \frac{\frac{K_t}{J}}{s+\frac{K_t B_s+B}{J}} \tag{3} $

### 2.  开环传递函数目标匹配
我们的核心设计目标是：**让开环传递函数等于 **$ \frac{\beta}{s} $，即

$ G_{open}(s)=\frac{\beta}{s} \tag{4} $

要满足式(4)，需让式(3)的分子分母满足**极点零点抵消+系数匹配**，分两步实现：

#### 步骤1： 零点极点抵消
观察式(3)的分母存在极点 $ s=-\frac{K_t B_s+B}{J} $，分子存在零点 $ s=-\frac{K_{I\omega}}{K_{P\omega}} $。
为了让传递函数简化为 $ \frac{\beta}{s} $，必须让**分子零点抵消分母的实极点**，即

$ -\frac{K_{I\omega}}{K_{P\omega}} = -\frac{K_t B_s+B}{J} $

整理得约束条件1：

$ K_{I\omega}=K_{P\omega} \cdot \frac{K_t B_s+B}{J} \tag{5} $

#### 步骤2： 系数匹配
零点极点抵消后，式(3)简化为

$ G_{open}(s)=\frac{K_{P\omega} \cdot \frac{K_t}{J}}{s} $

将其与目标开环传递函数 $ \frac{\beta}{s} $ 对比，系数相等得约束条件2：

$ K_{P\omega} \cdot \frac{K_t}{J} = \beta $

解得比例系数 $ K_{P\omega} $：

$ K_{P\omega}=\frac{\beta J}{K_t} \tag{6} $

### 3.  有功阻尼系数 $ B_s $ 的求解
让电机环节的极点等于期望带宽 $ \beta $，即

$ \frac{K_t B_s+B}{J}=\beta $

代入 $ K_t=1.5p_n\psi_f $，解得**有功阻尼系数唯一解析式**：

$ B_s=\frac{\beta J - B}{K_t}=\frac{\beta J - B}{1.5p_n\psi_f} \tag{7} $

### 4.  积分系数 $ K_{I\omega} $ 的求解
将式(6)、(7)代入约束条件1，化简：

$$
\begin{align*}
K_{I\omega}&=\frac{\beta J}{K_t} \cdot \frac{K_t \cdot \frac{\beta J - B}{K_t} + B}{J} \\
&=\frac{\beta J}{K_t} \cdot \frac{\beta J - B + B}{J} \\
&=\frac{\beta^2 J}{K_t}
\end{align*}
$$

结合式(6)，得到简洁关系：

$ K_{I\omega}=\beta K_{P\omega} \tag{8} $

## 四、最终结论
### 1.  PI调节器参数解析式
联立推导结果，得到有功阻尼法转速环PI参数最终公式：

$$
\boxed{
\begin{cases}
\displaystyle K_{P\omega} = \frac{\beta J}{1.5p_n\psi_f} \\
\displaystyle K_{I\omega} = \beta K_{P\omega}
\end{cases}
}
$$

### 2. 有功阻尼系数解析式

$$
\boxed{B_s=\frac{\beta J - B}{1.5p_n\psi_f}}
$$

### 3.  闭环传递函数验证
将开环传递函数 $ G_{open}(s)=\frac{\beta}{s} $ 代入单位负反馈闭环传递函数公式

$ G_{closed}(s)=\frac{G_{open}(s)}{1+G_{open}(s)} $

验证得

$ G_{closed}(s)=\frac{\frac{\beta}{s}}{1+\frac{\beta}{s}}=\frac{\beta}{s+\beta} $

## 五、参数物理意义与工程说明
1. **开环传递函数 **$ \frac{\beta}{s} $** 的意义**
该形式为**一阶积分环节**，保证闭环系统为一阶惯性环节，无超调、无振荡，响应速度由 $ \beta $ 决定；$ \beta $ 越大，响应越快。
2. **零点极点抵消的本质**
通过设计 $ B_s $ 让电机环节的极点与PI控制器的零点重合，消除系统的二阶特性，实现“二阶系统→一阶系统”的简化。
3. **工程整定顺序**
① 确定期望带宽 $ \beta $（通常50~200 rad/s）；
② 代入电机参数计算 $ K_{P\omega} $；
③ 由 $ K_{I\omega}=\beta K_{P\omega} $ 计算积分系数；
④ 最后计算有功阻尼系数 $ B_s $。

## 六、推导逻辑脉络
$ \boxed{转速动态方程} \rightarrow \boxed{电机环节传递函数} \rightarrow \boxed{PI+电机开环传递函数} \rightarrow \boxed{匹配目标开环传递函数\frac{\beta}{s}} \rightarrow \boxed{零点极点抵消+系数匹配} \rightarrow \boxed{PI参数+B_s解析式} $
