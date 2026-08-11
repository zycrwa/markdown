# PMSM 数学模型

本文采用电机控制中最常用的同步旋转坐标系建模方法：先由三相定子电压方程出发，再通过 Clarke 和 Park 变换得到 $dq$ 轴模型。该模型可直接用于 PMSM 的 Simulink 仿真。

## 1. 建模假设

为简化推导，作如下假设：

1. 三相定子绕组对称，气隙磁场按正弦分布；
2. 忽略磁饱和、铁耗和空间谐波；
3. 永磁体磁链恒定；
4. 电机为星形连接且无中性线，输入为电机端相对中性点的相电压，不考虑零序分量，因此 $i_a+i_b+i_c=0$；
5. $d$ 轴与转子永磁体磁链方向重合，正 $i_q$ 产生正电磁转矩。

本文采用幅值不变 Clarke/Park 变换。$p$ 表示极对数，$\omega_m$ 表示机械角速度，$\omega_e$ 表示电角速度，两者关系为

$$
\omega_e=p\omega_m.
$$

## 2. 三相电压方程与坐标变换

PMSM 三相定子电压的基本方程为

$$
\boldsymbol{v}_{abc}
=R_s\boldsymbol{i}_{abc}
+\frac{\mathrm d\boldsymbol{\psi}_{abc}}{\mathrm dt},
$$

其中，$R_s$ 为定子每相电阻，$\boldsymbol{v}_{abc}$、$\boldsymbol{i}_{abc}$ 和 $\boldsymbol{\psi}_{abc}$ 分别为三相电压、电流和磁链。

为了在稳态同步运行时将基波正弦量变为近似直流量，先进行 Clarke 变换：

$$
\begin{aligned}
x_\alpha
&=\frac{2}{3}\left(x_a-\frac{x_b}{2}-\frac{x_c}{2}\right),\\
x_\beta
&=\frac{x_b-x_c}{\sqrt{3}}.
\end{aligned}
$$

再进行 Park 变换：

$$
\begin{aligned}
x_d&=x_\alpha\cos\theta_e+x_\beta\sin\theta_e,\\
x_q&=-x_\alpha\sin\theta_e+x_\beta\cos\theta_e,
\end{aligned}
$$

其中，$x$ 可以表示电压、电流或磁链，$\theta_e$ 为转子电角度。

对三相电压方程进行上述坐标变换后，可得到旋转 $dq$ 坐标系下的标准电压方程：

$$
\begin{aligned}
v_d&=R_si_d+\frac{\mathrm d\psi_d}{\mathrm dt}-\omega_e\psi_q,\\
v_q&=R_si_q+\frac{\mathrm d\psi_q}{\mathrm dt}+\omega_e\psi_d.
\end{aligned}
$$

其中，$\omega_e\psi_q$ 和 $\omega_e\psi_d$ 是旋转坐标变换产生的耦合项。

## 3. 磁链方程与 $dq$ 电压方程

在 $dq$ 坐标系中，PMSM 的磁链方程为

$$
\begin{aligned}
\psi_d&=L_di_d+\psi_f,\\
\psi_q&=L_qi_q,
\end{aligned}
$$

其中，$L_d$、$L_q$ 分别为 $d$、$q$ 轴电感，$\psi_f$ 为永磁体磁链。

将磁链方程代入电压方程，得到常用的 PMSM 电压模型：

$$
\begin{aligned}
v_d
&=R_si_d+L_d\frac{\mathrm di_d}{\mathrm dt}-\omega_eL_qi_q,\\
v_q
&=R_si_q+L_q\frac{\mathrm di_q}{\mathrm dt}
+\omega_e\left(L_di_d+\psi_f\right).
\end{aligned}
$$

## 4. 电磁转矩与机械运动方程

PMSM 的电磁转矩为

$$
T_e
=\frac{3}{2}p\left(\psi_di_q-\psi_qi_d\right)
=\frac{3}{2}p\left[\psi_fi_q+
\left(L_d-L_q\right)i_di_q\right].
$$

电机的机械运动方程为

$$
J\frac{\mathrm d\omega_m}{\mathrm dt}
=T_e-T_L-B\omega_m,
$$

即

$$
\frac{\mathrm d\omega_m}{\mathrm dt}
=\frac{T_e-T_L-B\omega_m}{J},
$$

其中，$J$ 为转动惯量，$B$ 为黏性阻尼系数，$T_L$ 为负载转矩；正 $T_L$ 表示与正转方向相反的阻转矩。

转子位置方程为

$$
\frac{\mathrm d\theta_e}{\mathrm dt}
=\omega_e=p\omega_m.
$$

## 5. Simulink 使用的完整模型

模型输入为三相相电压 $v_a$、$v_b$、$v_c$ 和负载转矩 $T_L$，选取状态变量

$$
\boldsymbol{x}
=\begin{bmatrix}
i_d&i_q&\omega_m&\theta_e
\end{bmatrix}^{\mathsf T}.
$$

三相输入电压 $v_a$、$v_b$、$v_c$ 先经过 Clarke/Park 变换得到 $v_d$、$v_q$，再按下式计算各状态导数：

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

这四个微分方程构成当前 PMSM Simulink 电机本体的核心。

## 6. 表贴式 PMSM 的常用简化

对于表贴式永磁同步电机（SPMSM），通常认为

$$
L_d=L_q=L_s.
$$

此时磁阻转矩为零，电磁转矩简化为

$$
T_e=\frac{3}{2}p\psi_fi_q.
$$

在常规 FOC 控制中通常令 $i_d^*=0$，通过调节 $i_q$ 控制电磁转矩。这也是本项目默认 SPMSM 模型采用的基本方式。
