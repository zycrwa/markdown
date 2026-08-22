---
title: "PMSM 电感与磁链参数测量"
date: 2026-08-01 22:15:00
updated: 2026-08-22 19:14:00
description: "覆盖 PMSM 相电感、dq 轴电感与永磁体磁链测量；控制模型和代码实现由关联文章维护。"
permalink: motor-control/pmsm-parameter-measurement/
categories:
  - 电机控制
tags:
  - PMSM
  - 参数辨识
  - 电感测量
  - 磁链
aliases:
  - PMSM 参数辨识
  - 电机电感测量
  - 永磁体磁链测量
related_posts:
  - three-phase-pmsm
  - dengfoc-control-code
  - simulink-motor-simulation
  - motor-embedded-software-roadmap
source_docs:
  - "archive/original-posts/电机疑问讨论.md"
review_status: unverified
toc: true
mathjax: true
---

本文整理 PMSM 参数测量中的相电感模型、两相端口电感与 $d$、$q$ 轴电感换算，并补充反电动势法估算永磁体磁链的关系式。

<!-- more -->

## 相电感模型

$$
\begin{cases}
L_{aa} = L_1 + \frac{1}{2}(L_{AAd} + L_{AAq})+ \frac{1}{2}(L_{AAd}-L_{AAq})\cos(2\theta) \\
L_{bb} = L_{s0} + L_{s2}\cos\left(2(\theta-\frac{2\pi}{3})\right) \\
L_{cc} = L_{s0} + L_{s2}\cos\left(2(\theta+\frac{2\pi}{3})\right)\\

M_{ab}=M_{ba}=-[M_{\sigma} + \frac{1}{4}(L_{AAd}+L_{AAq}) +\frac{1}{2} (L_{AAd}-L_{AAq})\cos\left(2(\theta+\frac{\pi}{6})\right) ]\\
M_{bc}=M_{cb}=-[M_{s0} + M_{s2}\cos2(\theta-\frac{\pi}{2})] \\
M_{ca}=M_{ac}=-[M_{s0} + M_{s2}\cos2(\theta+\frac{5\pi}{6})]
\end{cases}
$$

忽略漏感时，等复制坐标变换下  d-q 轴电感是：

$$
L_q=\frac{3}{2}L_{AAq}\\
L_d=\frac{3}{2}L_{AAd}
$$

## 两相端口电感换算

对于数字电桥的两端测量，本节忽略漏感：

$L=L_{aa}+L_{bb}-M_{ab}-M_{ba}$

代入计算：

$$
L=L_{aa}+L_{bb}-2M_{ab} \\
=\frac{3}{2}(L_{AAd}+L_{AAq})+\frac{1}{2}(L_{AAd}-L_{AAq})(cos2\theta  +cos(2\theta-\frac{4\pi}{3})+2cos(2\theta+\frac{\pi}{3}))  \\
=\frac{3}{2}(L_{AAd}+L_{AAq}) + \frac{3}{2}(L_{AAd}-L_{AAq})\cos (2\theta +\frac{\pi}{3})
$$

## 极值与 $d$/$q$ 轴电感

最大值：  3L_{AAq}=2L_{q}

  3L_{AAd}=2L_{d}

![motor-engineering-questions 插图 1](/images/posts/motor-engineering-questions/001-ff9b697d19.png)

## 永磁体磁链估算

利用线电压反电动势峰峰值估算永磁体磁链：

$$
\psi_f = \frac{V_{pp}}{2\sqrt{3}\,\omega_e}, \qquad \omega_e = 2\pi p_n f
$$

其中，$p_n$ 为极对数，$f$ 为机械转频率。使用该关系前应确认 $V_{pp}$ 的测量对象和速度单位与公式定义一致。
