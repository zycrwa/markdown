---
title: "三相永磁同步电机建模与控制"
date: 2026-08-01 22:11:00
updated: 2026-08-22 19:14:00
description: "面向建模、仿真与分析，整理三相 PMSM 的建模假设、abc/αβ/dq 方程、可直接实现的 Simulink 状态模型、SPMSM 简化、SVPWM 与电流环；速度环、参数测量和谐波分析由关联文章维护。"
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
review_status: unverified
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

第 4 条是仿真接线时最容易被忽略的边界：逆变器模型常输出相对直流侧参考点 $O$ 的桥臂极点电压，而极点电压不等于绕组相对浮动中性点 $N$ 的相电压。在理想对称、无零序通路的模型中，共同偏置由中性点位移消去，例如

$$
v_{NO}=\frac{v_{aO}+v_{bO}+v_{cO}}{3},
\qquad
v_{aN}=v_{aO}-v_{NO},
$$

$b$、$c$ 两相同理。非理想逆变器或存在零序通路时，应按实际拓扑另建中性点和共模模型。

### 1.2 符号约定

| 符号 | 含义 | 备注 |
| --- | --- | --- |
| $R_s$ | 定子每相电阻 | $\Omega$ |
| $L_d,L_q$ | $d$、$q$ 轴电感 | H；IPMSM 中通常不相等 |
| $\psi_f$ | 永磁体磁链 | Wb |
| $p$ | 极对数 |  |
| $\omega_m$ | 机械角速度 | rad/s |
| $\omega_e$ | 电角速度 | $\omega_e=p\omega_m$ |
| $\theta_e$ | 转子电角度 | rad |
| $J$ | 转动惯量 | kg·m² |
| $B$ | 黏性阻尼系数 | N·m·s/rad |
| $T_L$ | 负载转矩 | 正值表示阻转矩 |

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

$\boldsymbol{L}_{abc}$ 随位置变化； Clarke/Park 后吸收到常数 $L_d,L_q$ 中。

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

### 2.4 $dq$ 磁链和电压方程

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

这组方程可以直接映射为四个积分器。连续 Simulink 模型中的信号流和求解关系为：

1. 从 $\theta_e$、$\omega_m$ 得到 Park 角度和 $\omega_e$；
2. 将 $v_a,v_b,v_c$ 变换为 $v_d,v_q$；
3. 用当前状态计算 $T_e$ 和 $\dot i_d,\dot i_q$；
4. 用机械方程计算 $\dot\omega_m$，并把四个状态导数交给求解器；
5. 求解器同步更新四个积分器状态，取模后的 $\theta_e$ 只用于生成变换矩阵。


### 4.3 输出和初值

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

初值应显式设置为 $i_d(0),i_q(0),\omega_m(0),\theta_e(0)$。电机从静止、未通电状态启动时可先全部取 0；若用于带初始转速或已知转子位置的工况，则必须使初值与反电动势、Park 角度和外部机械负载保持一致。建议记录 $i_a,i_b,i_c,i_d,i_q,T_e,\omega_m,\theta_e$。



## 五、SPMSM 简化

表贴式 PMSM（SPMSM）通常可近似为

$$
L_d=L_q=L_s.
$$

此时磁阻转矩消失，转矩方程简化为

$$
T_e=\frac{3}{2}p\psi_fi_q.
$$

在基速范围内的常规 FOC 中，常令 $i_d^*=0$，用 $i_q$ 直接调节转矩。

## 六、SVPWM 与电机模型的接口

SVPWM 的职责是把 $\alpha\beta$ 电压参考和直流母线电压转换为三相桥臂占空比；电机状态方程接收的是经过逆变器等效后的相电压。两者之间的电压定义必须保持一致。

![两电平逆变器空间电压矢量示意](/images/posts/three-phase-pmsm/008-101a794e41.png)

### 6.1 开关状态和空间电压矢量

令上桥臂开关状态 $s_a,s_b,s_c\in\{0,1\}$，在幅值不变 Clarke 约定下，空间电压矢量可写成

$$
\boldsymbol{v}_s
=\frac{2}{3}V_{\mathrm{dc}}
\left(s_a+s_b e^{j\frac{2\pi}{3}}+s_c e^{j\frac{4\pi}{3}}\right).
$$

000 和 111 是两个零矢量；100、110、010、011、001、101 是六个等幅有功矢量，幅值均为 $2V_{\mathrm{dc}}/3$，相邻矢量相差 $\pi/3$。因此一个两电平逆变器共有八个开关状态，而不是七个。

![SVPWM 的 Simulink 计算结构示意](/images/posts/three-phase-pmsm/011-e0d36c6679.png)

![SVPWM 在 alpha-beta 平面中的扇区判定边界](/images/posts/three-phase-pmsm/015-c40ec60a28.png)

### 6.2 线性区作用时间

设参考矢量幅值为 $U^*$，位于某一扇区内，且相对该扇区起始矢量的角度为 $\theta_s\in[0,\pi/3]$。相邻两个有功矢量的作用时间为

$$
\begin{aligned}
T_1&=\frac{\sqrt{3}T_sU^*}{V_{\mathrm{dc}}}
\sin\left(\frac{\pi}{3}-\theta_s\right),\\
T_2&=\frac{\sqrt{3}T_sU^*}{V_{\mathrm{dc}}}
\sin\theta_s,\\
T_0&=T_s-T_1-T_2.
\end{aligned}
$$

逐点的线性调制条件是 $T_1+T_2\leq T_s$，即

$$
U^*
\leq
\frac{V_{\mathrm{dc}}}
{\sqrt{3}\cos\left(\theta_s-\frac{\pi}{6}\right)}.
$$

若希望幅值恒定的旋转参考在所有角度均不进入过调制区，则采用圆形轨迹上限 $U^*\leq V_{\mathrm{dc}}/\sqrt{3}$。若某一时刻超出逐点条件，可按

$$
\kappa=\frac{T_s}{T_1+T_2},\qquad
T_1\leftarrow\kappa T_1,\qquad
T_2\leftarrow\kappa T_2,\qquad
T_0\leftarrow 0
$$

进行限幅。缩放后 $T_1+T_2=T_s$，因此必须同步重算 $T_0$，不能继续使用限幅前的负值。这是一种保持方向的过调制前处理，不能替代专门的过调制策略。

以第一扇区的对称序列 000-100-110-111-110-100-000 为例，将零矢量总时间 $T_0$ 在 000 和 111 之间各分一半：周期两端的 000 各作用 $T_0/4$，中央的 111 作用 $T_0/2$；两个有功矢量每次分别作用 $T_1/2$、$T_2/2$。此时占空比为

$$
\begin{aligned}
d_a&=\frac{T_0/2+T_1+T_2}{T_s},\\
d_b&=\frac{T_0/2+T_2}{T_s},\\
d_c&=\frac{T_0/2}{T_s}.
\end{aligned}
$$

为了避免在代码中凭相序轮换，先将参考矢量角度归一化到 $\varphi\in[0,2\pi)$，再定义

$$
k=\left\lfloor\frac{\varphi}{\pi/3}\right\rfloor+1,
\qquad
\theta_s=\varphi-(k-1)\frac{\pi}{3}.
$$

扇区边界上任取相邻扇区之一即可。令

$$
h_0=\frac{T_0}{2T_s},\qquad
h_1=\frac{T_1}{T_s},\qquad
h_2=\frac{T_2}{T_s},
$$

其中 $T_1$ 对应扇区起始有功矢量，$T_2$ 对应下一个有功矢量，六个扇区的对称调制占空比可直接写成：

| 扇区 $k$ | $d_a$ | $d_b$ | $d_c$ |
| --- | --- | --- | --- |
| 1 | $h_0+h_1+h_2$ | $h_0+h_2$ | $h_0$ |
| 2 | $h_0+h_1$ | $h_0+h_1+h_2$ | $h_0$ |
| 3 | $h_0$ | $h_0+h_1+h_2$ | $h_0+h_2$ |
| 4 | $h_0$ | $h_0+h_1$ | $h_0+h_1+h_2$ |
| 5 | $h_0+h_2$ | $h_0$ | $h_0+h_1+h_2$ |
| 6 | $h_0+h_1+h_2$ | $h_0$ | $h_0+h_1$ |

工程实现应对 $d_a,d_b,d_c$ 做 $[0,1]$ 限幅，并将死区、最小脉宽和采样延迟作为逆变器模型的独立参数。

## 七、dq 电流环 PI 与解耦

由电压模型可得电流状态方程

$$
\begin{aligned}
\dot i_d&=-\frac{R_s}{L_d}i_d
+\frac{\omega_eL_q}{L_d}i_q+\frac{v_d}{L_d},\\
\dot i_q&=-\frac{R_s}{L_q}i_q
-\frac{\omega_e}{L_q}\left(L_di_d+\psi_f\right)
+\frac{v_q}{L_q}.
\end{aligned}
$$

把速度耦合和反电动势作为前馈项，PI 输出可以写成

$$
\begin{aligned}
v_d^*&=\left(K_{pd}+\frac{K_{id}}{s}\right)(i_d^*-i_d)
-\omega_eL_qi_q,\\
v_q^*&=\left(K_{pq}+\frac{K_{iq}}{s}\right)(i_q^*-i_q)
+\omega_e\left(L_di_d+\psi_f\right).
\end{aligned}
$$

![内模控制结构示意](/images/posts/three-phase-pmsm/017-43a04f7970.png)

在忽略 PWM 和采样延迟、且参数模型准确时，内模一阶目标 $a/(s+a)$ 给出一组便于仿真的初始参数：

$$
\begin{aligned}
K_{pd}&=aL_d,&K_{id}&=aR_s,\\
K_{pq}&=aL_q,&K_{iq}&=aR_s.
\end{aligned}
$$

若把 PWM 延迟和电流反馈滤波合并为小时间常数 $T_{\Sigma i}$，并假设 PI 零点抵消电机的 $L/R_s$ 极点、逆变器与反馈通道的等效增益均为 1，再取阻尼比 $\zeta=1/\sqrt{2}$，可在解耦后得到典型二阶近似

$$
K_p=\frac{L}{2T_{\Sigma i}},\qquad
K_i=\frac{R_s}{2T_{\Sigma i}},
$$

其中 $L$ 应分别取 $L_d$ 或 $L_q$。这两个公式依赖于延迟模型、阻尼比和限幅假设，适合作为初值而不是未经验证的最终参数。PI 输出还应受可用电压矢量限制，并配合积分抗饱和。

转速环的完整假设、推导和闭环验证见 [PMSM 转速环 PI 参数整定推导](/motor-control/pmsm-speed-loop-pi-tuning/)，这里不再重复。FOC 代码和三环实现可参见 [DengFOC 常用控制代码与三环结构](/motor-control/dengfoc-control-code/)。

## 八、来源、验证说明与关联文章

本次入库的原始笔记没有附文献、实验数据或仿真工程，因此新增的假设和状态方程仍属于待核验的 AI 整理内容。原有资料保留了两条参考来源：

- [《永磁同步电机矢量控制分析》](https://kns.cnki.net/kcms2/article/abstract?v=VYuoLtjwl8P-o469VFroH7GQMvioLWRnqoIhXpNcJele2FkWEn5qLP4KNcDl259e6Bp5ocFPRg_AJ1AjyuLnXXTqV5bPifsy4R2DshF4EllA-FQkPBFlJ2taaBqwalb_6dV5a27Z25kvhu29GPyXP1IRtyjHuPyilSsPS90hIVM=&uniplatform=NZKPT)，原稿将其用于电机模型推导；
- [《永磁同步电动机驱动系统数字 PI 调节器参数设计》](https://kns.cnki.net/kcms2/article/abstract?v=lSOmZDqoX8NczW9XDV0VUxaCWkNGTEqyDkS6bg3WjoEPz2DQNycJR0HKl5JvSLYGhU2f0t16vkpF3KMmy_DIuWrjgpu5E12HKjKzHREJXp9ODdlh1wHYA1CIMllSPXDgJ_vHVpCrbaK76edcrYAST9Ao8HH8BI38&uniplatform=NZKPT)，原稿将其用于 PI 环节设计。

两条链接的可访问性、原文结论和本文参数定义均未在本次处理中复核。

需要谐波、六相或 VSD 分析时，转到 [PMSM 谐波与六相矢量空间分析](/motor-control/pmsm-harmonic-analysis/)；需要 Simulink 模块、采样时间和模型组织建议时，参见 [Simulink 电机控制仿真常用模块与建议](/simulation/simulink-motor-simulation/)。模型参数的测量换算见 [PMSM 电感与磁链参数测量](/motor-control/pmsm-parameter-measurement/)。这些文章保持独立，以免把理想电机本体方程、参数来源和控制实现混在同一段中。
