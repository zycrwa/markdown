---
title: "永磁同步电机谐波与六相矢量空间分析"
date: 2026-08-01 22:13:00
description: "推导三相空间谐波、六相时间谐波、Clarke 变换与矢量空间解耦模型。"
permalink: motor-control/pmsm-harmonic-analysis/
categories:
  - 电机控制
tags:
  - PMSM
  - 空间谐波
  - 六相电机
  - Clarke 变换
  - VSD
toc: true
mathjax: true
---

本文从三相绕组磁动势出发，扩展到六相电机的时间谐波、Clarke 变换和矢量空间解耦（VSD）模型，保留完整推导链路以便检查各变换矩阵的来源。

<!-- more -->

## 一 、 三相电机空间谐波磁动势推导
三相绕组 $A$、$B$、$C$ 在空间上互差 $120^{\circ}$ 电角度，通入的电流分别为：

+ $i_A = I_m\cos(\omega t)$
+ $i_B = I_m\cos(\omega t - 120^{\circ})$
+ $i_C = I_m\cos(\omega t - 240^{\circ})$

各相绕组产生的磁动势在空间按正弦规律分布：

+ $F_A(\theta,t)=Nk_{w1}i_A\cos\theta$
+ $F_B(\theta,t)=Nk_{w1}i_B\cos(\theta - 120^{\circ})$
+ $F_C(\theta,t)=Nk_{w1}i_C\cos(\theta - 240^{\circ})$

其中，$N$ 是绕组匝数，$k_{w1}$ 是基波绕组系数。以下推导使用恒等式 $\cos A\cos B=\frac{1}{2}[\cos(A+B)+\cos(A-B)]$，三相合成磁动势为 $F(\theta,t)=F_A(\theta,t)+F_B(\theta,t)+F_C(\theta,t)$。
1. **基波磁动势**

$ F_A(\theta,t)=Nk_{w1}I_m\cos(\omega t)\cos\theta=\frac{Nk_{w1}I_m}{2}[\cos(\theta+\omega t)+\cos(\theta - \omega t)] $

$ F_B(\theta,t)=Nk_{w1}I_m\cos(\omega t - 120^{\circ})\cos(\theta - 120^{\circ})=\frac{Nk_{w1}I_m}{2}[\cos(\theta+\omega t +120^{\circ})+\cos(\theta - \omega t)] $

$ F_C(\theta,t)=\frac{Nk_{w1}I_m}{2}[\cos((\theta - 240^{\circ})+(\omega t - 240^{\circ}))+\cos((\theta - 240^{\circ})-(\omega t - 240^{\circ}))]=\frac{Nk_{w1}I_m}{2}[\cos(\theta+\omega t - 120^{\circ})+\cos(\theta - \omega t)] $

$ F_1(\theta,t)=\frac{3}{2}Nk_{w1}I_m\cos(\theta - \omega t) $

2. **三次谐波磁动势**

$ F_{A3}(\theta,t)=\frac{Nk_{w3}I_m}{2}[\cos(3\theta+\omega t)+\cos(3\theta - \omega t)] $

$ F_{B3}(\theta,t)=\frac{Nk_{w3}I_m}{2}[\cos(3\theta +\omega t- 120^{\circ})+\cos(3\theta  - \omega t+ 120^{\circ})] $

$ F_{C3}(\theta,t)=\frac{Nk_{w3}I_m}{2}[\cos(3\theta +\omega t+120^{\circ})+\cos(3\theta  - \omega t- 120^{\circ})] $

$ F_{A3}(\theta,t)+F_{B3}(\theta,t)+F_{C3}(\theta,t)=0 $

3. **五次谐波磁动势**

$ F_{A5}(\theta,t)=\frac{Nk_{w5}I_m}{2}[\cos(5\theta+\omega t)+\cos(5\theta - \omega t)] $

$ F_{B5}(\theta,t)=\frac{Nk_{w5}I_m}{2}[\cos(5\theta +\omega t)+\cos(5\theta - \omega t- 120^{\circ} )] $

$ F_{C5}(\theta,t)=\frac{Nk_{w5}I_m}{2}[\cos(5\theta +\omega t)+\cos(5\theta - \omega t+ 120^{\circ} )] $

$ F_5(\theta,t)=\frac{3Nk_{w5}I_m}{2}\cos(5\theta +\omega t) $

4. **七次谐波磁动势**

$ F_{A7}(\theta,t)=\frac{Nk_{w7}I_m}{2}[\cos(7\theta+\omega t)+\cos(7\theta - \omega t)] $

$ F_{B7}(\theta,t)=\frac{Nk_{w7}I_m}{2}[\cos(7\theta +\omega t+ 120^{\circ})+\cos(7\theta  - \omega t )] $

$ F_{C7}(\theta,t)=\frac{Nk_{w7}I_m}{2}[\cos(7\theta +\omega t- 120^{\circ})+\cos(7\theta  - \omega t)] $

$ F_7(\theta,t)=\frac{3}{2}Nk_{w7}I_m\cos(7\theta - \omega t) $

        * 对于$ n = 6k\pm1 $次谐波，其磁动势表达式为：
            + $ F_{n}(\theta,t)=\frac{3}{2}Nk_{wn}I_m\cos(n\theta\pm\omega t) $
            + 当$ n = 6k - 1 $，谐波磁动势顺时针旋转；
            + 当$ n = 6k + 1 $，谐波磁动势逆时针旋转；

5. 双三相永磁同步电机谐波

$ F_{51}(\theta,t)=\frac{3Nk_{w5}I_m}{2}\cos(5\theta +\omega t) $

$ F_{52}(\theta,t)=-\frac{3Nk_{w5}I_m}{2}\cos(5\theta +\omega t) $

$ F_{71}(\theta,t)=\frac{3}{2}Nk_{w7}I_m\cos(7\theta - \omega t) $

$ F_{72}(\theta,t)=-\frac{3}{2}Nk_{w7}I_m\cos(7\theta - \omega t) $

## 二、  六相电机时间谐波磁动势推导
对于三相电机，假设磁动势是正弦分布，不同时间谐波的电流产生不同的磁动势，对于三相电机的电流存在 1，5，7 ，11，13 次谐波，3 次电流谐波不存在，而对于 6 相电机，不同谐波的磁动势存在增强和抵消。

### 电机结构
+ 双三相电机有两套独立的三相绕组：ABC绕组和XYZ绕组
+ 两套绕组在空间上错开30°电角度（π/6弧度）
+ 每相绕组产生正弦分布的磁动势

设ABC绕组的各相轴线位置为：

+ A相：θ = 0
+ B相：θ = 2π/3
+ C相：θ = -2π/3 或 4π/3

XYZ绕组的各相轴线滞后ABC绕组30°：

+ X相：θ = π/6
+ Y相：θ = π/6 + 2π/3 = 5π/6
+ Z相：θ = π/6 - 2π/3 =  3π/2

###  电流假设
仅考虑h次谐波电流，各相电流幅值分别为$ I_h $，且满足对称条件：

**ABC绕组电流：**

$$
\begin{aligned}
i_A^h(t) &= I_h \cos(h\omega t) \\
i_B^h(t) &= I_h \cos\left(h\omega t - \frac{2h\pi}{3}\right) \\
i_C^h(t) &= I_h \cos\left(h\omega t + \frac{2h\pi}{3}\right)
\end{aligned}
$$

**XYZ 绕组电流（滞后 $h\times30^\circ$）：**

$$
\begin{aligned}
i_X^h(t) &= I_h \cos\left(h\omega t - \frac{h\pi}{6}\right) \\
i_Y^h(t) &= I_h \cos\left(h\omega t - \frac{h\pi}{6} - \frac{2h\pi}{3}\right) \\
i_Z^h(t) &= I_h \cos\left(h\omega t - \frac{h\pi}{6} + \frac{2h\pi}{3}\right)
\end{aligned}
$$

$$
\begin{aligned}
f_A^h(\theta, t) &= N i_A^h(t) \cos(\theta) = N I_h \cos(h\omega t) \cos(\theta) \\
f_B^h(\theta, t) &= N i_B^h(t) \cos\left(\theta - \frac{2\pi}{3}\right) = N I_h \cos\left(h\omega t - \frac{2h\pi}{3}\right) \cos\left(\theta - \frac{2\pi}{3}\right) \\
f_C^h(\theta, t) &= N i_C^h(t) \cos\left(\theta + \frac{2\pi}{3}\right) = N I_h \cos\left(h\omega t + \frac{2h\pi}{3}\right) \cos\left(\theta + \frac{2\pi}{3}\right)
\end{aligned}
$$

$$
\begin{aligned}
f_X^h(\theta, t) &= N i_X^h(t) \cos\left(\theta - \frac{\pi}{6}\right) = N I_h \cos\left(h\omega t - \frac{h\pi}{6}\right) \cos\left(\theta - \frac{\pi}{6}\right) \\
f_Y^h(\theta, t) &= N i_Y^h(t) \cos\left(\theta - \frac{5\pi}{6}\right) = N I_h \cos\left(h\omega t - \frac{h\pi}{6} - \frac{2h\pi}{3}\right) \cos\left(\theta - \frac{5\pi}{6}\right) \\
f_Z^h(\theta, t) &= N i_Z^h(t) \cos\left(\theta + \frac{\pi}{2}\right) = N I_h \cos\left(h\omega t - \frac{h\pi}{6} + \frac{2h\pi}{3}\right) \cos\left(\theta + \frac{\pi}{2}\right)
\end{aligned}
$$

$ f_{\text{ABC}}^h(\theta, t) = f_A^h + f_B^h + f_C^h $

$ \cos\alpha \cos\beta = \frac{1}{2}[\cos(\alpha - \beta) + \cos(\alpha + \beta)] $
$ f_A^h = \frac{N I_h}{2} [\cos(h\omega t - \theta) + \cos(h\omega t + \theta)] $

$$
\begin{aligned}
f_B^h &= \frac{N I_h}{2} \left[ \cos\left(h\omega t - \frac{2h\pi}{3} - \theta + \frac{2\pi}{3}\right) + \cos\left(h\omega t - \frac{2h\pi}{3} + \theta - \frac{2\pi}{3}\right) \right] \\
&= \frac{N I_h}{2} \left[ \cos\left(h\omega t - \theta - \frac{2(h-1)\pi}{3}\right) + \cos\left(h\omega t + \theta - \frac{2(h+1)\pi}{3}\right) \right]
\end{aligned}
$$

$$
\begin{aligned}
f_C^h &= \frac{N I_h}{2} \left[ \cos\left(h\omega t + \frac{2h\pi}{3} - \theta - \frac{2\pi}{3}\right) + \cos\left(h\omega t + \frac{2h\pi}{3} + \theta + \frac{2\pi}{3}\right) \right] \\
&= \frac{N I_h}{2} \left[ \cos\left(h\omega t - \theta + \frac{2(h-1)\pi}{3}\right) + \cos\left(h\omega t + \theta + \frac{2(h+1)\pi}{3}\right) \right]
\end{aligned}
$$

### ABC 磁动势
**h = 6k + 1**

$$
\begin{aligned}
\cos\left(h\omega t - \theta - \frac{2(h-1)\pi}{3}\right)
= \cos\left(h\omega t - \theta - \frac{2(6k)\pi}{3}\right)
= \cos(h\omega t - \theta - 4k\pi)
= \cos(h\omega t - \theta)
\end{aligned}
$$
$$
\begin{aligned}
\cos\left(h\omega t - \theta + \frac{2(h-1)\pi}{3}\right) &= \cos\left(h\omega t - \theta + \frac{2(6k)\pi}{3}\right)
= \cos(h\omega t - \theta + 4k\pi)
= \cos(h\omega t - \theta)
\end{aligned}
$$

将三项相加：

$$
\begin{aligned}
f_{\text{ABC}}^h(\theta, t) = \frac{N I_h}{2} [\cos(h\omega t - \theta) + \cos(h\omega t + \theta)] \\
+\frac{N I_h}{2} [\cos(h\omega t - \theta) + \cos(h\omega t + \theta +\frac{2\pi}{3})] \\
+ \frac{N I_h}{2} [\cos(h\omega t - \theta) + \cos(h\omega t + \theta - \frac{2\pi}{3})]
\end{aligned}
$$

后续相加为 0，抵消后得：

$$
f_{\text{ABC}}^h(\theta, t) = \frac{3N I_h}{2} \cos(h\omega t - \theta)
$$

**h = 6k - 1**

### XYZ 磁动势

$f_{\text{XYZ}}^h(\theta, t) = f_X^h + f_Y^h + f_Z^h$

$$
\begin{aligned}
f_X^h &= \frac{N I_h}{2} \left[ \cos\left(h\omega t - \frac{h\pi}{6} - \theta + \frac{\pi}{6}\right) + \cos\left(h\omega t - \frac{h\pi}{6} + \theta - \frac{\pi}{6}\right) \right] \\
f_Y^h &= \frac{N I_h}{2} \left[ \cos\left(h\omega t - \frac{h\pi}{6} - \frac{2h\pi}{3} - \theta + \frac{5\pi}{6}\right) + \cos\left(h\omega t - \frac{h\pi}{6} - \frac{2h\pi}{3} + \theta - \frac{5\pi}{6}\right) \right] \\
f_Z^h &= \frac{N I_h}{2} \left[ \cos\left(h\omega t - \frac{h\pi}{6} + \frac{2h\pi}{3} - \theta - \frac{\pi}{2}\right) + \cos\left(h\omega t - \frac{h\pi}{6} + \frac{2h\pi}{3} + \theta + \frac{\pi}{2}\right) \right]
\end{aligned}
$$

$ \alpha = h\omega t - \theta, \quad \beta = h\omega t + \theta $

**h = 6m + 1（正序）**

$$
\begin{aligned}
f_X^h &= \frac{N I_h}{2} \left[ \cos\left(\alpha - \frac{(h-1)\pi}{6}\right) + \cos\left(\beta - \frac{(h+1)\pi}{6}\right) \right] \\
f_Y^h &= \frac{N I_h}{2} \left[ \cos\left(\alpha - \frac{(h-1)\pi}{6} - \frac{2(h-1)\pi}{3}\right) + \cos\left(\beta - \frac{(h+1)\pi}{6} - \frac{2(h+1)\pi}{3}\right) \right] \\
f_Z^h &= \frac{N I_h}{2} \left[ \cos\left(\alpha - \frac{(h-1)\pi}{6} + \frac{2(h-1)\pi}{3}\right) + \cos\left(\beta - \frac{(h+1)\pi}{6} + \frac{2(h+1)\pi}{3}\right) \right]
\end{aligned}
$$

$$
\begin{aligned}
f_X^h = \frac{N I_h}{2} \left[ \cos(\alpha - m\pi) + \cos\left(\beta - \frac{(6m+2)\pi}{6}\right) \right] \\
= \frac{N I_h}{2} \left[ (-1)^m \cos\alpha + (-1)^m\cos\left(\beta - \frac{\pi}{3}\right) \right]
\end{aligned}
$$

$$
\begin{aligned}
f_Y^h =
 \frac{N I_h}{2} \left[ (-1)^m \cos\alpha + (-1)^m\cos\left(\beta + \frac{\pi}{3}\right) \right]
\end{aligned}
$$

$$
\begin{aligned}
f_Z^h =
 \frac{N I_h}{2} \left[ (-1)^m \cos\alpha + (-1)^m\cos\left(\beta + {\pi}\right) \right]
\end{aligned}
$$

$ f_{\text{XYZ}}^h(\theta, t) = (-1)^m\frac{3}{2} N I_h \cos\left(h\omega t - \theta \right) $

**h = 6m - 1（负序）**

$ f_{\text{XYZ}}^h(\theta, t) = (-1)^m\frac{3}{2} N I_h \cos\left(h\omega t + \theta \right) $

### 总合成磁动势

$ f^h(\theta, t) = f_{\text{ABC}}^h(\theta, t) + f_{\text{XYZ}}^h(\theta, t) $

**情况1：m=1,3,5,7,9**

h = 6m + 1,h = 7,19

$$
\begin{aligned}
f^h(\theta, t) =
\frac{3}{2} N I_h \cos(h\omega t - \theta) +
(-1)^m\frac{3}{2} N I_h \cos\left(h\omega t - \theta\right) = 0
\end{aligned}
$$

h = 6m - 1,h = 5,17

$$
\begin{aligned}
f^h(\theta, t) =
\frac{3}{2} N I_h \cos(h\omega t + \theta) +
(-1)^m\frac{3}{2} N I_h \cos\left(h\omega t + \theta\right) = 0
\end{aligned}
$$
**情况 2：m=0,2,4,6,8**

h = 6m + 1,h = 1,13

$$
\begin{aligned}
f^h(\theta, t) =
\frac{3}{2} N I_h \cos(h\omega t - \theta) +
(-1)^m\frac{3}{2} N I_h \cos\left(h\omega t - \theta\right) =
3N I_h \cos(h\omega t - \theta)
\end{aligned}
$$

h = 6m - 1,h = 11,23

$$
\begin{aligned}
f^h(\theta, t) =
\frac{3}{2} N I_h \cos(h\omega t + \theta) +
(-1)^m\frac{3}{2} N I_h \cos\left(h\omega t + \theta\right) =
3 N I_h \cos(h\omega t + \theta)
\end{aligned}
$$

### 谐波结论

| m | h = 6m-1 | h = 6m+1 | 效果 |
| --- | --- | --- | --- |
| 0 | -1(不存在) | 1 | 增强 |
| 1 | 5 | 7 | 抵消 |
| 2 | 11 | 13 | 增强 |
| 3 | 17 | 19 | 抵消 |
| 4 | 23 | 25 | 增强 |
| 5 | 29 | 31 | 抵消 |

1. **抵消的谐波**：h = 5, 7, 17, 19, 29, 31, ...（对应m为奇数）
2. **增强的谐波**：h = 1, 11, 13, 23, 25, 35, 37, ...（对应m为偶数）

当m为奇数时，两套绕组产生的谐波磁动势：

+ 幅值相等
+ 相位相反（相差180°）
+ 在空间上完全抵消

当m为偶数时，两套绕组产生的谐波磁动势：

+ 幅值相等
+ 相位相同
+ 在空间上同相叠加，总幅值为单套绕组的2倍

+ **基波(h=1)**：增强，产生主转矩
+ **5、7次谐波**：完全抵消，显著减小转矩脉动
+ **11、13次谐波**：增强，但幅值较小且绕组感抗大$ X_h = h\omega L $，实际影响很小

## 三、 六相电机 Clarke 变换
![pmsm-harmonic-analysis 插图 1](/images/posts/pmsm-harmonic-analysis/001-89ffaee0d7.png)

![pmsm-harmonic-analysis 插图 2](/images/posts/pmsm-harmonic-analysis/002-92437fc546.png)

$$
\boldsymbol{T}_{62s}^{-1} = \begin{bmatrix} 1 & 0 & 1 & 0 & 1 & 0 \\ -\frac{1}{2} & \frac{\sqrt{3}}{2} & -\frac{1}{2} & -\frac{\sqrt{3}}{2} & 1 & 0 \\ -\frac{1}{2} & -\frac{\sqrt{3}}{2} & -\frac{1}{2} & \frac{\sqrt{3}}{2} & 1 & 0 \\ \frac{\sqrt{3}}{2} & \frac{1}{2} & -\frac{\sqrt{3}}{2} & \frac{1}{2} & 0 & 1 \\ -\frac{\sqrt{3}}{2} & \frac{1}{2} & \frac{\sqrt{3}}{2} & \frac{1}{2} & 0 & 1 \\ 0 & -1 & 0 & -1 & 0 & 1 \end{bmatrix}
$$

### 1. $\alpha$ 轴电流计算

$ i_\alpha = i_A - \frac{1}{2}i_B - \frac{1}{2}i_C + \frac{\sqrt{3}}{2}i_X - \frac{\sqrt{3}}{2}i_Y $傅里叶谐波电流：$ i_A=I_h\cos\theta_h $，$ i_B=I_h\cos\left(\theta_h-\frac{2h\pi}{3}\right) $，$ i_C=I_h\cos\left(\theta_h+\frac{2h\pi}{3}\right) $
$ i_X=I_h\cos\left(\theta_h-\frac{h\pi}{6}\right) $，$ i_Y=I_h\cos\left(\theta_h-\frac{5h\pi}{6}\right) $

$ \cos(a\pm b)=\cos a\cos b\mp\sin a\sin b $，$ \cos\frac{\pi}{6}=\frac{\sqrt{3}}{2} $，$ \sin\frac{\pi}{6}=\frac{1}{2} $，$ \cos\frac{\pi}{3}=\frac{1}{2} $，$ \sin\frac{\pi}{3}=\frac{\sqrt{3}}{2} $

1. $ \theta_1=\omega t $各相三角函数项：$ i_A: \cos\theta $
$ i_B: \cos\left(\theta-\frac{2\pi}{3}\right) $，$ i_C: \cos\left(\theta+\frac{2\pi}{3}\right) $
$ i_X: \cos\left(\theta-\frac{\pi}{6}\right) $，$ i_Y: \cos\left(\theta-\frac{5\pi}{6}\right) $

$ \cos\left(\theta-\frac{2\pi}{3}\right)=\cos\theta\cos\frac{2\pi}{3}+\sin\theta\sin\frac{2\pi}{3}=-\frac{1}{2}\cos\theta+\frac{\sqrt{3}}{2}\sin\theta $
$ \cos\left(\theta+\frac{2\pi}{3}\right)=\cos\theta\cos\frac{2\pi}{3}-\sin\theta\sin\frac{2\pi}{3}=-\frac{1}{2}\cos\theta-\frac{\sqrt{3}}{2}\sin\theta $

$$
\begin{align*}
i_A - \frac{1}{2}i_B - \frac{1}{2}i_C&=\cos\theta - \frac{1}{2}\left(-\frac{1}{2}\cos\theta+\frac{\sqrt{3}}{2}\sin\theta\right) - \frac{1}{2}\left(-\frac{1}{2}\cos\theta-\frac{\sqrt{3}}{2}\sin\theta\right)\\
&=\cos\theta + \frac{1}{4}\cos\theta - \frac{\sqrt{3}}{4}\sin\theta + \frac{1}{4}\cos\theta + \frac{\sqrt{3}}{4}\sin\theta\\
&=\boldsymbol{\frac{3}{2}\cos\theta}
\end{align*}
$$

$ \cos\left(\theta-\frac{\pi}{6}\right)=\cos\theta\cdot\frac{\sqrt{3}}{2}+\sin\theta\cdot\frac{1}{2} $
$ \cos\left(\theta-\frac{5\pi}{6}\right)=\cos\theta\cdot\left(-\frac{\sqrt{3}}{2}\right)+\sin\theta\cdot\frac{1}{2} $

$$
\begin{align*}
\frac{\sqrt{3}}{2}i_X - \frac{\sqrt{3}}{2}i_Y&=\frac{\sqrt{3}}{2}\left[\frac{\sqrt{3}}{2}\cos\theta+\frac{1}{2}\sin\theta - \left(-\frac{\sqrt{3}}{2}\cos\theta+\frac{1}{2}\sin\theta\right)\right]\\
&=\frac{\sqrt{3}}{2}\left(\sqrt{3}\cos\theta\right)\\
&=\boldsymbol{\frac{3}{2}\cos\theta}
\end{align*}
$$

$ i_{\alpha1}=3I_1\cos(\omega t) $

2. $ \theta_5=5\omega t $

先化简各相**相位角**（余弦周期$ 2\pi $，相位角加减$ 2k\pi $不改变值）：$ \frac{2\times5\pi}{3}=\frac{10\pi}{3} $，$ \frac{10\pi}{3}-2\pi=\frac{4\pi}{3} $，$ \frac{10\pi}{3}-4\pi=-\frac{2\pi}{3} $
$ \frac{5\times5\pi}{6}=\frac{25\pi}{6} $，$ \frac{25\pi}{6}-4\pi=\frac{25\pi}{6}-\frac{24\pi}{6}=\frac{\pi}{6} $各相三角函数项：$ i_A: \cos\theta $
$ i_B: \cos\left(\theta-\frac{10\pi}{3}\right)=\cos\left(\theta+\frac{2\pi}{3}\right) $（$ -10\pi/3+4\pi=2\pi/3 $）$ i_C: \cos\left(\theta+\frac{10\pi}{3}\right)=\cos\left(\theta-\frac{2\pi}{3}\right) $（$ +10\pi/3-4\pi=-2\pi/3 $）$ i_X: \cos\left(\theta-\frac{5\pi}{6}\right) $，$ i_Y: \cos\left(\theta-\frac{25\pi}{6}\right)=\cos\left(\theta-\frac{\pi}{6}\right) $

计算前三项 $ S_1 = \cos\theta - \frac{1}{2}\cos\left(\theta+\frac{2\pi}{3}\right) - \frac{1}{2}\cos\left(\theta-\frac{2\pi}{3}\right) $
$ S_1=\frac{3}{2}\cos\theta $

计算后两项 $ S_2 = \frac{\sqrt{3}}{2}\cos\left(\theta-\frac{5\pi}{6}\right) - \frac{\sqrt{3}}{2}\cos\left(\theta-\frac{\pi}{6}\right) $

$$
\begin{align*}
S_2&=\frac{\sqrt{3}}{2}\left[-\frac{\sqrt{3}}{2}\cos\theta+\frac{1}{2}\sin\theta - \frac{\sqrt{3}}{2}\cos\theta-\frac{1}{2}\sin\theta\right]\\
&=\frac{\sqrt{3}}{2}\left(-\sqrt{3}\cos\theta \right)\\
&=-\frac{3}{2}\cos\theta
\end{align*}
$$

$ i_{\alpha5}=0 $

3. $ \theta_7=7\omega t $

先化简各相**相位角**（余弦周期$ 2\pi $）：$ \frac{2\times7\pi}{3}=\frac{14\pi}{3} $，$ \frac{14\pi}{3}-4\pi=\frac{2\pi}{3} $
$ \frac{7\times5\pi}{6}=\frac{35\pi}{6} $，$ \frac{35\pi}{6}-6\pi=\frac{35\pi}{6}-\frac{36\pi}{6}=-\frac{\pi}{6} $
$ \frac{7\pi}{6} $保持不变；
各相三角函数项：
$ i_A: \cos\theta $
$ i_B: \cos\left(\theta-\frac{14\pi}{3}\right)=\cos\left(\theta-\frac{2\pi}{3}\right) $（$ -14\pi/3+4\pi=-2\pi/3 $）$ i_C: \cos\left(\theta+\frac{14\pi}{3}\right)=\cos\left(\theta+\frac{2\pi}{3}\right) $（$ +14\pi/3-4\pi=2\pi/3 $）$ i_X: \cos\left(\theta-\frac{7\pi}{6}\right) $，$ i_Y: \cos\left(\theta-\frac{35\pi}{6}\right)=\cos\left(\theta+\frac{\pi}{6}\right) $（$ -35\pi/6+6\pi=\pi/6 $）

步骤1：计算前三项 $ S_1 = \cos\theta - \frac{1}{2}\cos\left(\theta-\frac{2\pi}{3}\right) - \frac{1}{2}\cos\left(\theta+\frac{2\pi}{3}\right)=\frac{3}{2}\cos\theta $

步骤2：计算后两项 $ S_2 = \frac{\sqrt{3}}{2}\cos\left(\theta-\frac{7\pi}{6}\right) - \frac{\sqrt{3}}{2}\cos\left(\theta+\frac{\pi}{6}\right) $

先化简$ \cos\left(\theta-\frac{7\pi}{6}\right)=\cos\left(\theta-\frac{7\pi}{6}+2\pi\right)=\cos\left(\theta+\frac{5\pi}{6}\right) $，再展开：$ \cos\left(\theta+\frac{5\pi}{6}\right)=\cos\theta\cdot\left(-\frac{\sqrt{3}}{2}\right)-\sin\theta\cdot\frac{1}{2} $
$ \cos\left(\theta+\frac{\pi}{6}\right)=\cos\theta\cdot\frac{\sqrt{3}}{2}-\sin\theta\cdot\frac{1}{2} $
提取$ \frac{\sqrt{3}}{2} $，代入$ S_2 $：

$$
\begin{align*}
S_2&=\frac{\sqrt{3}}{2}\left[-\frac{\sqrt{3}}{2}\cos\theta-\frac{1}{2}\sin\theta - \left(\frac{\sqrt{3}}{2}\cos\theta-\frac{1}{2}\sin\theta\right)\right]\\
&=\frac{\sqrt{3}}{2}\left(-\sqrt{3}\cos\theta\right)\\
&=\boldsymbol{-\frac{3}{2}\cos\theta}
\end{align*}
$$

$ i_{\alpha7}=0 $

4. $ \theta_{11}=11\omega t $

先化简各相**相位角**（余弦周期$ 2\pi $）：$ \frac{2\times11\pi}{3}=\frac{22\pi}{3} $，$ \frac{22\pi}{3}-8\pi=-\frac{2\pi}{3} $
$ \frac{11\times5\pi}{6}=\frac{55\pi}{6} $，$ \frac{55\pi}{6}-10\pi=\frac{55\pi}{6}-\frac{60\pi}{6}=-\frac{5\pi}{6} $
$ \frac{7\pi}{6} $保持不变；
各相三角函数项：
$ i_A: \cos\theta $
$ i_B: \cos\left(\theta-\frac{22\pi}{3}\right)=\cos\left(\theta+\frac{2\pi}{3}\right) $
$ i_C: \cos\left(\theta+\frac{22\pi}{3}\right)=\cos\left(\theta-\frac{2\pi}{3}\right) $
$ i_X: \cos\left(\theta-\frac{11\pi}{6}\right)=\cos\left(\theta+\frac{\pi}{6}\right) $，$ i_Y: \cos\left(\theta-\frac{55\pi}{6}\right)=\cos\left(\theta+\frac{5\pi}{6}\right) $

步骤1：计算前三项 $ S_1 = \cos\theta - \frac{1}{2}\cos\left(\theta+\frac{2\pi}{3}\right) - \frac{1}{2}\cos\left(\theta-\frac{2\pi}{3}\right)=\frac{3}{2}\cos\theta $

步骤2：计算后两项 $ S_2 = \frac{\sqrt{3}}{2}\cos\left(\theta+\frac{\pi}{6}\right) - \frac{\sqrt{3}}{2}\cos\left(\theta+\frac{5\pi}{6}\right) $
$ \cos\left(\theta+\frac{\pi}{6}\right)=\cos\theta\cdot\frac{\sqrt{3}}{2}-\sin\theta\cdot\frac{1}{2} $
$ \cos\left(\theta+\frac{5\pi}{6}\right)=\cos\theta\cdot-\frac{\sqrt{3}}{2}-\sin\theta\cdot\frac{1}{2} $
提取$ \frac{\sqrt{3}}{2} $，代入$ S_2 $：

$$
\begin{align*}
S_2&=\frac{\sqrt{3}}{2}\left[\frac{\sqrt{3}}{2}\cos\theta-\frac{1}{2}\sin\theta - \left(-\frac{\sqrt{3}}{2}\cos\theta-\frac{1}{2}\sin\theta\right)\right]\\
&=\frac{\sqrt{3}}{2}\left(\sqrt{3}\cos\theta\right)\\
&=\boldsymbol{\frac{3}{2}\cos\theta}
\end{align*}
$$

$ i_{\alpha11}=3I_{11}\cos(11\omega t) $

5. $ \theta_{13}=13\omega t $

先化简各相**相位角**（余弦周期$ 2\pi $）：$ \frac{2\times13\pi}{3}=\frac{26\pi}{3} $，$ \frac{26\pi}{3}-8\pi=\frac{2\pi}{3} $
$ \frac{13\times5\pi}{6}=\frac{65\pi}{6} $，$ \frac{65\pi}{6}-10\pi=\frac{65\pi}{6}-\frac{60\pi}{6}=\frac{5\pi}{6} $
$ \frac{7\pi}{6} $保持不变；
各相三角函数项：
$ i_A: \cos\theta $
$ i_B: \cos\left(\theta-\frac{26\pi}{3}\right)=\cos\left(\theta-\frac{2\pi}{3}\right) $
$ i_C: \cos\left(\theta+\frac{26\pi}{3}\right)=\cos\left(\theta+\frac{2\pi}{3}\right) $
$ i_X: \cos\left(\theta-\frac{13\pi}{6}\right)=\cos\left(\theta-\frac{\pi}{6}\right) $，$ i_Y: \cos\left(\theta-\frac{65\pi}{6}\right)=\cos\left(\theta-\frac{5\pi}{6}\right) $

步骤1：计算前三项 $ S_1 = \cos\theta - \frac{1}{2}\cos\left(\theta-\frac{2\pi}{3}\right) - \frac{1}{2}\cos\left(\theta+\frac{2\pi}{3}\right)=\frac{3}{2}\cos\theta $

步骤2：计算后两项 $ S_2 = \frac{\sqrt{3}}{2}\cos\left(\theta-\frac{\pi}{6}\right) - \frac{\sqrt{3}}{2}\cos\left(\theta-\frac{5\pi}{6}\right) $
$ \cos\left(\theta-\frac{\pi}{6}\right)=\cos\theta\cdot\frac{\sqrt{3}}{2}+\sin\theta\cdot\frac{1}{2} $
$ \cos\left(\theta-\frac{5\pi}{6}\right)=\cos\theta\cdot-\frac{\sqrt{3}}{2}+\sin\theta\cdot\frac{1}{2} $
提取$ \frac{\sqrt{3}}{2} $，代入$ S_2 $：

$$
\begin{align*}
S_2&=\frac{\sqrt{3}}{2}\left[\frac{\sqrt{3}}{2}\cos\theta+\frac{1}{2}\sin\theta - \left(-\frac{\sqrt{3}}{2}\cos\theta+\frac{1}{2}\sin\theta\right)\right]\\
&=\frac{\sqrt{3}}{2}\left(\sqrt{3}\cos\theta\right)\\
&=\boldsymbol{\frac{3}{2}\cos\theta}
\end{align*}
$$

$ i_{\alpha13}=3I_{13}\cos(13\omega t) $

| 谐波次数 $h$ | 变换结果 | 核心特征 |
| --- | --- | --- |
| 1 | $ y(t)=3I_1\cos(\omega t) $ | 仅含基波余弦项 |
| 5 | $ y(t)=0 $ | 5 次谐波完全抵消 |
| 7 | $ y(t)=0 $ | 7次谐波完全抵消 |
| 11 | $ y(t)=3I_{11}\cos(11\omega t) $ |  仅余弦项，与基波形式一致   |
| 13 | $ y(t)=3I_{13}\cos(13\omega t) $ |  仅余弦项，与基波形式一致   |

结论：变换后的 $i_\alpha$ 与 $i_\beta$ 仅保留 1、11 和 13 次谐波；两者分别对应余弦与正弦分量。

$i_\beta = \frac{\sqrt{3}}{2}i_B -  \frac{\sqrt{3}}{2}i_C + \frac{1}{2}i_X +\frac{1}{2}i_Y-i_W$

| 谐波次数 $h$ | 变换结果 | 核心特征 |
| --- | --- | --- |
| 1 | $ y(t)=3I_1\sin(\omega t) $ | 仅含基波余弦项 |
| 5 | $ y(t)=0 $ | 5 次谐波完全抵消 |
| 7 | $ y(t)=0 $ | 7次谐波完全抵消 |
| 11 | $ y(t)=3I_{11}\sin(11\omega t) $ |  仅余弦项，与基波形式一致   |
| 13 | $ y(t)=3I_{13}\sin(13\omega t) $ |  仅余弦项，与基波形式一致   |

### 2. $x$ 轴电流计算

$ i_x = i_A - \frac{1}{2}i_B - \frac{1}{2}i_C - \frac{\sqrt{3}}{2}i_X + \frac{\sqrt{3}}{2}i_Y $

参考$ i_\alpha $电流计算得

| 谐波次数 $h$ | 变换结果 | 核心特征 |
| --- | --- | --- |
| 1 | $ y(t)=0 $ | 基波谐波完全抵消 |
| 5 | $ y(t)=3I_{5}\cos(5\omega t) $ | 5 次谐波 |
| 7 | $ y(t)=3I_{7}\cos(7\omega t) $ | 7次谐波 |
| 11 | $ y(t)=0 $ |  11 次波谐波完全抵消 |
| 13 | $ y(t)=0 $ |  13 次波谐波完全抵消 |

结论：变换后的 $i_x$ 与 $i_y$ 仅保留 5 次和 7 次谐波；两者分别对应余弦与正弦分量。

$ i_y = -\frac{\sqrt{3}}{2}i_B +  \frac{\sqrt{3}}{2}i_C + \frac{1}{2}i_X +\frac{1}{2}i_Y-i_W $

| 谐波次数 $h$ | 变换结果 | 核心特征 |
| --- | --- | --- |
| 1 | $ y(t)=0 $ | 基波完全抵消 |
| 5 | $ y(t)=3I_{5}\sin(5\omega t) $ | 5 次谐波 |
| 7 | $ y(t)=3I_{7}\sin(7\omega t) $ | 7次谐波 |
| 11 | $ y(t)=0 $ |  11 次波谐波完全抵消 |
| 13 | $ y(t)=0 $ |  13 次波谐波完全抵消 |

## 四、六相电机矢量空间解耦变换的数学模型
### 基础矩阵
$ T_{6s/2r}= $

$$
\frac{1}{3}
\begin{bmatrix}
\cos\theta_e & \cos\left(\theta_e - \frac{2\pi}{3}\right) & \cos\left(\theta_e + \frac{2\pi}{3}\right) & \cos\left(\theta_e - \frac{\pi}{6}\right) & \cos\left(\theta_e - \frac{5\pi}{6}\right) & \cos\left(\theta_e + \frac{\pi}{2}\right) \\
-\sin\theta_e & -\sin\left(\theta_e - \frac{2\pi}{3}\right) & -\sin\left(\theta_e + \frac{2\pi}{3}\right) & -\sin\left(\theta_e - \frac{\pi}{6}\right) & -\sin\left(\theta_e - \frac{5\pi}{6}\right) & -\sin\left(\theta_e + \frac{\pi}{2}\right) \\
1 & -\frac{1}{2} & -\frac{1}{2} & -\frac{\sqrt{3}}{2} & \frac{\sqrt{3}}{2} & 0 \\
0 & -\frac{\sqrt{3}}{2} & \frac{\sqrt{3}}{2} & \frac{1}{2} & \frac{1}{2} & -1 \\
1 & 1 & 1 & 0 & 0 & 0 \\
0 & 0 & 0 & 1 & 1 & 1
\end{bmatrix}
$$

很多时候最后两行忽略

$$
\boldsymbol{L}{6s}=

\begin{bmatrix}
\boldsymbol{L}{11} & \boldsymbol{M}{12} \\
\boldsymbol{M}{21} & \boldsymbol{L}{22}
\end{bmatrix}
=
\begin{bmatrix}
L{AA} & M_{AB} & M_{AC} & M_{AU} & M_{AV} & M_{AW} \\
M_{AB} & L_{BB} & M_{BC} & M_{BU} & M_{BV} & M_{BW} \\
M_{AC} & M_{BC} & L_{CC} & M_{CU} & M_{CV} & M_{CW} \\
M_{AU} & M_{AV} & M_{AW} & L_{UU} & M_{UV} & M_{UW} \\
M_{BU} & M_{BV} & M_{BW} & M_{UV} & L_{VV} & M_{VW} \\
M_{CU} & M_{CV} & M_{CW} & M_{UW} & M_{VW} & L_{WW}
\end{bmatrix}
$$

$$
\boldsymbol{L}_{11}=L_{AA1}\boldsymbol{I}_3+
\frac{L_{AAd}+L_{AAq}}{2}
\begin{bmatrix}
1 & -\frac{1}{2} & -\frac{1}{2} \\
-\frac{1}{2} & 1 & -\frac{1}{2} \\
-\frac{1}{2} & -\frac{1}{2} & 1
\end{bmatrix}+

\frac{L_{AAd}-L_{AAq}}{2}
\begin{bmatrix}
\cos2\theta_e & \cos2\left(\theta_e-\frac{\pi}{3}\right) & \cos2\left(\theta_e+\frac{\pi}{3}\right) \\

\cos2\left(\theta_e-\frac{\pi}{3}\right) & \cos2\left(\theta_e+\frac{\pi}{3}\right) & \cos2\theta_e \\

\cos2\left(\theta_e+\frac{\pi}{3}\right) & \cos2\theta_e & \cos2\left(\theta_e-\frac{\pi}{3}\right)
\end{bmatrix}
$$

$$
\boldsymbol{M}_{12}=\boldsymbol{M}_{21}^\text{T}=
L_{AA1}\boldsymbol{I}_3+
\frac{L_{AAd}+L_{AAq}}{2}
\begin{bmatrix}
\frac{\sqrt{3}}{2} & -\frac{\sqrt{3}}{2} & 0 \\
0 & \frac{\sqrt{3}}{2} & -\frac{\sqrt{3}}{2} \\
-\frac{\sqrt{3}}{2} & 0 & \frac{\sqrt{3}}{2}
\end{bmatrix}+

\frac{L_{AAd}-L_{AAq}}{2}
\begin{bmatrix}
\cos2\left(\theta_e-\frac{\pi}{12}\right) & \cos2\left(\theta_e-\frac{5\pi}{12}\right) & \cos2\left(\theta_e+\frac{\pi}{4}\right) \\
\cos2\left(\theta_e-\frac{5\pi}{12}\right) & \cos2\left(\theta_e+\frac{\pi}{4}\right) & \cos2\left(\theta_e-\frac{\pi}{12}\right) \\
\cos2\left(\theta_e+\frac{\pi}{4}\right) & \cos2\left(\theta_e-\frac{\pi}{12}\right) & \cos2\left(\theta_e-\frac{5\pi}{12}\right)
\end{bmatrix}
$$

$$
\boldsymbol{L}_{22}=L_{AA1}\boldsymbol{I}_3+
\frac{L_{AAd}+L_{AAq}}{2}
\begin{bmatrix}
1 & -\frac{1}{2} & -\frac{1}{2} \\
-\frac{1}{2} & 1 & -\frac{1}{2} \\
-\frac{1}{2} & -\frac{1}{2} & 1
\end{bmatrix}+

\frac{L_{AAd}-L_{AAq}}{2}
\begin{bmatrix}
\cos2\left(\theta_e-\frac{\pi}{6}\right) & \cos2\left(\theta_e-\frac{\pi}{2}\right) & \cos2\left(\theta_e+\frac{\pi}{6}\right) \\
\cos2\left(\theta_e-\frac{\pi}{2}\right) & \cos2\left(\theta_e+\frac{\pi}{6}\right) & \cos2\left(\theta_e-\frac{\pi}{6}\right) \\
\cos2\left(\theta_e+\frac{\pi}{6}\right) & \cos2\left(\theta_e-\frac{\pi}{6}\right) & \cos2\left(\theta_e-\frac{\pi}{2}\right)
\end{bmatrix}
$$

### 公式推导
#### 六相原始坐标系方程
六相 PMSM 有 6 个独立的定子绕组，中性点隔离，因此不考虑零序分量（共模电压、电流）。在静止坐标系下，电压方程为：

$ u_{6s} = R_{6s} i_{6s} + \frac{d}{dt} \psi_{6s} $

其中：

+ $  u_{6s} = [u_A, u_B, u_C, u_{A1}, u_{B1}, u_{C1}]^T $ 是六相电压向量。
+ $  i_{6s} = [i_A, i_B, i_C, i_{A1}, i_{B1}, i_{C1}]^T $ 是六相电流向量。
+ $ R_{6s} = R \cdot I_{6 \times 6} $ 是电阻矩阵。
+ $  \psi_{6s} $ 是磁链向量，由电流产生的磁链和永磁体磁链组成：

$ \psi_{6s} = L_{6s} i_{6s} + \lambda_{6s} $

+ $ L_{6s} $ 是 6×6 电感矩阵，在静止坐标系中通常是转子位置 $  \theta  $ 的函数。
+ $ \lambda_{6s} $ 是永磁体产生的磁链向量，在静止坐标系中也是 $ \theta $ 的函数。

#### 坐标变换目的
我们希望将模型变换到两个同步旋转的子空间：

+ **( d-q ) 子空间**：与转子磁场同步旋转，用于产生转矩。
+ **( x-y ) 子空间**：也是同步旋转，但与转子磁场正交，不参与转矩生成，只包含漏感和谐波。

定义一个变换矩阵 $  T_{6s/2r} $，将静止坐标系的六相变量变换到旋转坐标系的四维变量：

$$
i_{2r} = T_{6s/2r}i_{6s}
\quad \text{或} \quad
i_{6s} = T_{6s/2r}^{-1}  i_{2r}
$$

#### 将电压方程变换到旋转坐标系

$i_{2r} = [i_d, i_q, i_x, i_y]^T$，变换矩阵 $T_{6s/2r}$ 为**正交矩阵**，即 $T_{6s/2r}^{-1} = T_{6s/2r}^T$。

$ T_{6s/2r} u_{6s} = T_{6s/2r} R_{6s} i_{6s} + T_{6s/2r} \frac{d}{dt} \psi_{6s} $

$u_{2r} = T_{6s/2r} R_{6s} T_{6s/2r}^{-1} i_{2r} + T_{6s/2r} \frac{d}{dt} \psi_{6s}$

$ R_{2r} = T_{6s/2r} R_{6s} T_{6s/2r}^{-1} $

$u_{2r} = R_{2r} i_{2r} + T_{6s/2r} \frac{d}{dt} \psi_{6s}$

#### 处理磁链导数
$ \psi_{6s} = L_{6s} T_{6s/2r}^{-1} i_{2r} + \lambda_{6s} $

$\frac{d}{dt} \psi_{6s} = \frac{d}{dt} \left( L_{6s} T_{6s/2r}^{-1} i_{2r} \right) + \frac{d \lambda_{6s}}{dt}$

注意，$ L_{6s}  $ 和 $ T_{6s/2r} $ 都是转子位置 $ \theta $ 的函数，而 $ \theta = \omega_e t $。

展开导数：

$ \frac{d}{dt} \left( L_{6s} T_{6s/2r}^{-1} i_{2r} \right) = \left( \frac{d}{dt} (L_{6s} T_{6s/2r}^{-1}) \right) i_{2r} + L_{6s} T_{6s/2r}^{-1} \frac{d i_{2r}}{dt} $

$$
u_{2r} = R i_{2r} + T_{6s/2r} \left[ \left( \frac{d}{dt} (L_{6s} T_{6s/2r}^{-1}) \right) i_{2r} + L_{6s} T_{6s/2r}^{-1} \frac{d i_{2r}}{dt} \right] + T_{6s/2r}\frac{d \lambda_{6s}}{dt}
$$

#### 化简电感项

$L_{2r} = T_{6s/2r} L_{6s} T_{6s/2r}^{-1}$

由于变换矩阵设计得当，$ L_{2r}  $是一个**常数对角块矩阵**：

+ 对于 ( d-q ) 子空间，电感为 $ L_d  $ 和 $L_q$。
+ 对于 ( x-y ) 子空间，电感为漏感 $ L_z  $。

$$
L_{2r} = \begin{bmatrix}
L_d & 0 & 0 & 0 \\
0 & L_q & 0 & 0 \\
0 & 0 & L_z & 0 \\
0 & 0 & 0 & L_z
\end{bmatrix}
$$

$ T_{6s/2r} L_{6s} T_{6s/2r}^{-1} \frac{d i_{2r}}{dt} = L_{2r} \frac{d i_{2r}}{dt} $

#### 处理耦合项和反电动势项

$T_{6s/2r} \left( \frac{d}{dt} (L_{6s} T_{6s/2r}^{-1}) \right) i_{2r} + T_{6s/2r}\frac{d \lambda_{6s}}{dt}$
剩下的这两项合起来就是旋转坐标系下的**旋转反电动势**（包括耦合项和永磁体产生的电动势）。

为了计算它们，我们利用关系式$  L_{6s} T_{6s/2r}^{-1} = T_{6s/2r}^{-1} L_{2r} $于是：

$ \frac{d}{dt} (L_{6s} T_{6s/2r}^{-1}) = \frac{d}{dt} (T_{6s/2r}^{-1} L_{2r}) = \frac{d T_{6s/2r}^{-1}}{dt} L_{2r} + T_{6s/2r}^{-1} \frac{d L_{2r}}{dt} $

由于 $  L_{2r} $ 是常数矩阵，所以 $  \frac{d L_{2r}}{dt} = 0  $。因此：

$\frac{d}{dt} (L_{6s} T_{6s/2r}^{-1}) = \frac{d T_{6s/2r}^{-1}}{dt} L_{2r}$

$T_{6s/2r} \left( \frac{d T_{6s/2r}^{-1}}{dt} L_{2r} \right) i_{2r} = \left( T_{6s/2r} \frac{d T_{6s/2r}^{-1}}{dt} \right) L_{2r} i_{2r}$

$$
T_{6s/2r} \frac{d T_{6s/2r}^{-1}}{dt} = \omega_e \begin{bmatrix}
0 & -1 & 0 & 0 \\
1 & 0 & 0 & 0 \\
0 & 0 & 0 & 0 \\
0 & 0 & 0 & 0
\end{bmatrix}
$$

具体推导见后续小节。于是：

$$
\omega_c \begin{bmatrix}
0 & -1 & 0 & 0 \\
1 & 0 & 0 & 0 \\
0 & 0 & 0 & 0 \\
0 & 0 & 0 & 0
\end{bmatrix} L_{2r} i_{2r} = \omega_c \begin{bmatrix}
0 & -1 & 0 & 0 \\
1 & 0 & 0 & 0 \\
0 & 0 & 0 & 0 \\
0 & 0 & 0 & 0
\end{bmatrix} \begin{bmatrix}
L_d i_d \\
L_q i_q \\
L_z i_x \\
L_z i_y
\end{bmatrix} = \begin{bmatrix}
-\omega_c L_q i_q \\
\omega_c L_d i_d \\
0 \\
0
\end{bmatrix}
$$

$ \lambda_{6s} = \psi_f \cdot f(\theta) $

$ T_{6s/2r} \lambda_{6s} = \begin{bmatrix} \psi_f \\ 0 \\ 0 \\ 0 \end{bmatrix} $

$ T_{6s/2r} \frac{d \lambda_{6s}}{dt} = T_{6s/2r} \frac{d}{dt} \left( T_{6s/2r} ^{-1}\begin{bmatrix} \psi_f \\ 0 \\ 0 \\ 0 \end{bmatrix} \right) $

$ T_{6s/2r}\frac{d \lambda_{6s}}{dt} = \left( T_{6s/2r} \frac{d T_{6s/2r}^{-1}}{dt} \right) \begin{bmatrix} \psi_f \\ 0 \\ 0 \\ 0 \end{bmatrix} + \frac{d}{dt} \begin{bmatrix} \psi_f \\ 0 \\ 0 \\ 0 \end{bmatrix} $

$$
\omega_c \begin{bmatrix}
0 & -1 & 0 & 0 \\
1 & 0 & 0 & 0 \\
0 & 0 & 0 & 0 \\
0 & 0 & 0 & 0
\end{bmatrix} \begin{bmatrix} \psi_f \\ 0 \\ 0 \\ 0 \end{bmatrix} = \begin{bmatrix} 0 \\ \omega_c \psi_f \\ 0 \\ 0 \end{bmatrix}
$$

这就是永磁体产生的反电动势项。

#### 合并所有项
$u_{2r} = R i_{2r} + L_{2r} \frac{d i_{2r}}{dt} + \begin{bmatrix} -\omega_c L_q i_q \\ \omega_c L_d i_d \\ 0 \\ 0 \end{bmatrix} + \begin{bmatrix} 0 \\ \omega_c \psi_f \\ 0 \\ 0 \end{bmatrix}$

**( d-q ) 子空间：**

$$
\begin{cases}
u_d = R i_d + L_d \frac{d i_d}{dt} - \omega_c L_q i_q \\
u_q = R i_q + L_q \frac{d i_q}{dt} + \omega_c L_d i_d + \omega_c \psi_f
\end{cases}
$$

**( x-y ) 子空间：**

$$
\begin{cases}
u_x = R i_x + L_z \frac{d i_x}{dt} \\
u_y = R i_y + L_z \frac{d i_y}{dt}
\end{cases}
$$

#### 变换矩阵导数的详细推导

$$
T_{6s/2r} \frac{d T_{6s/2r}^{-1}}{dt} = \omega_e \begin{bmatrix}
0 & -1 & 0 & 0 \\
1 & 0 & 0 & 0 \\
0 & 0 & 0 & 0 \\
0 & 0 & 0 & 0
\end{bmatrix}
$$

推导如下。

$\theta = \omega_e t$

$ \frac{dT_{6s/2r}^{-1}}{dt} = \frac{dT_{6s/2r}^{-1}}{d\theta} \cdot \frac{d\theta}{dt} = \omega_e \frac{dT_{6s/2r}^{-1}}{d\theta} $
考虑到公式 1，2 列存在，3，4 列为常数，故求导为 0

$$
\frac{dT_{6s/2r}^{-1}}{d\theta}=
\frac{1}{3}
\begin{bmatrix}
-\sin\theta_e & -\sin\left(\theta_e - \frac{2\pi}{3}\right) & -\sin\left(\theta_e + \frac{2\pi}{3}\right) & -\cos\left(\theta_e - \frac{\pi}{6}\right) & -\sin\left(\theta_e - \frac{5\pi}{6}\right) & -\sin\left(\theta_e + \frac{\pi}{2}\right) \\
-\cos\theta_e & -\cos\left(\theta_e - \frac{2\pi}{3}\right) & -\cos\left(\theta_e + \frac{2\pi}{3}\right) & -\cos\left(\theta_e - \frac{\pi}{6}\right) & -\cos\left(\theta_e - \frac{5\pi}{6}\right) & -\cos\left(\theta_e + \frac{\pi}{2}\right) \\
0 & 0 & 0 & 0 &0 & 0 \\
0 & 0 & 0 & 0 &0 & 0 \\
0 & 0 & 0 & 0 &0 & 0 \\
0 & 0 & 0 & 0 &0 & 0
\end{bmatrix}^T
$$

$ T_d = [\cos\theta, \cos(\theta-120^\circ), \cos(\theta+120^\circ), \cos(\theta-30^\circ), \cos(\theta-150^\circ), \cos(\theta+90^\circ)] $
$ \frac{dT_d}{d\theta} = [-\sin\theta, -\sin(\theta-120^\circ), -\sin(\theta+120^\circ), -\sin(\theta-30^\circ), -\sin(\theta-150^\circ), -\sin(\theta+90^\circ)] $
$  \frac{dT_d}{d\theta}=T_q  $

类似地：

+ $ \frac{dT_q}{d\theta} =- T_d $
+ $  \frac{dT_x}{d\theta} = 0 $
+ $  \frac{dT_y}{d\theta} =0 $

$ T_{6s/2r} \frac{dT_{6s/2r}^T}{dt} = \omega_e T_{6s/2r} \frac{dT_{6s/2r}^T}{d\theta} $

$$
\frac{dT_{6s/2r}^T}{d\theta} = \begin{bmatrix}
T_q &
-T_d &
0 &
0
\end{bmatrix}
$$

$$
T_{6s/2r} \frac{dT_{6s/2r}^T}{d\theta} = \begin{bmatrix}
T_d \\ T_q \\ T_x \\ T_y
\end{bmatrix} \begin{bmatrix}
T_q &
-T_d &
0 &
0
\end{bmatrix}=
\begin{bmatrix}
0 & 1 & 0 & 0 \\
-1 & 0 & 0 & 0 \\
0 & 0 & 0 & 0 \\
0 & 0 & 0 & 0
\end{bmatrix}
$$
