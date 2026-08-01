---
title: "电机驱动电源与保护器件设计笔记"
date: 2026-08-01 22:08:00
description: "整理 MAX6495、LM5069、LM5010、LM5005、TPS26213 和 TPS26600 的设计要点。"
permalink: hardware/motor-drive-power-supply/
categories:
  - 硬件设计
tags:
  - 电源设计
  - 过压保护
  - 热插拔
  - Buck
toc: true
mathjax: true
---

本文按器件整理电机驱动电源中的过压限制、热插拔、降压稳压和电子保险丝设计。公式和经验值用于辅助理解，实际设计必须回到对应型号的数据手册核对极限值与单位。

<!-- more -->

## 1、MAX6495ATT+T  开关 / 限压控制器
 GATE 充电电流： **100μA**

 在**过压模式**下工作时，MAX6495–MAX6499 的反馈通路由输入引脚 IN、OVSET 对应的内部比较器、内部栅极电荷泵以及外部 NMOS 管构成，实现开关通断功能。 当触发设定的过压阈值时，内部高速比较器会关断外部 MOS 管，在 **0.5μs 内将 GATE 引脚钳位到 OUTFB**，并切断电源与负载的连接。 当输入电压 IN 下降到整定后的过压阈值以下时，MAX6495–MAX6499 会**缓慢将 GATE 电压抬升到 OUTFB 之上**，重新将负载与电源接通。

![过压模式](/images/posts/motor-drive-power-supply/001-b6699a6571.png)

在**过压限制模式**下工作时，MAX6495 的反馈通路由 OUTFB、OVSET 对应的内部比较器、内部栅极电荷泵以及外部 N 沟道 MOSFET 构成，使外部 MOSFET工作为**电压调节器**。正常工作时，GATE 电压被抬升至**高于 OUTFB 10V。**正常工作时，GATE 电压被抬升至高于 OUTFB 10V。** **外部 MOSFET 的源极电压通过 OUTFB 与 OVSET 之间的电阻分压器进行监测。 当 OUTFB 上升至整定后的过压阈值以上时，内部比较器会**吸收电荷泵电流**，对外部 GATE 放电，将 OUTFB 稳定在 OVSET 设定的过压阈值。在过压瞬变期间 OUTFB 保持有效，MOSFET 在过压事件中**持续导通**，工作在**开关线性模式**。mosfet 可能发热严重。

    - ![过压限制模式](/images/posts/motor-drive-power-supply/002-93ab297dc9.png)

![内部电路](/images/posts/motor-drive-power-supply/003-c8893fc1bc.png)

**分压电阻选择**：

OVSET 引脚用于为器件**精确设置过压保护阈值**。通过电阻分压网络可设置所需的过压阈值 。OVSET 的**上升阈值为 1.24V**，回差（下降阈值）为 5%。  所选总电阻应保证在目标过压阈值下，分压总电流至少为 **100 倍 OVSET 输入偏置 电流 ISET**。由于 MAX6499 具有极高的输入阻抗，**RTOTAL 最大可取值至 5MΩ**。

 RTOTAL <20V / (100 × ISET)   ISET 为 OVSET 最大 50nA 输入偏置电流  RTOTAL < 4MΩ

 为提升 ESD 防护能力，应保证 **R2 ≥ 1kΩ**。

**浪涌电流**：

 	可通过在 **GATE 与地之间接入一个电容**来实现浪涌电流控制，使栅极电压缓慢上升，从而在开机初期限制浪涌电流并控制 GATE 电压的压摆率。

 浪涌电流可通过以下公式近似计算：

$ IINRUSH=IGATE*CGATE/COUT+ILOAD $

式中：IGATE 为栅极 100μA电流，ILOAD为启动时的负载电流，COUT 为输出电容。

**Mosfet** ：

过压模式 mosfet 发热不严重，RDS(ON)选取较小比较好。

**Mosfet 栅极电容放**电：

当过压，欠压或者 SHDN 拉低，期间会内部 100mA 下拉电路，一单 OUTFB 电压高于 gate 电压， 电流便会通过内部钳位二极管从 OUTFB 流向 100mA 下拉电路，对**输出电容进行放电**。 根据输出电容大小和初始电压不同，内部 100mA 下拉电路可能会耗散**大量能量**。为避免损坏芯片，对于设定的过压阈值，需保证**输出电容不超过给出的限值**。 示例图中：3uF 和 203uF，但是 203uF 中有二极管钳制，是否只有电流会流。

![motor-drive-power-supply 插图 4](/images/posts/motor-drive-power-supply/004-63bd4e7e48.png)

## 2、LM5069

![芯片内部电路](/images/posts/motor-drive-power-supply/005-cba480de93.png)

栅源电压 12V

LM5069 围绕MOSFET构建电流、功率、电压保护机制。

| 保护功能 | 触发条件 | 工作机制 | 核心作用 |
| :--- | :--- | :--- | :--- |
| **浪涌电流抑制+压摆率控制** | 电路板插入带电背板/热插拔电源时 | 1. 控制 GATE 引脚电压，调节串联通路 MOSFET 导通速率；   2. 限制负载端电压压摆率（dV/dt），避免背板供电电压电压瞬间跌落   | 1. 减小浪涌电流对背板电源的冲击；   2. 稳定负载端电压，防止系统其他电路意外复位 |
| **可编程限流保护** | 电流检测电阻 $ R_S $（VIN→SENSE 引脚）两端电压达 **55 mV** 时 | 1. 限流阈值由 $ R_S $ 阻值决定（$ I_{LIM} = 55\ \text{mV} / R_S $）；   2. 限流状态下，芯片调节 GATE 电压，限制 MOSFET 导通电流；   3. 限流持续时间超时后触发关断/重试 | 1. 短时间过载时限流，避免瞬时大电流损坏器件；   2. 长时间过载时触发故障保护，防止器件过热 |
| **断路器（Circuit Breaker）快速保护** | 负载电流急剧上升（如短路），$ R_S $ 电压达限流阈值的 **2 倍（105 mV/**$ R_S $**）** 时 | 1. GATE 引脚内置 **230 mA 下拉电流**，迅速拉低 MOSFET 栅极电压，关断 MOSFET；   2. 启动故障超时周期；   3. 当 $ R_S $ 电压回落至 105 mV 以下，下拉电流关断，MOSFET 由限流/限功率电路接管 | 1. 短路等极端故障时毫秒级响应，避免大电流持续冲击；   2. 区分“短时过载”与“严重短路”，兼顾保护与系统恢复灵活性 |
| **MOSFET 功率限制（SOA 保护）** | 串联通路 MOSFET 功耗（漏源电压×漏极电流）达 PWR 引脚电阻设定阈值时 | 1. 监测 MOSFET 漏源电压（SENSE→OUT）与漏极电流（VIN→SENSE），计算实时功耗；   2. 功耗达限阈值时，调节 GATE 电压减小 MOSFET 电流；   3. 功率限制工作期间，故障定时器同步启动 | 1. 确保 MOSFET 工作在安全工作区（SOA），避免因功耗过高烧毁；   2. 补充限流保护的不足，覆盖 MOSFET 热损耗场景 |
| **欠压/过压锁定（UVLO/OVLO）** | 系统输入电压超出可编程工作范围时 | 1. 可编程 UVLO/OVLO 阈值，通过外部电阻设定；   2. 电压越限时，电路关断 LM5069 内部串联通路器件 | 1. 防止欠压导致系统工作异常、过压烧毁负载芯片；   2. 适配不同输入电压场景的系统（如宽电压供电背板） |
| **故障恢复机制** | 故障消除后 | 1. LM5069‑1：锁存关断状态，需外部触发（如复位信号）才能恢复；   2. LM5069‑2：无限次重试恢复，故障消除后自动重新导通 MOSFET | 适配不同系统可靠性需求：锁存型适合需人工排查的场景，重试型适合无人值守、故障可快速消除的场景 |

![上电正常时序](/images/posts/motor-drive-power-supply/006-77c5cf54d1.png)

![故障重启](/images/posts/motor-drive-power-supply/007-53cf8e5238.png)

上电时序总结：

1. **刚上电初始**
Gate 脚由 **230mA 强下拉**，MOS 管完全关断。
2. **插入延迟阶段（Insertion Timer / POR）**
输入升至 ~7.6V 后启动插入定时器，**Timer 电容以 5.5μA 恒流充电**；
充到 **4V** 时插入延时结束，Timer 电容由 **1.5mA 电流放电**。
3. **启动允许条件**
输入电压达到 **8.4V 以上**且 UVLO 满足，开始打开 MOS 管。
4. **浪涌限流阶段**
Gate 以 **16μA 弱电流慢充**，控制 dV/dt 从而限制浪涌电流；
**功率限制 + 限流**协同控制。
5. **Timer 引脚在不同模式下的电流**
    - 正常工作：Timer 脚 **2.5μA 下拉**
    - 限流/限功率期间：Timer 脚以 **85μA 充电**
6. **故障判定与关断**
若 Timer 电压充到 **4V 仍未退出限流/限功率模式**，判定为持续故障，关断 Q1。
7. **故障重试周期**
Timer 在 **4V ↔ 1.25V** 之间充放电循环，重复 8 次；
第 8 次降至 **0.3V** 后，芯片重启，进入下一轮重试周期。

限制空滤计算

$ P_{LIM} = \frac{R_{PWR}}{1.30 \times 10^5 \times R_{SNS}} + 1.18\ \text{mV} \times \frac{V_{DS}}{R_{SNS}} $

$ P_{LIM} = 29.74\ \text{W} + 23.6\ \text{W} = 53.34\ \text{W} $

是否满足最小电压精度要求（≥5mV）：

$ V_{SNS} = \frac{P_{LIM} \times R_{SNS}}{V_{DS}} = \frac{53.34\ \text{W} \times 0.0015\ \Omega}{30\ \text{V}} \approx 2.67\ \text{mV} $

⚠️ 注意：此结果 $ V_{SNS} < 5\ \text{mV} $，**低于 TI 推荐的精度下限**，意味着功率限制精度会显著下降。若要保证精度，需增大 $ R_{PWR} $ 或 $ R_{SNS} $ 以提高 $ P_{LIM} $。

**启动时间计算**

直接电流限制模式

**适用场景**：启动时 ($ I_{\text{LIM}} \times V_{\text{DS}} < P_{\text{LIM}} $)，芯片直接进入限流控制。

+ 公式：
$ t_{\text{start,max}} = \frac{C_{\text{OUT}} \times V_{\text{IN,MAX}}}{I_{\text{LIM}}} $
+ 物理意义：负载电容 $ C_{\text{OUT}} $)以恒定限流 $ I_{\text{LIM}} $充电至最大输入电压 $ V_{\text{IN,MAX}} $的时间。
+ 特点：启动时间仅由限流决定，功率限制未被触发，属于少数设计场景。
+

先功率限制后电流限制模式

**适用场景**：启动时 ($ I_{\text{LIM}} \times V_{\text{DS}} > P_{\text{LIM}} $)，芯片先限制功率，随输出电压升高后切换到限流，是**绝大多数热插拔设计**的典型工况。

+ 公式：
$ t_{\text{start}} = \frac{C_{\text{OUT}}}{2} \times \left( \frac{V_{\text{IN,MAX}}2}{P_{\text{LIM}}} + \frac{P_{\text{LIM}}}{I_{\text{LIM}}2} \right) $
+ 物理意义：
    1. 前半段：MosFet 恒定功率 $ P_{\text{LIM}} $给电容充电，电压上升较慢；
    2. 后半段：当 $ V_{\text{DS}} $)降低到 $ I_{\text{LIM}} \times V_{\text{DS}} < P_{\text{LIM}} $ 时，切换为恒定限流 $I_{\text{LIM}}$)充电。
+ 特点：兼顾 MOSFET 功耗安全（功率限制）和启动速度（电流限制）。

为避免启动过程中误触发故障关断，需给启动时间增加 **50% 裕量** 来设定故障时间$ t_{\text{flt}} $ 。

$ \boldsymbol{C_{\text{TIMER}} = \frac{t_{\text{flt}} \times i_{\text{timer(typ)}}}{V_{\text{timer(typ)}} \times \frac{1}{1.5}}} = \frac{t_{\text{start}} \times i_{\text{timer(typ)}}}{V_{\text{timer(typ)}} \times \frac{2}{3}} $

## 3、LM5010SD
![基础图](/images/posts/motor-drive-power-supply/008-29a8ca347d.png)

工作模式讲解

恒压模式

+ 核心功能：控制输出电压稳定，芯片导通时间保持不变。
+ 负载变化对应规律：
    - 负载变重（电流变大）：芯片下降时间短，占空比变大，频率变大；
    - 负载变轻（电流变小）：芯片下降时间长，占空比变小，频率变小。

恒流模式

+ 触发条件：电感电流的谷值超过限流阈值，芯片进入限流模式。
+ 控制逻辑：维持电流谷值为1.25A（该数值可以调大，根据内部 MosFet 的电流限制可以到 2A）；一般情况下电压无法稳定在设定值，低于反馈基准（FB）的2.5V。
+ 导通特性：导通时间依然不变，通常当电流谷值达到1.25A时，可开启导通。

![工作模式图](/images/posts/motor-drive-power-supply/009-f4e6ba5a57.png)

![内部逻辑图](/images/posts/motor-drive-power-supply/010-76d758840f.png)

导通/关断周期控制逻辑

+ 导通触发：若FB电压低于基准电压（2.5V），Mosfet开关导通。
+ 导通时长：由输入电压（VIN）和编程电阻（R_on）决定。
+ 关断规则：导通时间结束后，开关保持关断265ns，或直到FB电压降至基准电压以下，取两者中较长者，还有一个条件，电流下降到 1.25A, 之后开关再次导通进入下一个周期。
+ 关断时间特殊情况：负载电流较大时，关断时间取最小值265ns；稳压稳定后，关断时间恢复至正常值。

导通模式分类（按负载电流）

1. 连续导通模式（continuous conduction mode）
+ 适用场景：大负载电流时。
+ 核心特性：电感中始终有电流流过，关断时间内电流不会降至0；工作频率在负载与输入电压变化时保持相对稳定。
+ 近似工作频率公式：$ F_s = \frac{V_{out}}{1.18 \times 10^{-10} \times R_{on}} $   该公式有 25%的误差
+ 降压开关占空比近似公式：DC = Vout / Vin
2. 不连续导通模式（discontinuous conduction）
+ 适用场景：轻负载电流时。
+ 核心特性：导通时间内电感电流从零上升至峰值，关断时间结束前回落至零；FB引脚电压降至基准电压以下时，下一个导通周期开始，此前电感电流保持为零，负载电流由输出电容（C2）提供。
+ 频率特性：工作频率低于连续导通模式，且随负载电流变化。

VCC 输入输出电压参数

+ 输入电压（Vin）：超过7V时，输出Vcc稳定在7V。
+ Vcc限流：10mA。

内置稳压器（启动及欠压锁定特性）

+ 启动模块：为LM5010芯片内置模块，输入引脚（VIN）可直接连接至最高75V的线路电压。
+ 上电充电：上电时，稳压器向VCC引脚的外部电容（C3）提供充电电流；当VCC引脚连接0.1μF电容时，VCC电压约需58μs达到5.8V的欠压锁定阈值。
+ 启动后续动作：VCC达到欠压锁定阈值后，降压开关使能，软启动引脚被释放，软启动电容（C6）开始充电。
+ 最小输入工作电压：由稳压器的压差、VCC欠压锁定下降阈值（≈5.65V）以及工作频率共同决定。
+ 欠压锁定触发：当VCC电压低于欠压锁定下降阈值（≈5.65V）时，关断降压开关并将软启动引脚拉至地。

![软启动](/images/posts/motor-drive-power-supply/011-ddef1a7969.png)

 过压比较器

 FB 引脚的反馈电压会与内部 2.9V 参考电压进行比较。若 FB 引脚电压升至 2.9V 以上，导通周期会立即终止。这种情况通常由输入电压或输出负载的突变引发。降压开关将保持关断，直到 FB 电压回落至 2.5V 以下。

具体参数计算

 导通时间控制

$ t_{ON} = \frac{1.18 \times 10^{-10} \cdot (R_{ON} + 1.4\,\text{k}\Omega)}{V_{IN} - 1.4\,\text{V}} + 67\,\text{ns} $

$$
V_{in}=24\,\mathrm{V}, \qquad R_{on}=100\,\mathrm{k}\Omega
$$

$ t_{ON} = \frac{1.18 \times 10^{-10} \cdot (100\,\mathrm{k}\Omega + 1.4\,\mathrm{k}\Omega)}{24\,\mathrm{V} - 1.4\,\mathrm{V}} + 67\,\text{ns} = 596\,\text{ns} =0.596\,\mu\text{s} $

$ t_{off,min} = 265ns $

$ T_{min}= t_{on} + t_{off,min}=861.43ns $

$ f_{max} = \frac{1}{T_{min}} =1.16MHZ $

N-Channel Buck Switch and Driver  N 沟道降压开关与驱动器

流经降压开关的峰值电流不得超过 3.5A，平均电流必须小于 3A。

电感设计

![motor-drive-power-supply 插图 12](/images/posts/motor-drive-power-supply/012-eb3fe61f2f.png)

 为使电路工作在连续导通模式，允许的最大纹波电流为最小负载电流的 2 倍。

$ L_1 = \frac{V_{OUT1} \left( V_{IN(\max)} - V_{OUT1} \right)}{I_{OR} F_{S(\min)} V_{IN(\max)}} $

Fs(min)为最小开关频率，IOR 是最大纹波电流。

$$
\Delta I_L = \frac{V_{OUT} \left( V_{IN} - V_{OUT} \right)}{L F_S V_{IN}}
$$

软启动电容

$ t_{SS} = \frac{C_6 \times 2.5\,\text{V}}{11.5\,\mu\text{A}}  $

## 4、LM5005
Adjustable Output Voltage as Low as 1.225V

Output Current as High as 2.5A

Integrated 75V 160mΩ MOSFET

Switching Frequency From 50KHz to 500KHz

Minimum PWM On Time 80ns

Minimumu PMW Off Time 500ns

引脚外设：

VCC 稳压至 7V，外接 0.1uF-1uF 电容。

SD 引脚悬空，内部 5uA 上拉工作状态。

COMP 内部误差放大器输出，环路补偿网格连接至 FB。

RT外接电阻震荡，开关频率。

RAMP 斜坡控制信号，推荐电容 1nF，计时器。

SS 软启动。

![motor-drive-power-supply 插图 13](/images/posts/motor-drive-power-supply/013-2f756c18f2.png)

![motor-drive-power-supply 插图 14](/images/posts/motor-drive-power-supply/014-43b6a6658a.png)

放大器滤波

$ V_{comp}=-(V_{FB}-1.225) \frac{1+SR_{1}C_{1}}{S(C_{1}+C_{2})(1+SR_{1} \frac{C_{1}C_{2}}{C_{1}+C_{2}})}+1.225 $

$ V_{comp}=-(V_{FB}-1.225) \frac{1+S \cdot1.63*10^{-4}}{S(3.52 \cdot 10^{-9})(1+S \cdot 3.8 \cdot 10^{-5})}+1.225 $

$ f_{z}= \frac {1}{2 π \times 1.63 \times 10^{-4}}=976Hz $

$ f_{p}= \frac {1}{2 π \times 3.8 \times 10^{-5}}=4.2KHz $

![motor-drive-power-supply 插图 15](/images/posts/motor-drive-power-supply/015-f0d014b680.png)

频率计算

$ R_T \ [\text{k}\Omega] = \frac{7407}{F_{SW} \ [\text{kHz}]} - 4.3  $

$ F_{SW} \ [\text{kHz}]=\frac{7407}{R_T \ [\text{k}\Omega] +4.3} $

![RAMP引脚电压](/images/posts/motor-drive-power-supply/016-5ae132e3d0.png)

$ I_{RAMP}=5uA \cdot (V_{in}-V_{out}) + 25uA $

参数计算

电感计算

电感值需根据开关频率、负载电流、电感纹波电流，以及最小 / 最大输入电压来确定。为使转换器保持在连续导通模式（CCM），最大电感纹波电流必须小于最小负载电流的 2 倍。![motor-drive-power-supply 插图 17](/images/posts/motor-drive-power-supply/017-d29e6eae8d.png)

电感越大，纹波越小。

Cout 输出电容计算

$ \Delta V_{OUT} = \frac{\Delta I_L}{8 \cdot F_{SW} \cdot C_{OUT}} $

Css 计算

$ C_{SS} = \frac{t_{SS} \cdot I_{SS}}{V_{REF}} = \frac{t_{SS} \cdot 10\ \mu\text{A}}{1.225\ \text{V}}  $

$ 软启动电容\ (\text{单位：nF}) = 8.16 \times 软启动时间\ (\text{单位：ms}) $

10nF 电容时，启动时间 1.2ms

CRAMP 计算

![motor-drive-power-supply 插图 18](/images/posts/motor-drive-power-supply/018-4b1cfead4d.png)

Rs Cs 计算

Rs 在 2-10

Cs 越大，阻尼越大，发热越大

## 5、TPS26213 Buck
![典型例题](/images/posts/motor-drive-power-supply/019-13b4656d5b.png)

![motor-drive-power-supply 插图 20](/images/posts/motor-drive-power-supply/020-cb53946451.png)

FSW 低电平 2.5MHz

FB 800mV

分压电阻的分压电流 至少为 2uA，R2 分压电阻不应该超过 400k

电路最大值 3A

软启动 Css 电压上升，FB 渐渐上升到 0.8V

$ C_{SS} = t_{SS} \cdot \frac{2.5\ \mu A}{1.25V} \quad [F] =t_{SS}  \cdot 2uF/s $

## 6、TPS26600
![典型](/images/posts/motor-drive-power-supply/021-542e6522e1.png)

![过压欠压比较器](/images/posts/motor-drive-power-supply/022-aa6fcb22be.png)

电压上升时间 dvdt：$ t_{\text{dVdT}} = 8 \times 10^3 \times V_{(\text{IN})} \times C_{(\text{dVdT})}  $

限流电流：$ I_{OL} = \frac{12}{R_{(ILIM)}} $电阻单位是 kΩ

过流后芯片先**硬限流保负载**，875us 后 FLT 延迟告警；如果温度扛不住就**关断 MOSFET**，之后要么锁死等人工复位，要么定时自动重试，完全取决于你配置的 MODE 模式。

$ I_{(\text{FASTRIP})} = 1.87 \times I_{(\text{OL})} + 0.015 $这个是快跳阈值，当超过这个电流，在 250ns 内关断 FET，微秒之后在重启，875us 后延迟告警。

SHDN 开漏输出，高电平使能

MODE 和 RTN 之间 402K 过载后限流，过热后闭锁，需手动复位->Vin 掉电再复位，或者 SHDN 下拉在上拉复位

$ R_{(\text{IMON})} = \frac{V_{(\text{IMONmax})}}{I_{(\text{LIM})} \times 75 \times 10^{-6}}  $

IMON引脚的电压 $ V_{(\text{IMON})} $ 表示与负载电流成比例的电压，该电压可连接至下游系统的模数转换器（ADC），用于对系统进行健康状态监测。$ R_{\text{IMON}} $ 必须根据所用ADC的最大输入电压范围来配置。$ I_{(\text{LIM})} $是最大限流值。
