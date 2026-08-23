---
title: "三相永磁同步电机建模与控制"
date: 2026-08-01 22:11:00
updated: 2026-08-23 23:15:00
description: "三相 PMSM 的建模假设、abc/αβ/dq 方程、Simulink 状态模型、SPMSM 简化、SVPWM 三种占空比算法与电流环；速度环、参数测量和谐波分析由关联文章维护。"
permalink: motor-control/three-phase-pmsm/
categories:
  - 电机控制
tags:
  - PMSM
  - 数学建模
  - 状态空间
  - Simulink
  - SVPWM
  - 电流环
aliases:
  - 三相 PMSM
  - PMSM FOC
  - 永磁同步电机建模
  - PMSM 数学模型
  - PMSM Simulink 模型
related_posts:
  - dual-three-phase-pmsm
  - pmsm-control-basics
  - pmsm-harmonic-analysis
  - pmsm-parameter-measurement
  - pmsm-speed-loop-pi-tuning
  - dengfoc-control-code
  - simulink-motor-simulation
  - motor-embedded-software-roadmap
source_docs:
  - "archive/original-posts/三相永磁同步电机.md"
  - "archive/incoming/2026-08-10/pmsm_mathematical_model.md"
review_status: human-verified
toc: true
mathjax: true
---

本文主线是三相电压输入、Clarke/Park 变换、旋转坐标系下的电气方程以及机械方程；随后给出可以直接拆成 Simulink 积分器的状态方程，并说明它与 SVPWM、电流环之间的接口。

<!-- more -->

## 一、建模目标、假设与符号

### 1.1 模型边界

本篇把电机本体作为一个连续时间状态空间对象。输入是电机端相对中性点的三相相电压和负载转矩，输出是相电流、转矩、机械角速度和转子电角度，本文所有 Clarke/Park 公式采用幅值不变约定。

采用以下假设：

1. 三相定子绕组对称，基波气隙磁场按正弦分布；
2. 忽略磁饱和、铁耗和空间谐波；
3. 永磁体磁链 $\psi_f$ 保持恒定；
4. 电机为星形连接且无中性线，输入电压是相对于电机浮动中性点的相电压，零序分量忽略，因此 $i_a+i_b+i_c=0$；
5. $d$ 轴与转子永磁体磁链方向重合，并约定正 $i_q$ 产生正电磁转矩。


### 1.2 符号约定

| 符号 | 含义 | 备注 |
| --- | --- | --- |
| $R_s$ | 相电阻 | $\Omega$ |
| $L_d、L_q$ | $d$、$q$ 轴电感 | H |
| $\psi_f$ | 永磁体磁链 | Wb |
| $p$ | 极对数 |  |
| $\omega_m$ | 机械角速度 | rad/s |
| $\omega_e$ | 电角速度 | $\omega_e=p\omega_m$ |
| $\theta_e$ | 转子电角度 | rad |
| $J$ | 转动惯量 | kg·m² |
| $B$ | 黏性阻尼系数 | N·m·s/rad |
| $T_L$ | 负载转矩 |  |

机械转速和机械角速度的换算为

$$
n_m=\frac{60}{2\pi}\omega_m.
$$


## 二、从三相静止坐标系到 dq 旋转坐标系

### 2.1 三相静止坐标系

三相定子电压方程写成向量形式：

$$
\boldsymbol{v}_{abc}
=R_s\boldsymbol{i}_{abc}
+\frac{\mathrm d\boldsymbol{\psi}_{abc}}{\mathrm dt},
\qquad
\boldsymbol{v}_{abc}=
\begin{bmatrix}v_a&v_b&v_c\end{bmatrix}^{\mathsf T}.
$$

更一般地，三相磁链可写成

$$
\boldsymbol{\psi}_{abc}
=\boldsymbol{L}_{abc}(\theta_e)\boldsymbol{i}_{abc}
+\boldsymbol{\psi}_{f,abc}(\theta_e).
$$

$\boldsymbol{L}_{abc}$ 随角度位置变化。

### 2.2 幅值不变 Clarke 变换

对任意三相量 $x_a,x_b,x_c$（电压、电流或磁链）定义

$$
\begin{bmatrix}
x_\alpha\\
x_\beta
\end{bmatrix}
=
\frac{2}{3}
\begin{bmatrix}
1&-\frac12&-\frac12\\
0&\frac{\sqrt3}{2}&-\frac{\sqrt3}{2}
\end{bmatrix}
\begin{bmatrix}
x_a\\
x_b\\
x_c
\end{bmatrix}.
$$

在无中性线的平衡模型中，零序量为零，反变换为

$$
\begin{bmatrix}
x_a\\
x_b\\
x_c
\end{bmatrix}
=
\begin{bmatrix}
1&0\\
-\frac12&\frac{\sqrt3}{2}\\
-\frac12&-\frac{\sqrt3}{2}
\end{bmatrix}
\begin{bmatrix}
x_\alpha\\
x_\beta
\end{bmatrix}.
$$



### 2.3 Park 变换

以转子电角度 $\theta_e$ 为参考，将静止 $\alpha\beta$ 量变到同步旋转坐标系：

$$
\begin{bmatrix}
x_d\\
x_q
\end{bmatrix}
=
\begin{bmatrix}
\cos\theta_e&\sin\theta_e\\
-\sin\theta_e&\cos\theta_e
\end{bmatrix}
\begin{bmatrix}
x_\alpha\\
x_\beta
\end{bmatrix}.
$$

在稳态同步运行、且参考角度与转子基波磁链一致时，基波 $d$、$q$ 量可以近似为直流量。

### 2.4 dq 磁链和电压方程

同步旋转坐标系中的磁链方程为

$$
\begin{aligned}
\psi_d&=L_di_d+\psi_f,\\
\psi_q&=L_qi_q.
\end{aligned}
$$

旋转坐标系电压方程为

$$
\begin{aligned}
v_d&=R_si_d+\frac{\mathrm d\psi_d}{\mathrm dt}-\omega_e\psi_q,\\
v_q&=R_si_q+\frac{\mathrm d\psi_q}{\mathrm dt}+\omega_e\psi_d.
\end{aligned}
$$

代入磁链关系后得到可用于求解电流的形式：

$$
\begin{aligned}
v_d&=R_si_d+L_d\frac{\mathrm di_d}{\mathrm dt}
-\omega_eL_qi_q,\\
v_q&=R_si_q+L_q\frac{\mathrm di_q}{\mathrm dt}
+\omega_e\left(L_di_d+\psi_f\right).
\end{aligned}
$$

其中 $-\omega_eL_qi_q$ 和 $\omega_e(L_di_d+\psi_f)$ 是旋转坐标系引入的速度耦合项及反电动势项。

## 三、电磁转矩与机械方程

在上述幅值不变、正转矩约定下，电磁转矩为

$$
T_e
=\frac{3}{2}p\left(\psi_di_q-\psi_qi_d\right)
=\frac{3}{2}p\left[\psi_fi_q+\left(L_d-L_q\right)i_di_q\right].
$$

第一项是永磁转矩，第二项是凸极引起的磁阻转矩。

机械运动方程为

$$
J\frac{\mathrm d\omega_m}{\mathrm dt}
=T_e-T_L-B\omega_m,
$$

转子位置方程为

$$
\frac{\mathrm d\theta_e}{\mathrm dt}
=\omega_e=p\omega_m.
$$


## 四、 Simulink 完整状态模型

### 4.1 输入、状态和参数

以三相相电压和负载转矩为输入：

$$
\boldsymbol{u}=
\begin{bmatrix}
v_a&v_b&v_c&T_L
\end{bmatrix}^{\mathsf T},
\qquad
\boldsymbol{x}=
\begin{bmatrix}
i_d&i_q&\omega_m&\theta_e
\end{bmatrix}^{\mathsf T}.
$$

模型参数至少包括 $R_s,L_d,L_q,\psi_f,p,J,B$。

### 4.2 四个状态导数

$$
\begin{aligned}
\dot i_d
&=\frac{v_d-R_si_d+p\omega_mL_qi_q}{L_d},\\
\dot i_q
&=\frac{v_q-R_si_q-p\omega_m\left(L_di_d+\psi_f\right)}{L_q},\\
\dot\omega_m
&=\frac{T_e-T_L-B\omega_m}{J},\\
\dot\theta_e
&=p\omega_m.
\end{aligned}
$$


### 4.3 输出

由 $i_d,i_q$ 反变换可得到相电流：

$$
\begin{aligned}
i_\alpha&=i_d\cos\theta_e-i_q\sin\theta_e,\\
i_\beta&=i_d\sin\theta_e+i_q\cos\theta_e,
\end{aligned}
$$

再由逆 Clarke 变换得到

$$
\begin{aligned}
i_a&=i_\alpha,\\
i_b&=-\frac12i_\alpha+\frac{\sqrt3}{2}i_\beta,\\
i_c&=-\frac12i_\alpha-\frac{\sqrt3}{2}i_\beta.
\end{aligned}
$$

建议记录 $i_a,i_b,i_c,i_d,i_q,T_e,\omega_m,\theta_e$。



## 五、SPMSM 简化

表贴式 PMSM（SPMSM）通常可近似为

$$
L_d=L_q=L_s.
$$

此时磁阻转矩消失，转矩方程简化为

$$
T_e=\frac{3}{2}p\psi_fi_q.
$$

在基速范围内的常规 FOC 中，常令 $i_d^{\ast}=0$，用 $i_q$ 直接调节转矩。

## 六、SVPWM

电流环输出电压指令 $v_d^{\ast},v_q^{\ast}$，而逆变器最终需要的是三相桥臂的门极信号。

实现前必须先区分三种电压：

1. $v_d^{\ast},v_q^{\ast}$ 是电流调节器输出的旋转坐标系电压；
2. $v_\alpha^{\ast},v_\beta^{\ast}$ 是逆 Park 变换后的静止坐标系参考；
3. $v_{aN},v_{bN},v_{cN}$ 是电机绕组相对中性点 $N$ 的电压；

$$
v_{NO}=\frac{v_{aO}+v_{bO}+v_{cO}}{3}
$$

### 6.1 两电平逆变器与空间电压矢量

三个上桥臂的开关状态为 $s_a,s_b,s_c\in\{0,1\}$

$$
\boldsymbol{v}_s
=\frac{2}{3}V_{\mathrm{dc}}
\left(s_a+s_b e^{j\frac{2\pi}{3}}+s_c e^{j\frac{4\pi}{3}}\right).
$$

八个开关状态对应两个零矢量和六个有功矢量：

| 状态 | 矢量 | 角度  |
| --- | --- | ---:  |
| 000、111 | $V_0$、$V_7$ | —  |
| 100 | $V_1$ | $0^\circ$  |
| 110 | $V_2$ | $60^\circ$  |
| 010 | $V_3$ | $120^\circ$  |
| 011 | $V_4$ | $180^\circ$  |
| 001 | $V_5$ | $240^\circ$  |
| 101 | $V_6$ | $300^\circ$  |

六个有功矢量幅值均为 $2V_{\mathrm{dc}}/3$。
![SVPWM 六扇区空间矢量图](/images/posts/three-phase-pmsm/image1.png)

### 6.2 伏秒平衡与作用时间
由正弦定理得到

$$
\begin{aligned}
T_1&=\frac{\sqrt{3}T_sU^{*}}{V_{\mathrm{dc}}}
\sin\left(\frac{\pi}{3}-\theta_s\right),\\
T_2&=\frac{\sqrt{3}T_sU^{*}}{V_{\mathrm{dc}}}\sin\theta_s.
\end{aligned}
$$

 $T_1+T_2\leq T_s$，等价于

$$
U^{*}\leq\frac{V_{\mathrm{dc}}}{\sqrt{3}\cos(\theta_s-\pi/6)}.
$$

如果参考矢量幅值保持不变并完整旋转一周，为避免任意角度进入过调制区，取该逐点边界的最小值，得到常用圆形上限

$$
U^{*}\leq\frac{V_{\mathrm{dc}}}{\sqrt{3}}.
$$

### 6.3 对称开关序列与占空比

以扇区 1 为例，采用中心对称序列

$$
000\;\frac{T_0}{4}
\rightarrow100\;\frac{T_1}{2}
\rightarrow110\;\frac{T_2}{2}
\rightarrow111\;\frac{T_0}{2}
\rightarrow110\;\frac{T_2}{2}
\rightarrow100\;\frac{T_1}{2}
\rightarrow000\;\frac{T_0}{4}.
$$

上桥臂占空比由对应开关为 1 的总时间除以 $T_s$ 得到：

$$
d_a=\frac{T_0/2+T_1+T_2}{T_s},
\qquad
d_b=\frac{T_0/2+T_2}{T_s},
\qquad
d_c=\frac{T_0/2}{T_s}.
$$

令

$$
h_0=\frac{T_0}{2T_s},
\qquad
h_1=\frac{T_1}{T_s},
\qquad
h_2=\frac{T_2}{T_s},
$$

其中 $T_1$ 始终对应当前扇区的起始有功矢量，$T_2$ 对应终止矢量。六个扇区只需轮换三相占空比：

| 扇区 $k$ | $d_a$ | $d_b$ | $d_c$ |
| --- | --- | --- | --- |
| 1 | $h_0+h_1+h_2$ | $h_0+h_2$ | $h_0$ |
| 2 | $h_0+h_1$ | $h_0+h_1+h_2$ | $h_0$ |
| 3 | $h_0$ | $h_0+h_1+h_2$ | $h_0+h_2$ |
| 4 | $h_0$ | $h_0+h_1$ | $h_0+h_1+h_2$ |
| 5 | $h_0+h_2$ | $h_0$ | $h_0+h_1+h_2$ |
| 6 | $h_0+h_1+h_2$ | $h_0$ | $h_0+h_1$ |

![扇区 1 三相上桥臂波形](/images/posts/three-phase-pmsm/image2.png)


### 6.4 算法构建：由 αβ 电压计算三相占空比

设直流母线电压为 $V_{\mathrm{dc}}$、PWM 周期为 $T_s$，并先保证参考矢量处在线性调制区。三种方法都基于同一个目标：在一个周期内满足伏秒平衡

$$
\boldsymbol v^{*}T_s=\boldsymbol V_kT_1+\boldsymbol V_{k^+}T_2,
\qquad
k^+=\begin{cases}k+1,&k<6,\\1,&k=6,\end{cases}
\qquad
T_0=T_s-T_1-T_2,
$$

再把 $T_1,T_2,T_0$ 按 6.3 节的对称序列换算为 $d_a,d_b,d_c$。区别只在于作用时间（或占空比）的求法。

#### 方法一：角度—作用时间法

由 $v_\alpha^{\ast},v_\beta^{\ast}$ 求参考矢量的幅值和角度：

$$
U^{*}=\sqrt{(v_\alpha^{*})^2+(v_\beta^{*})^2},
\qquad
\varphi=\operatorname{atan2}(v_\beta^{*},v_\alpha^{*}).
$$

将 $\varphi$ 归一化到 $[0,2\pi)$，确定扇区

$$
k=\left\lfloor\frac{\varphi}{\pi/3}\right\rfloor+1,
\qquad
\theta_s=\varphi-(k-1)\frac{\pi}{3}.
$$

用正弦定理求相邻有功矢量的作用时间：

$$
\begin{aligned}
T_1&=\frac{\sqrt{3}T_sU^{*}}{V_{\mathrm{dc}}}
       \sin\left(\frac{\pi}{3}-\theta_s\right),\\
T_2&=\frac{\sqrt{3}T_sU^{*}}{V_{\mathrm{dc}}}\sin\theta_s,\\
T_0&=T_s-T_1-T_2.
\end{aligned}
$$

令 $h_0=T_0/(2T_s)$、$h_1=T_1/T_s$、$h_2=T_2/T_s$，代入 6.3 节表格即可得到三相占空比。该方法几何意义清楚，但需要 `atan2` 和三角函数。

当 $U^{\ast}=0$ 时不需要判断扇区，直接取 $d_a=d_b=d_c=1/2$。

#### 方法二：X/Y/Z 线性组合法

把伏秒平衡方程直接投影到固定的 $\alpha\beta$ 轴，得到三个线性组合。令

$$
K=\frac{\sqrt{3}T_s}{V_{\mathrm{dc}}},
\qquad
\begin{aligned}
X&=K v_\beta^{*},\\
Y&=K\left(\frac{\sqrt{3}}{2}v_\alpha^{*}+\frac12v_\beta^{*}\right),\\
Z&=K\left(-\frac{\sqrt{3}}{2}v_\alpha^{*}+\frac12v_\beta^{*}\right).
\end{aligned}
$$

它们本质上是按三条有功矢量方向得到的“候选作用时间”，例如也可写成

$$
X=\frac{T_s}{V_{\mathrm{dc}}}(v_b^{*}-v_c^{*}),\quad
Y=\frac{T_s}{V_{\mathrm{dc}}}(v_a^{*}-v_c^{*}),\quad
Z=-\frac{T_s}{V_{\mathrm{dc}}}(v_a^{*}-v_b^{*}).
$$

根据扇区选择符号：

| 扇区 $k$ | $T_1$ | $T_2$ |
| --- | --- | --- |
| 1 | $-Z$ | $X$ |
| 2 | $Y$ | $Z$ |
| 3 | $X$ | $-Y$ |
| 4 | $Z$ | $-X$ |
| 5 | $-Y$ | $-Z$ |
| 6 | $-X$ | $Y$ |

随后同样计算 $T_0$ 和 $h_0,h_1,h_2$，再查 6.3 节表格。该方法仍需通过符号或三相电压大小关系判断扇区，但没有角度和三角函数；$X,Y,Z$ 不是额外的物理量，而是伏秒方程的线性投影。

#### 方法三：公共模式注入法

逆 Clarke 变换先得到三相参考电压：

$$
v_a^{*}=v_\alpha^{*},\qquad
v_b^{*}=-\frac12v_\alpha^{*}+\frac{\sqrt{3}}{2}v_\beta^{*},\qquad
v_c^{*}=-\frac12v_\alpha^{*}-\frac{\sqrt{3}}{2}v_\beta^{*}.
$$

给三相同时加上公共模式不会改变线电压，也不会改变 $\alpha\beta$ 矢量。取三相最大值与最小值中点的相反数作为公共模式电压：

$$
v_{\mathrm{cm}}=-\frac12\left[
\max(v_a^{*},v_b^{*},v_c^{*})+
\min(v_a^{*},v_b^{*},v_c^{*})\right].
$$

令 $u_x^{\ast}=v_x^{\ast}+v_{\mathrm{cm}}$。以直流母线中点为零电位，桥臂平均电压满足 $u_x^{\ast}=V_{\mathrm{dc}}(d_x-1/2)$，因此上桥臂占空比为

$$
d_x=\frac12+\frac{u_x^{*}}{V_{\mathrm{dc}}},
\qquad x\in\{a,b,c\}.
$$

当 $\max(v_a^{\ast},v_b^{\ast},v_c^{\ast})-\min(v_a^{\ast},v_b^{\ast},v_c^{\ast})\leq V_{\mathrm{dc}}$ 时，占空比均在 $[0,1]$ 内。该方法不需要作用时间、三角函数或显式扇区判断，在线性区内与前两种方法等价；超出边界时应统一缩放参考矢量或采用过调制策略，不能分别裁剪三相占空比。

三种方法的输入和输出相同：方法一适合推导，方法二适合无三角函数实现，方法三计算链最短。若输入为 $v_d^{\ast},v_q^{\ast}$，逆 Park 变换所需的三角函数属于前级坐标变换，而不是 SVPWM 占空比算法本身。


## 七、dq 电流环 PI 与解耦


### 7.1 解耦

采用本文的符号约定，PMSM 的 dq 电压方程可写成

$$
\begin{aligned}
L_d\dot i_d&=v_d-R_si_d+\omega_eL_qi_q,\\
L_q\dot i_q&=v_q-R_si_q-\omega_e\left(L_di_d+\psi_f\right).
\end{aligned}
$$

加入前馈补偿，把已知的耦合项抵消：

$$
\boxed{
\begin{aligned}
v_d^{*}&=u_d-\omega_eL_qi_q,\\
v_q^{*}&=u_q+\omega_e\left(L_di_d+\psi_f\right).
\end{aligned}}
$$


$$
L_d\dot i_d=u_d-R_si_d,
$$

q 轴同理。这样两个电流环就近似成为两个相互独立的 RL 一阶对象。

低速时这些补偿较小，转速越高，数值越大，它们通常越重要。

### 7.2 PI 参数怎么选

电机的电流开环传递函数为：

$$
G(s)=\frac{1}{Ls+R_s}.
$$

选一个期望电流环带宽 $a$（单位为 rad/s），用 PI 零点抵消 $R_s/L$ 极点，并令闭环速度约为 $a$，可得到简单的初始参数：

$$
\begin{aligned}
K_{pd}&=aL_d,&K_{id}&=aR_s,\\
K_{pq}&=aL_q,&K_{iq}&=aR_s.
\end{aligned}
$$

抵消以后，以单轴为例，PI 和电机对象组成的开环传递函数为

$$
C(s)G(s)
=\left(K_p+\frac{K_i}{s}\right)\frac{1}{Ls+R_s}
=\frac{a}{s}.
$$

$a/s$ 是积分环节，但它只是开环传递函数。接成单位负反馈后，给定电流到实际电流的闭环传递函数为

$$
\frac{i(s)}{i^{*}(s)}
=\frac{a/s}{1+a/s}
=\frac{a}{s+a}.
$$

因此理想电流环是一个稳定的一阶系统：时间常数为 $1/a$，带宽约为 $a$，阶跃响应没有超调，约经过 $4/a$ 秒进入 2% 误差范围。$a$ 越大，响应越快，但实际还要为 PWM、采样和计算延迟留出余量。
