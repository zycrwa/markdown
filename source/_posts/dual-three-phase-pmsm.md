---
title: "双三相永磁同步电机 SVPWM"
date: 2026-08-01 22:12:00
updated: 2026-08-01 22:12:00
description: "覆盖双三相逆变器空间矢量与两矢量 SVPWM；谐波和 VSD 推导由六相矢量空间文章维护。"
permalink: motor-control/dual-three-phase-pmsm/
categories:
  - 电机控制
tags:
  - 双三相 PMSM
  - SVPWM
  - 六相逆变器
aliases:
  - 双三相 PMSM
  - 六相逆变器 SVPWM
related_posts:
  - three-phase-pmsm
  - pmsm-harmonic-analysis
source_docs:
  - "archive/original-posts/双三相永磁同步电机.md"
review_status: unverified
toc: true
mathjax: true
---

本文整理双三相电压源逆变器的电压空间矢量、传统两矢量 SVPWM 实现和基波幅值关系，为后续矢量空间解耦控制建立基础。

<!-- more -->

## 一、双三相 SVPWM
![双三相电压源逆变器](/images/posts/dual-three-phase-pmsm/001-87a213a8f0.png)

**线电压与开关函数的关系 **

$$
\begin{bmatrix}
U_{AB} \\ U_{BC} \\ U_{CA} \\ U_{UV} \\ U_{VW} \\ U_{WU}
\end{bmatrix}
= U_{dc}
\begin{bmatrix}
1 & -1 & 0 & 0 & 0 & 0 \\
0 & 1 & -1 & 0 & 0 & 0 \\
-1 & 0 & 1 & 0 & 0 & 0 \\
0 & 0 & 0 & 1 & -1 & 0 \\
0 & 0 & 0 & 0 & 1 & -1 \\
0 & 0 & 0 & -1 & 0 & 1
\end{bmatrix}
\begin{bmatrix}
K_A \\ K_B \\ K_C \\ K_U \\ K_V \\ K_W
\end{bmatrix}
$$

**相电压与线电压的关系 **

$$
\begin{bmatrix}
U_A \\ U_B \\ U_C \\ U_U \\ U_V \\ U_W
\end{bmatrix}
=
\begin{bmatrix}
2/3 & 1/3 & 0 & 0 & 0 & 0 \\
-1/3 & 1/3 & 0 & 0 & 0 & 0 \\
-1/3 & -2/3 & 0 & 0 & 0 & 0 \\
0 & 0 & 0 & 2/3 & 1/3 & 0 \\
0 & 0 & 0 & -1/3 & 1/3 & 0 \\
0 & 0 & 0 & -1/3 & -2/3 & 0
\end{bmatrix}
\begin{bmatrix}
U_{AB} \\ U_{BC} \\ 0 \\ U_{UV} \\ U_{VW} \\ 0
\end{bmatrix}
$$

$ v_{\alpha\beta}  = \frac{1}{3}U_{dc}\left(K_A + K_Ba^4 + K_C a^8 + K_U a + K_V a^5 + K_W a^9\right) $

$ v_{xy}  = \frac{1}{3}U_{dc}\left(K_A + K_Ba^8 + K_C a^4 + K_U a^5 + K_V a + K_W a^9\right) $

其中，$ a = e{j^{30^\circ}} $，$ K $ 表示的是各个桥臂的开关状态

$ K = K_A \times 2^0 + K_B \times 2^1 + K_C \times 2^2 + K_U \times 2^3 + K_V \times 2^4 + K_W \times 2^5 $

![dual-three-phase-pmsm 插图 2](/images/posts/dual-three-phase-pmsm/002-267a77293e.png)

![dual-three-phase-pmsm 插图 3](/images/posts/dual-three-phase-pmsm/003-264193b9da.png)

![dual-three-phase-pmsm 插图 4](/images/posts/dual-three-phase-pmsm/004-e36098655d.png)

$  \begin{cases} V_{\max} = \dfrac{\sqrt{2}(\sqrt{3}+1)}{6}U_{dc} \approx 0.644U_{dc} \\ V_{\text{midL}} = \dfrac{\sqrt{2}}{3}U_{dc} \approx 0.471U_{dc} \\ V_{\text{mids}} = \dfrac{1}{3}U_{dc} \approx 0.333U_{dc} \\ V_{\min} = \dfrac{\sqrt{2}(\sqrt{3}-1)}{6}U_{dc} \approx 0.173U_{dc} \end{cases} \ $

### 1.1 传统两矢量 SVPWM 算法

![dual-three-phase-pmsm 插图 5](/images/posts/dual-three-phase-pmsm/005-2b46e74b36.png)

通常可以将

## 二、SVPWM 幅值分析
![dual-three-phase-pmsm 插图 6](/images/posts/dual-three-phase-pmsm/006-c1076c1ea9.png)

当 alpha 和 beta 的幅值是 50，也就是 uout=50v，正常使用等幅值变换时，生成的相电压是 2/3udc，在等幅值变换时， uout=2*2/3udc=4/3udc；相电压 2/3udc=50*3*2/4/3=25；
