---
title: "三相永磁同步电机建模与控制"
date: 2026-08-01 22:11:00
description: "系统整理三相 PMSM 数学模型、SVPWM、电流环和经典双闭环控制。"
permalink: motor-control/three-phase-pmsm/
categories:
  - 电机控制
tags:
  - PMSM
  - 数学建模
  - SVPWM
  - 电流环
toc: true
mathjax: true
---

本文以三相永磁同步电机为对象，从机械方程和三相静止坐标模型出发，推导坐标变换、SVPWM 和电流环设计，并把转速环与参数辨识拆分为独立文章以避免重复。

<!-- more -->

## 一、永磁同步电机数学建模
### 一、视频课程中的推导形式
![three-phase-pmsm 插图 1](/images/posts/three-phase-pmsm/001-5740e6f2f0.png)

![three-phase-pmsm 插图 2](/images/posts/three-phase-pmsm/002-20ce192cde.png)

磁链和电感的关系

![坐标变换矩阵](/images/posts/three-phase-pmsm/003-4e109a6099.png)

![电压方程坐标变换](/images/posts/three-phase-pmsm/004-9db99f1226.png)

![磁链方程](/images/posts/three-phase-pmsm/005-6fe4f1734a.png)

![此处左边的l_d,L_q,L_0实际上是想要放原本的矩阵](/images/posts/three-phase-pmsm/006-7a09d8146c.png)

### 二、论文中的推导形式
![three-phase-pmsm 插图 7](/images/posts/three-phase-pmsm/007-d5a2b32c6e.webp)

### 1.1 机械分析—运动方程
$ J\frac{d\omega_m}{dt} = T_e - T_L - B\omega_m $

式中：

+ $\omega_m$：电机的机械角速度
+ $J$：转动惯量
+ $ B $：阻尼系数
+ $ T_L $：负载转矩
+ $T_e$：电磁转矩

$$
\begin{cases}
\omega_m = \omega_e / P_n \\
N_r = 60\dfrac{\omega_m}{2\pi} = 30\omega_m / \pi \\
\theta_e = \displaystyle\int_0^t \omega_e dt
\end{cases}
$$

式中：

+ $ \omega_e $：电角速度
+ $ P_n $：极对数
+ $N_r$：电机转速（ r/min ）
+ $ \theta_e $：转子电角度

### 1.2 三相静止坐标系的数学模型
#### 1.2.1 电压方程
$$
\begin{bmatrix}
u_a \\
u_b \\
u_c
\end{bmatrix}
=
\begin{bmatrix}
R_s & 0 & 0 \\
0 & R_s & 0 \\
0 & 0 & R_s
\end{bmatrix}
\begin{bmatrix}
i_a \\
i_b \\
i_c
\end{bmatrix}
+
\frac{d}{dt}
\begin{bmatrix}
\Psi_a \\
\Psi_b \\
\Psi_c
\end{bmatrix}
$$

式中：

+ $ R_s $：定子绕组的电枢电阻
+ $ \Psi_a,\Psi_b,\Psi_c $：a、b、c 三相磁链
+ $ i_a,i_b,i_c $：a、b、c 三相相电流

#### 1.2.2 磁链方程
$$
\begin{bmatrix}
\Psi_a \\
\Psi_b \\
\Psi_c
\end{bmatrix}
=
\begin{bmatrix}
L_{aa} & M_{ab} & M_{ac} \\
M_{ba} & L_{bb} & M_{bc} \\
M_{ca} & M_{cb} & L_{cc}
\end{bmatrix}
\begin{bmatrix}
i_a \\
i_b \\
i_c
\end{bmatrix}
+
\Psi_f
\begin{bmatrix}
\cos(\theta) \\
\cos(\theta-2\pi/3) \\
\cos(\theta+2\pi/3)
\end{bmatrix}
$$

$$
\begin{bmatrix}
\Psi_a \\
\Psi_b \\
\Psi_c
\end{bmatrix}
=
\begin{bmatrix}
L_{aa} & M_{ab} & M_{ac} \\
M_{ba} & L_{bb} & M_{bc} \\
M_{ca} & M_{cb} & L_{cc}
\end{bmatrix}
\begin{bmatrix}
i_a \\
i_b \\
i_c
\end{bmatrix}
+
\Psi_f
\begin{bmatrix}
\cos(\theta) \\
\cos(\theta-2\pi/3) \\
\cos(\theta+2\pi/3)
\end{bmatrix}
$$

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

此处互感的角度：当-30 的时候，Mab 的磁阻最大，当 60 的时候，Mab 的磁阻最小 Mab 最小

$$
L_q=\frac{3}{2}L_{AAq}\\
L_d=\frac{3}{2}L_{AAd}
$$

等幅值变换下的电感变换，忽略了漏感

式中：

+ $ L_{aa},L_{bb},L_{cc} $：各相绕组自感，与转子位置有关
+ $ M_{ab},M_{bc},M_{ca} $：绕组之间的互感，该互感一定是一个负值
+ $ \Psi_f $：永磁体磁链
+ $ \theta $：转子的电角度

L1 : 漏自感，磁感线没有通过转子

L_AAd ：d 轴对准 A 相绕组轴线，由于 d 轴是永磁体， L_AAd 小于 L_AAq

L_AAq ：q 轴 对准 A 相绕组轴线

M_{\sigma}：A、B 两相定子绕组漏互感平均值

+ 注：$ L_{aa} $中$ L_1、L_2 $和$ M_{ab} $不同。[论文参考_永磁同步电机矢量控制分析_龙明贵](https://kns.cnki.net/kcms2/article/abstract?v=VYuoLtjwl8P-o469VFroH7GQMvioLWRnqoIhXpNcJele2FkWEn5qLP4KNcDl259e6Bp5ocFPRg_AJ1AjyuLnXXTqV5bPifsy4R2DshF4EllA-FQkPBFlJ2taaBqwalb_6dV5a27Z25kvhu29GPyXP1IRtyjHuPyilSsPS90hIVM=&uniplatform=NZKPT)

#### 1.2.3 Clarke 变换
Clarke 变换的作用是将 **abc 三相静止坐标系**下的电压、电流、磁链等物理量，转换到 **αβ 两相静止坐标系**中。在 αβ 坐标系中，虚拟电机有两个相差 90° 的绕组，分别为直轴（α 轴）和交轴（β 轴），其中 α 轴与 abc 坐标系的 a 轴重合。

$$
\begin{bmatrix}
u_a \\
u_b \\
u_c
\end{bmatrix}
= U
\begin{bmatrix}
\cos(\omega t) \\
\cos\left(\omega t-\frac{2\pi}{3}\right) \\
\cos\left(\omega t+\frac{2\pi}{3}\right)
\end{bmatrix}
$$

式中：

+ $ U $：相电压幅值
+ $ \omega = 2\pi f $：三相交流电压角频率
+ $ f $：电压频率

$$
\begin{bmatrix}
u_\alpha \\
u_\beta \\
u_o
\end{bmatrix}
= T_{3s/2s}u(abc)
= \frac{2}{3}
\begin{bmatrix}
1 & -1/2 & -1/2 \\
0 & \sqrt{3}/2 & -\sqrt{3}/2 \\
\sqrt{3}/2 & \sqrt{3}/2 & \sqrt{3}/2
\end{bmatrix}
\begin{bmatrix}
u_a \\
u_b \\
u_c
\end{bmatrix}
$$

Clarke 正变换（abc → αβ0）

$$
\begin{bmatrix}
i_\alpha \\
i_\beta \\
i_o
\end{bmatrix}
= T_{3s/2s}i(abc)
= \frac{2}{3}
\begin{bmatrix}
1 & -1/2 & -1/2 \\
0 & \sqrt{3}/2 & -\sqrt{3}/2 \\
\sqrt{3}/2 & \sqrt{3}/2 & \sqrt{3}/2
\end{bmatrix}
\begin{bmatrix}
i_a \\
i_b \\
i_c
\end{bmatrix}
$$

 变换前后 ，幅值不变，总功率不相等。$ P_{\alpha \beta 0}= \frac{2}{3}P_{abc} $

$$
\begin{bmatrix}
u_a \\
u_b \\
u_c
\end{bmatrix}
= T_{2s/3s}u(\alpha\beta)
= \frac{2}{3}
\begin{bmatrix}
1 & 0 \\
-1/2 & \sqrt{3}/2 \\
-1/2 & -\sqrt{3}/2
\end{bmatrix}
\begin{bmatrix}
u_\alpha \\
u_\beta
\end{bmatrix}
$$

Clarke 反变换（αβ → abc）

#### 1.2.4 Park 变换

$$
\begin{bmatrix}
f_d \\
f_q
\end{bmatrix}
= T_{2s/2r}f(\alpha\beta)
= \begin{bmatrix}
\cos\theta & \sin\theta \\
-\sin\theta & \cos\theta
\end{bmatrix}
\begin{bmatrix}
f_\alpha \\
f_\beta
\end{bmatrix}
$$

$ T_{2s/2r} $

$$
\begin{bmatrix}
u_d \\
u_q
\end{bmatrix}
= T_{2s/2r}\left[T_{3s/2s}u(abc)\right]=
\frac{2}{3}
\begin{bmatrix}
\cos\theta & \cos\left(\theta-\frac{2\pi}{3}\right) & \cos\left(\theta+\frac{2\pi}{3}\right) \\
-\sin\theta & -\sin\left(\theta-\frac{2\pi}{3}\right) & -\sin\left(\theta+\frac{2\pi}{3}\right)
\end{bmatrix}
\begin{bmatrix}
u_a \\
u_b \\
u_c
\end{bmatrix}
$$

$T_{3s/2r}$ 是 abc 坐标系到 dq 坐标系的复合变换矩阵。

#### 1.2.5 dq 坐标方程

$$
\begin{bmatrix}
u_d \\
u_q
\end{bmatrix}
=
\begin{bmatrix}
R_s & -\omega_e L_q \\
\omega_e L_d & R_s
\end{bmatrix}
\begin{bmatrix}
i_d \\
i_q
\end{bmatrix}
+
\frac{d}{dt}
\begin{bmatrix}
\psi_d \\
\psi_q
\end{bmatrix}
+
\begin{bmatrix}
0 \\
\omega_e \psi_f
\end{bmatrix}
$$

$$
\begin{cases}
u_d = R_s i_d - \omega_e L_q i_q + L_d \dfrac{di_d}{dt} \\\\
u_q = R_s i_q + \omega_e L_d i_d + L_q \dfrac{di_q}{dt} + \omega_e \psi_f
\end{cases}
$$

式中：

+ $R_s$：定子电阻
+ $ L_d;L_q $：d、q 轴电感
+ $ \omega_e $：电角速度
+ $ \psi_f $：永磁体磁链
+ $ i_d;i_q $：d、q 轴电流
+ $ u_d;u_q $：d、q 轴电压

$$
\begin{cases}
\psi_d = L_d i_d + \psi_f \\
\psi_q = L_q i_q
\end{cases}
$$

$$
\begin{cases}
L_d = \dfrac{3}{2}(L_1 + L_2) \\\\
L_q = \dfrac{3}{2}(L_1 - L_2)
\end{cases}
$$

式中，$ L_1 $表示空间基本气隙磁链产生的电感分量，$ L_2 $表示转子位置依赖磁链产生的电感分量。

$ T_e = \frac{3}{2}n_p\left(\psi_d i_q - \psi_q i_d\right)= \frac{3}{2}P_n\left[\psi_f i_q + (L_d - L_q)i_d i_q\right] $

#### 1.2.6 非正弦三相电流 dq 轴

Clarke 与 Park 变换都是**线性变换**，满足叠加原理。我们可以把非正弦三相电流分解为基波和各次谐波，分别进行变换，再叠加结果，对于任意的信号都可以进行傅里叶分解，距离参考。

假设三相电流包含基波、5 次谐波和 7 次谐波（非正弦的典型情况）：

$$
\begin{cases}
i_a = I_1\cos\omega t + I_5\cos5\omega t + I_7\cos7\omega t \\
i_b = I_1\cos\left(\omega t-\frac{2\pi}{3}\right) + I_5\cos\left(5\omega t-\frac{2\pi}{3}\right) + I_7\cos\left(7\omega t-\frac{2\pi}{3}\right) \\
i_c = I_1\cos\left(\omega t+\frac{2\pi}{3}\right) + I_5\cos\left(5\omega t+\frac{2\pi}{3}\right) + I_7\cos\left(7\omega t+\frac{2\pi}{3}\right)
\end{cases}
$$

$$
\begin{cases}
i_\alpha = I_1\cos\omega t + I_5\cos5\omega t + I_7\cos7\omega t \\
i_\beta = I_1\sin\omega t - I_5\sin5\omega t + I_7\sin7\omega t
\end{cases}
$$

Clarke 变换（abc → αβ）

$ T_{2s/2r} = \begin{bmatrix}\cos\theta & \sin\theta \\ -\sin\theta & \cos\theta\end{bmatrix} \quad \theta=\omega t $

Park 变换

将 $ i_\alpha,i_\beta $代入，对每个频率分量单独计算：

+ **基波分量(n=1)**
$$
\begin{bmatrix}i_{d1} \\ i_{q1}\end{bmatrix}
= \begin{bmatrix}\cos\omega t & \sin\omega t \\ -\sin\omega t & \cos\omega t\end{bmatrix}
\begin{bmatrix}I_1\cos\omega t \\ I_1\sin\omega t\end{bmatrix}
= \begin{bmatrix}I_1 \\ 0\end{bmatrix}
$$
 → 基波变换后是直流量
+ **5 次谐波(n=5)**
$$
\begin{bmatrix}i_{d5} \\ i_{q5}\end{bmatrix}
= \begin{bmatrix}\cos\omega t & \sin\omega t \\ -\sin\omega t & \cos\omega t\end{bmatrix}
\begin{bmatrix}I_5\cos5\omega t \\ -I_5\sin5\omega t\end{bmatrix}
= \begin{bmatrix}I_5\cos6\omega t \\ -I_5\sin6\omega t\end{bmatrix}
$$
→ 5 次谐波变换后是6 倍基频的交流量
+ **7 次谐波（(n=7)）**
$$
\begin{bmatrix}i_{d7} \\ i_{q7}\end{bmatrix}
= \begin{bmatrix}\cos\omega t & \sin\omega t \\ -\sin\omega t & \cos\omega t\end{bmatrix}
\begin{bmatrix}I_7\cos7\omega t \\ I_7\sin7\omega t\end{bmatrix}
= \begin{bmatrix}I_7\cos6\omega t \\ I_7\sin6\omega t\end{bmatrix}
$$
→ 7 次谐波变换后也是**6 倍基频的交流量**。

当三相电流是非正弦时，dq 轴电流不再是纯直流，而是：

+ **直流分量**：由基波电流产生，是我们控制的目标分量
+ **交流波动分量**：由各次谐波电流产生

## 二、SVPWM
### 2.1 物理基础
![three-phase-pmsm 插图 8](/images/posts/three-phase-pmsm/008-101a794e41.png)

![three-phase-pmsm 插图 9](/images/posts/three-phase-pmsm/009-bf26f1bc10.png)

![three-phase-pmsm 插图 10](/images/posts/three-phase-pmsm/010-6b156e0e21.png)

7个基本电压矢量$ V_0, V_1, V_2, V_3, V_4, V_5, V_6, V_7 $的计算方式如下：

$$
\begin{align*}
V_4 &= \frac{2}{3}\left(\frac{2}{3}V_{dc} - \frac{1}{3}V_{dc}\cdot e{j2\pi/3} - \frac{1}{3}V_{dc}\cdot e{j4\pi/3}\right) = \frac{2}{3}V_{dc} \\
V_6 &= \frac{2}{3}\left(\frac{1}{3}V_{dc} + \frac{1}{3}V_{dc}\cdot e{j2\pi/3} - \frac{2}{3}V_{dc}\cdot e{j4\pi/3}\right) = \frac{2}{3}V_{dc}e^{j\frac{1}{3}\pi} \\
V_2 &= \frac{2}{3}\left(-\frac{1}{3}V_{dc} + \frac{2}{3}V_{dc}\cdot e{j2\pi/3} - \frac{1}{3}V_{dc}\cdot e{j4\pi/3}\right) = \frac{2}{3}V_{dc}e^{j\frac{2}{3}\pi} \\
V_3 &= \frac{2}{3}\left(-\frac{2}{3}V_{dc} + \frac{1}{3}V_{dc}\cdot e{j2\pi/3} + \frac{1}{3}V_{dc}\cdot e{j4\pi/3}\right) = -\frac{2}{3}V_{dc} \\
V_1 &= \frac{2}{3}\left(-\frac{1}{3}V_{dc} - \frac{1}{3}V_{dc}\cdot e{j2\pi/3} + \frac{2}{3}V_{dc}\cdot e{j4\pi/3}\right) = \frac{2}{3}V_{dc}e^{j\frac{4}{3}\pi} \\
V_5 &= \frac{2}{3}\left(\frac{1}{3}V_{dc} - \frac{2}{3}V_{dc}\cdot e{j2\pi/3} + \frac{1}{3}V_{dc}\cdot e{j4\pi/3}\right) = \frac{2}{3}V_{dc}e^{j\frac{5}{3}\pi} \\
V_0 &= V_7 = 0
\end{align*}
$$

+ **零矢量**：$ V_0, V_7 $，幅值为0，不参与空间旋转。
+ **非零矢量**：$ V_1, V_2, V_3, V_4, V_5, V_6 $
    - 共有6个，幅值均为 $ \frac{2}{3}V_{dc} $
    - 在空间上彼此间隔 $ \frac{\pi}{3} $
    - 顶点连接构成一个正六边形,其中内三角形$ \frac{1}{\sqrt{3}}U_{dc} $可以平滑切换，外三角形$ \frac{2}{3}U_{dc} $也可以生成

公式中的系数 $ \frac{2}{3} $是SVPWM的归一化系数**,**$ U_\alpha $和$ U_\beta $和$ U_a,U_b,U_c $幅值相等，如果由 $ V_0, V_1, V_2, V_3, V_4, V_5, V_6, V_7 $合成$ U_\alpha U_\beta $则磁链与$ U_a,U_b,U_c $同幅值相同。

### 2.2 数学推导
![three-phase-pmsm 插图 11](/images/posts/three-phase-pmsm/011-e0d36c6679.png)

SVPWM 建模

![three-phase-pmsm 插图 12](/images/posts/three-phase-pmsm/012-cb5f6914d4.png)

一区导通顺序

+ 基本电压矢量幅值：$ |\boldsymbol{U}_4| = |\boldsymbol{U}6| = \dfrac{2}{3}U{\text{dc}} $
+ 目标合成矢量幅值：$ |\boldsymbol{U}{\text{out}}| = U{\text{m}} $
+ 两个基本矢量 $ \boldsymbol{U}_4 与 \boldsymbol{U}_6 的夹角为 \dfrac{\pi}{3} $
+ 合成矢量 $ \boldsymbol{U}_{\text{out}} $ 与 $ \boldsymbol{U}_4 $的夹角为 $ \theta $
+ 采样周期：$ T_{\text{s}} $

![three-phase-pmsm 插图 13](/images/posts/three-phase-pmsm/013-e499dc51b2.png)

$T_{\mathrm{s}} \boldsymbol{U}_{\mathrm{out}} = T_{4} \boldsymbol{U}_{4} + T_{6} \boldsymbol{U}_{6} + T_{0}$

$ T_{4} + T_{6} + T_{0} = T_{\mathrm{s}} $

$$
\begin{cases}
\boldsymbol{U}_{1} = \dfrac{T_{4}}{T_{\mathrm{s}}} \boldsymbol{U}_{4} \\\\
\boldsymbol{U}_{2} = \dfrac{T_{6}}{T_{\mathrm{s}}} \boldsymbol{U}_{6}
\end{cases}
$$

$ \frac{|\boldsymbol{U}{\text{out}}|}{\sin\frac{2\pi}{3}} = \frac{|\boldsymbol{U}_1|}{\sin\left(\frac{\pi}{3}-\theta\right)} = \frac{|\boldsymbol{U}_2|}{\sin\theta} $

$ T_4 = \frac{\sqrt{3}U_{\text{m}}}{U_{\text{dc}}} T_{\text{s}} \sin\left(\frac{\pi}{3}-\theta\right) $
$ T_6 = \frac{\sqrt{3}U_{\text{m}}}{U_{\text{dc}}} T_{\text{s}} \sin\theta $

$ M = \frac{\sqrt{3}U_{\text{m}}}{U_{\text{dc}}} $

### 2.3 Tcm_a,Tcm_b,Tcm_c 的导通时间推导

![three-phase-pmsm 插图 14](/images/posts/three-phase-pmsm/014-501b8ce889.png)

导通时间图形

备注：图中的初始 $\theta$ 为 0，黄色对应 $T_a$，蓝色对应 $T_b$，红色对应 $T_c$。

作用时间：

$$
\begin{cases}
T_4 = M T_{\text{s}} \sin\left(\dfrac{\pi}{3}-\theta\right) \\
T_6 = M T_{\text{s}} \sin\theta \\
M = \dfrac{\sqrt{3}U_{\text{m}}}{U_{\text{dc}}}
\end{cases}
$$

目标表达式：

$$
\begin{cases}
T_a = \dfrac{T_{\text{s}} - T_4 - T_6}{4} \\
T_b = T_a + \dfrac{T_4}{2} \\
T_c = T_b + \dfrac{T_6}{2}
\end{cases}
$$

$T_a = \dfrac{T_{\text{s}} - T_4 - T_6}{4}$

$ T_a = \frac{T_{\text{s}} - M T_{\text{s}} \left[\sin\left(\frac{\pi}{3}-\theta\right) + \sin\theta\right]}{4}= \frac{T_{\text{s}} \left[1 - M \sin\left(\frac{\pi}{3}+\theta\right)\right]}{4} $

$ T_b = \frac{T_{\text{s}} + T_4 - T_6}{4} $

$ T_b = \frac{T_{\text{s}} + M T_{\text{s}} \left[\sin\left(\frac{\pi}{3}-\theta\right) - \sin\theta\right]}{4}= \frac{T_{\text{s}} \left[1 + M\sqrt{3} \sin\left(\frac{\pi}{6}-\theta\right)\right]}{4} $

$ T_c = T_b + \dfrac{T_6}{2}= \frac{T_{\text{s}} + T_4 + T_6}{4} $

$T_c = \frac{T_{\text{s}} + M T_{\text{s}} \left[\sin\left(\frac{\pi}{3}-\theta\right) + \sin\theta\right]}{4}= \frac{T_{\text{s}} \left[1 + M \sin\left(\frac{\pi}{3}+\theta\right)\right]}{4}$

一区最终导通时间公式：

$$
\large
\boldsymbol{
\begin{cases}
T_a = \dfrac{T_{\text{s}} - T_4 - T_6}{4} \\
T_b = \dfrac{T_{\text{s}} + T_4 - T_6}{4} \\
T_c = \dfrac{T_{\text{s}} + T_4 + T_6}{4}
\end{cases}}
$$

$$
\large
\begin{cases}
T_a = \frac{T_{\text{s}} \left[1 - M \sin\left(\frac{\pi}{3}+\theta\right)\right]}{4} \\
T_b = \frac{T_{\text{s}} \left[1 + M\sqrt{3} \sin\left(\frac{\pi}{6}-\theta\right)\right]}{4} \\
T_c = \frac{T_{\text{s}} \left[1 + M \sin\left(\frac{\pi}{3}+\theta\right)\right]}{4}
\end{cases}
$$

### 2.4 SVPWM 算法实现
![three-phase-pmsm 插图 15](/images/posts/three-phase-pmsm/015-c40ec60a28.png)

$$
\begin{cases}
U_{\text{ref1}} = u_\beta \\
U_{\text{ref2}} = \dfrac{\sqrt{3}}{2}u_\alpha - \dfrac{1}{2}u_\beta \\
U_{\text{ref3}} = -\dfrac{\sqrt{3}}{2}u_\alpha - \dfrac{1}{2}u_\beta
\end{cases}
$$

定义 3 个变量 (A、B、C)，通过分析可以得出：

+ 若 $ U_{\text{ref1}}>0 $，则 $ A=1 $
+ 若 $ U_{\text{ref2}}>0 $，则 $  B=1 $
+ 若 $ U_{\text{ref3}}>0 $，则 $ C=1 $

$N=4C+2B+A$

| N | 3 | 1 | 5 | 4 | 6 | 2 |
| --- | --- | --- | --- | --- | --- | --- |
| 扇区 | Ⅰ | Ⅱ | Ⅲ | Ⅳ | Ⅴ | Ⅵ |

$$
\begin{cases}
u_\alpha = \dfrac{T_4}{T_s} |U_4| + \dfrac{T_6}{T_s} |U_6| \cos \dfrac{\pi}{3} \\
u_\beta = \dfrac{T_6}{T_s} |U_6| \sin \dfrac{\pi}{3}
\end{cases}
$$

$$
\begin{cases}
T_4 = \dfrac{\sqrt{3}T_s}{2U_{\text{dc}}} \left(\sqrt{3}u_\alpha - u_\beta\right) \\
T_6 = \dfrac{\sqrt{3}T_s}{U_{\text{dc}}} u_\beta
\end{cases}
$$

$$
\begin{cases}
X = \dfrac{\sqrt{3}T_s}{U_{\text{dc}}} u_\beta \\
Y = \dfrac{\sqrt{3}T_s}{U_{\text{dc}}} \left( \dfrac{\sqrt{3}}{2} u_\alpha + \dfrac{1}{2} u_\beta \right) \\
Z = \dfrac{\sqrt{3}T_s}{U_{\text{dc}}} \left( -\dfrac{\sqrt{3}}{2} u_\alpha + \dfrac{1}{2} u_\beta \right)
\end{cases}
$$

| $ N $ | 1 | 2 | 3 | 4 | 5 | 6 |
| --- | --- | --- | --- | --- | --- | --- |
| $ T_4  $ | Z | Y | -Z | -X | X | -Y |
| $ T_6  $ | Y | -X | X | Z | -Y | -Z |
| $ T_0(T_7) $ | $ (\boldsymbol{T_0(T_7)=(T_s-T_4-T_6)/2}) $ | | | | | |

如果 (T_4+T_6>T_s)，则需进行过调制处理，令

$$
\begin{cases}
T_4 = \dfrac{T_4}{T_4+T_6} T_s \\
T_6 = \dfrac{T_6}{T_4+T_6} T_s
\end{cases}
$$

$$
\begin{cases}
T_a = (T_s-T_4-T_6)/4 \\
T_b = T_a+T_4/2 \\
T_c = T_b+T_6/2
\end{cases}
$$

| $ N $ | 1 | 2 | 3 | 4 | 5 | 6 |
| --- | --- | --- | --- | --- | --- | --- |
| $ T_{\text{cm1}} $ | $ T_b $ | $ T_a $ | $ T_a $ | $ T_c $ | $ T_c $ | $ T_b $ |
| $ T_{\text{cm2}} $ | $ T_a $ | $ T_c $ | $ T_b $ | $ T_b $ | $ T_a $ | $ T_c $ |
| $ T_{\text{cm3}} $ | $ T_c $ | $ T_b $ | $ T_c $ | $ T_a  $ | $ T_b $ | $ T_a $ |

## 三、PMSM 转速环 PI

转速环的完整假设、参数推导和闭环验证已经整理到独立文章：[PMSM 转速环 PI 参数整定推导](/motor-control/pmsm-speed-loop-pi-tuning/)。本篇不再重复相同推导。

## 四、PMSM 的电流环 PI

$$
\begin{cases}
\dfrac{\mathrm{d}}{\mathrm{d}t} i_d = -\dfrac{R}{L_d} i_d + \dfrac{L_q}{L_d} \omega_e i_q + \dfrac{1}{L_d} u_d \\
\dfrac{\mathrm{d}}{\mathrm{d}t} i_q = -\dfrac{R}{L_q} i_q - \dfrac{1}{L_q} \omega_e \bigl(L_d i_d + \psi_f\bigr) + \dfrac{1}{L_q} u_q
\end{cases}
$$

定子电流 $i_d$、$i_q$ 分别在 $q$ 轴和 $d$ 轴方向产生交叉耦合电动势。完全解耦后：

$$
\begin{cases}
u_{d0} = u_d + \omega_e L_q i_q = R i_d + L_d \dfrac{\mathrm{d}}{\mathrm{d}t} i_d \\
u_{q0} = u_q - \omega_e \bigl(L_d i_d + \psi_f\bigr) = R i_q + L_q \dfrac{\mathrm{d}}{\mathrm{d}t} i_q
\end{cases}
$$
$ \boldsymbol{Y}(s) = \boldsymbol{G}(s) \boldsymbol{U}(s) $
$$
\boldsymbol{U}(s) = \begin{bmatrix} u_{d0}(s) \\ u_{q0}(s) \end{bmatrix}\quad
\boldsymbol{Y}(s) = \begin{bmatrix} i_d(s) \\ i_q(s) \end{bmatrix}\quad
\boldsymbol{G}(s) = \begin{bmatrix} R + s L_d & 0 \\ 0 & R + s L_q \end{bmatrix}^{-1}
$$

采用常规的PI调节器并结合前馈解耦控制策略，可得到$ d-q $轴的电压为

$$
\begin{cases}
v_d* = \left(K_{pd} + \dfrac{K_{id}}{s}\right) \bigl(i_d* - i_d\bigr) - \omega_e L_q i_q \\
v_q* = \left(K_{pq} + \dfrac{K_{iq}}{s}\right) \bigl(i_q* - i_q\bigr) + \omega_e \bigl(L_d i_d + \psi_f\bigr)
\end{cases}
$$

![内膜控制](/images/posts/three-phase-pmsm/017-43a04f7970.png)

其中：$ \boldsymbol{I} $为单位矩阵。

如果内模建模精确，即$ \hat{\boldsymbol{G}}(s)=\boldsymbol{G}(s) $，系统不存在反馈环节，此时系统传递函数为

$ \boldsymbol{G}_c(s) = \boldsymbol{G}(s) \boldsymbol{C}(s) $

因此要保证系统稳定，只有当且仅当$ \boldsymbol{G}(s) $和$ \boldsymbol{C}(s) $稳定。

由于电机的电磁时间常数比机械时间常数小很多，控制系统的电流环可近似看作一阶系统，根据$ \hat{\boldsymbol{G}}(s)=\boldsymbol{G}(s) $，定义：

$ \boldsymbol{C}(s) = \hat{\boldsymbol{G}}^{-1}(s) \boldsymbol{L}(s) = \boldsymbol{G}^{-1}(s) \boldsymbol{L}(s) $

其中：$ \boldsymbol{L}(s)=a\boldsymbol{I}/(s+a) $，$ a $为设计参数。

$$
\boldsymbol{F}(s) = a
\begin{bmatrix}
L_d + \dfrac{R}{s} & 0 \\
0 & L_q + \dfrac{R}{s}
\end{bmatrix}
$$

$ \boldsymbol{G}_c(s) = \dfrac{a}{s + a} \boldsymbol{I} $

$$
\begin{cases}
K_{pd} = a L_d \\
K_{id} = a R \\
K_{pq} = a L_q \\
K_{iq} = a R
\end{cases}
$$

## 五 、电流环转速换经典传递函数推导
![PMSM磁场定向的双闭环控制](/images/posts/three-phase-pmsm/018-7576d10f2f.png)

![three-phase-pmsm 插图 19](/images/posts/three-phase-pmsm/019-04417a888a.png)

### 5.1 电流环

$ G_{\text{i}}(s)=K_{\text{p}}+K_{\text{i}}/s  $

+ **PWM逆变器**：可视为一阶惯性环节，时间常数 $ T_{\text{s}}=1/f_{\text{s}} $。
+ **电机电枢回路**：含电阻$ R $、电感 $ L $，也视为一阶惯性环节，电感时间常数 $ T_{\text{L}}=L/R $，此处使用了前馈解耦。
+ 比例关系：$ K_{\text{R}}=1/R $，反映 dq坐标系下电机电压与电流的稳态比例。
+ 逆变器放大倍数：$K_{\text{PWM}}=1$ 。
+ 电流反馈：滤波时间常数 $ T_{\text{if}} $，放大倍数 $ K_{\text{if}}=1 $。

$ P(s)=\frac{K_{\text{p}} K_{\text{PWM}} K_{\text{R}} K_{\text{if}}(\tau_{\text{c}} s+1)}{\tau_{\text{c}} s  (T_{\text{s}} s+1)  (T_{\text{L}} s+1)  (T_{\text{if}} s+1)}  $选择电流调节器的零点对消被控对象的大时间常数极点：$ \tau_{\text{c}}=T_{\text{L}}=L/R  $
$ K_{\text{PWM}}=K_{\text{if}}=1 $

$ P(s)=\frac{K_{\text{p}}}{R\tau_{\text{c}}s(T_{\text{s}} s+1)  (T_{\text{if}} s+1)} $

$ P(s)=\frac{K}{s(T_{\Sigma\text{i}} s+1)} $

+ $ T_{\Sigma\text{i}} = T_{\text{s}} + T_{\text{if}} $：是PWM开关延迟和电流滤波延迟合并后的等效小时间常数。
+ $K = \frac{K_{\text{p}}}{L}$：开环增益。

闭环传递函数

$ C(s)=\frac{P(s)}{1+P(s)}=\frac{\displaystyle \frac{K}{s(T_{\Sigma\text{i}} s+1)}}{1+\displaystyle \frac{K}{s(T_{\Sigma\text{i}} s+1)}} $
$ C(s)=\frac{\omega_{\text{n}}^2}{s^2+2\xi\omega_{\text{n}} s+\omega_{\text{n}}^2} $
$ \xi=\frac{1}{2\sqrt{K T_{\Sigma\text{i}}}} $

+ 阻尼比 $ \xi $决定了二阶系统的动态响应：
    - $ \xi=0.707 $ 是工程上的**最优阻尼比**，此时系统超调量最小，同时响应速度最快。

$K=\frac{1}{2 T_{\Sigma\text{i}}}$

$$
\begin{cases}
\tau_{\text{c}} = T_{\text{L}} = L/R \\
K_{\text{p}} = \dfrac{L}{2 T_{\Sigma\text{i}}} \\
K_{\text{i}} = \dfrac{R}{2 T_{\Sigma\text{i}}}
\end{cases}
$$

### 5.2 两种 PI 参数整定示例
我们用永磁同步电机的典型参数：

+ 电机参数：$L_d = L_q = 8\text{mH} = 0.008\text{H}$，$R = 0.5\Omega$
+ 系统时间常数：$ T_{\text{s}} = 100\mu\text{s} = 0.0001\text{s} $ $ T_{\text{if}} = 50\mu\text{s} = 0.00005\text{s} $
+ 合并小时间常数：$ T_{\Sigma\text{i}} = T_{\text{s}} + T_{\text{if}} = 0.00015\text{s} $
+ 内模控制设计参数：$ a = 1000\text{rad/s} $对应期望带宽约159 Hz

经典典型I型系统设计
$$
\begin{cases}
\tau_{\text{c}} = T_{\text{L}} = \dfrac{L}{R} = \dfrac{0.008}{0.5} = 0.016\text{s} \\
K_{\text{p}} = \dfrac{L}{2 T_{\Sigma\text{i}}} = \dfrac{0.008}{2 \times 0.00015} \approx 26.67 \\
K_{\text{i}} = \dfrac{R}{2 T_{\Sigma\text{i}}} = \dfrac{0.5}{2 \times 0.00015} \approx 1666.67
\end{cases}
$$

内模控制设计

$ a = 1000\text{rad/s} $

$$
\begin{cases}
K_{\text{pd}} = K_{\text{pq}} = a L_d = 1000 \times 0.008 = 8 \\
K_{\text{id}} = K_{\text{iq}} = a R = 1000 \times 0.5 = 500
\end{cases}
$$

$ a = 2000\text{rad/s} $
$$
\begin{cases}
K_{\text{pd}} = K_{\text{pq}} = 2000 \times 0.008 = 16 \\
K_{\text{id}} = K_{\text{iq}} = 2000 \times 0.5 = 1000
\end{cases}
$$

### 5.3  速度环
+ 电流环是速度环的内环，我们已经设计好了电流闭环传递函数 $ C_s $。
+ 转速环的截止频率比电流环低很多，电流环近似成一个**一阶惯性环节**：
$ C(s) \approx \frac{1}{2T_{sf} s + 1} $
![three-phase-pmsm 插图 20](/images/posts/three-phase-pmsm/020-73a4f9035f.png)
+ 电机的积分环节  $ \frac{1}{J s}  $
+ $ W_n(s) = \frac{K(\tau_n s + 1)}{s^2 (T_\Sigma s + 1)} $
+ $T_\Sigma =2T_d+T_w$

速度环的开环传递函数为：

$ W_n(s) = \frac{k_n K_t (\tau_n s + 1)}{\tau_nJ s^2 (T_\Sigma s + 1)} $

$$
\begin{cases}
\tau_n = h \times  T_\Sigma \\
k_n = \frac{(h+1) J}{2 h \times  T_\Sigma K_i}
\end{cases}
$$

+ 其中$ h $是中频带宽，通常取$ h=5 $。
+ $ K_t $是转矩常数，定义为额定转矩与额定电流的比值 $ K_i = \frac{T_N}{I_N} $。

## 六、传统滑膜观测器

## 七、参数辨识

相电感、$d$/$q$ 轴电感和永磁体磁链的测量换算已经整理到独立文章：[PMSM 电感与磁链参数测量](/motor-control/pmsm-parameter-measurement/)。
