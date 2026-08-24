---
title: "电机嵌入式软件实习路线：从 PMSM/FOC 到可交付固件"
date: 2026-08-22 19:14:00
updated: 2026-08-24 19:56:00
description: "面向未来 12–16 周的电机嵌入式软件求职路线，基于现有 PMSM/FOC 与 STM32 笔记，覆盖 C、实时外设、同步采样、控制实现、保护、通信、测试、项目作品和面试验收。"
permalink: embedded/motor-embedded-software-roadmap/
categories:
  - 学习路线
tags:
  - 电机嵌入式
  - STM32
  - FOC
  - PMSM
  - C 语言
  - 实时系统
  - 实习求职
  - 项目制学习
aliases:
  - 电机嵌入式软件学习路线
  - PMSM FOC 嵌入式路线
  - 电机控制固件求职路线
related_posts:
  - embedded-system-basics
  - stm32-clion-development
  - embedded-communication-protocols
  - three-phase-pmsm
  - pmsm-control-basics
  - dengfoc-control-code
  - pmsm-parameter-measurement
  - pmsm-speed-loop-pi-tuning
  - simulink-motor-simulation
  - encoder-pll-speed-estimation
  - git-daily-usage
source_docs:
  - "archive/incoming/2026-08-22/motor-embedded-software-roadmap-research.md"
  - "archive/original-posts/嵌入式基础知识.md"
  - "archive/original-posts/嵌入式.md"
  - "archive/original-posts/STM32_CLION.md"
  - "archive/original-posts/三相永磁同步电机.md"
  - "archive/original-posts/dengfoc学习笔记-常用foc代码.md"
  - "archive/original-posts/转速环PI参数整定.md"
  - "archive/original-posts/电机疑问讨论.md"
  - "archive/original-posts/simulink仿真.md"
review_status: unverified
toc: true
---

这篇路线不是从“什么是电机”重新开始，而是把你已有的 PMSM、FOC、SVPWM、PI、Simulink 和 STM32 笔记，重排成一条能在几个月内产出求职证据的工程路径。目标是：在低压、限流、可复现的台架或仿真环境中，独立写出一套能解释、能测量、能保护、能调试的电机控制固件。

<!-- more -->

## 先定目标：你要成为哪类候选人

“京东、抖音等大公司”并不对应一个统一的电机岗位。电机软件岗位可能挂在机器人、物流自动化、硬件平台、运动控制或通用嵌入式团队下。你应同时准备下面三种岗位画像，但把第一种作为主线：

| 岗位画像 | 面试官想看到的证据 | 你的投递策略 |
| --- | --- | --- |
| 电机控制嵌入式 | C、MCU 定时器/ADC/DMA、编码器、FOC/SVPWM、保护、示波器波形 | 主简历，突出低压 PMSM FOC 项目 |
| 机器人/物流运动控制 | C/C++、控制算法、嵌入式联调、CAN、仿真/HIL；有些团队还要 ROS、规划或视觉 | 第二份简历，突出控制器接口、故障状态机和仿真 |
| 通用嵌入式/硬件系统 | ARM/MCU、RTOS、OS 移植、总线、硬件调试、C/C++、构建与测试 | 用同一项目展示底层和工程化，弱化过深的电机理论 |

截至 2026-08-22，本次核对到的京东校园岗位样本包含“嵌入式技术工程师”（ARM/MCU/SoC、OS 移植、CAN/RS485/SPI、硬件调试）、“具身智能与机器人开发”（C++/Python、嵌入式调试、FOC、机器人控制）以及物流机器人和导航控制岗位（C/C++、Matlab/Simulink、SIL/MIL/HIL、控制算法）。这些是某一时点的公开样本，不是未来岗位的承诺。抖音/字节跳动在本次整理中没有确认一个稳定、直接对应电机控制的公开岗位，因此应把通用嵌入式、机器人和硬件系统岗位作为相邻投递面，并在投递前重新查看官方职位页。

本次样本的可追溯信息如下；岗位标识只用于复核，不代表岗位仍在开放：

| 样本 | 公开标识与日期 | 对学习路线的启示 |
| --- | --- | --- |
| 京东嵌入式技术工程师 | publishId 9103 / reqId 2367，2026-07-23 | ARM/MCU/SoC、OS 移植、CAN/RS485/SPI、硬件调试 |
| 京东具身智能与机器人开发 | publishId 9207 / reqId 2348，2026-08-04 | C++/Python、FOC、机器人学和嵌入式联调 |
| 京东物流仓储机器人、无人机导航控制 | publishId 8620/2321、9030/2454，2026-07-20 至 2026-07-23 | 控制算法、Matlab/Simulink、SIL/MIL/HIL 和传感器融合 |
| 字节/抖音中国大陆北京检索 | 2026-08-22 未找到稳定的电机/嵌入式/机器人/运动控制岗位 | 不把相邻岗位当成确定机会，投递前重新核对官方页面 |

字节公开的相邻岗位（多为海外或研究型）更偏 C/C++、Linux、ARM/RTOS、端侧性能与功耗、FPGA/ASIC 或感知算法；因此把这些作为第二技能轨道即可，主线仍应先做出可测量的 PWM/ADC/FOC/CAN 固件。

公开入口：

- [京东校园招聘](https://campus.jd.com/)
- [字节跳动招聘](https://joinbytedance.com/search)

## 你的起点与真正缺口

你不是“没有基础”，而是电机控制理论明显领先于实时固件工程。现有文章均为 `review_status: unverified`，下面的“已具备”表示已经有学习材料或原型，不等于已经通过实机验证。

| 领域 | 现有证据 | 求职前必须升级的能力 |
| --- | --- | --- |
| 电机与控制 | `three-phase-pmsm` 有模型、坐标变换、SVPWM 和电流环；另有速度环、参数测量、谐波文章 | 把符号、幅值约定、采样延迟、限压和抗饱和落实到逐点测试 |
| FOC 代码 | `dengfoc-control-code` 有开环、编码器对齐和三环示例 | 从 Arduino/ESP32 轮询迁移到 STM32 固定频率 PWM-ADC ISR；测周期、抖动和 CPU 占用 |
| STM32 外设 | 已有 GPIO、EXTI、I2C、SPI、UART、CMake/HAL 笔记 | 补高级定时器互补 PWM、死区、Break、ADC 触发、DMA、编码器接口和看门狗 |
| C/工具链 | 能阅读示例和写外设片段 | 系统掌握指针、数组、结构体、位操作、`volatile`、内存/链接、未定义行为、GDB、Git 和可复现构建 |
| 通信 | 已有 UART/I2C/SPI/CAN 帧原理 | 实现 DMA 环形缓冲、长度/CRC/超时/序号、CAN 应用层、错误计数和总线恢复 |
| 工程质量 | 有零散实验，但没有完整项目证据 | 主机单测、故障注入、示波器/逻辑分析仪记录、README、CI 和一次 bug 复盘 |
| 系统软件 | 尚无实时任务边界和状态机作品 | 先做好裸机快速环，再用 FreeRTOS 承载通信、日志和参数管理 |

最大的断点不是再读一篇六相谐波，而是完成这条链：

`定时器 PWM → ADC 同步采样 → 标定/滤波 → Clarke/Park → 电流 PI → SVPWM → 保护关断 → 遥测与测试`。

## 概念依赖图与优先级

按下面的依赖关系学习；箭头左侧没有稳定，右侧就不要急着上板：

```text
C11/指针/内存/Git/CMake
        ↓
MCU 启动/时钟/NVIC/定时器/DMA/调试器
        ↓
中心对齐 PWM/互补死区/Break + ADC 触发/编码器
        ↓
固定周期与执行时间预算/采样标定/故障状态机
        ↓
离散 PI/限幅/抗饱和/滤波 + Clarke/Park/电角度
        ↓
SVPWM → 电流环 → 速度环/位置环 → 参数辨识
        ↓
CAN/UART 诊断/Flash 参数/RTOS/测试与 CI
```

| 优先级 | 现在学什么 | 暂时不学什么 |
| --- | --- | --- |
| P0，必须完成 | C 与编译链接、TIM/ADC/DMA/编码器、离散 PI、Clarke/Park、SVPWM、有感 FOC、保护、UART/CAN、Git/CMake、示波器和单测 | 任何没有可测验收标准的“看过” |
| P1，有余力再做 | FreeRTOS、参数 Flash、HIL、定点优化、无感 SMO、弱磁/MTPA、Bootloader | 先确保 P0 的闭环稳定 |
| P2，求职前可砍 | 双三相/VSD 深挖、复杂谐波、量产级无感高频注入、复杂 PCB、汇编优化、AUTOSAR/Linux 内核 | 不要用高阶主题掩盖实时链路缺失 |

## 学习方法：每个概念必须落到证据

### 1. 采用 20/60/20 节奏

- 20% 阅读：先查 `KNOWLEDGE_INDEX.md`，再读候选文章和数据手册对应章节。
- 60% 实现：写最小 C 模块、Python/Simulink 黄金模型、主机测试，再接低压硬件。
- 20% 测量与复盘：记录波形、周期、误差、故障和仍不确定的假设。

如果每周有 15–20 小时，工作日做 1–2 小时小实验，周末留半天做联调；只有 10 小时时，删掉 P1/P2 扩展，不删同步采样、保护和测试。

### 2. 对每个功能使用同一张实验卡

```text
问题：我想证明什么？
假设：坐标、单位、采样时刻、边界条件是什么？
最小实现：能否在主机或仿真中单独运行？
测量：看哪条波形、日志或计时器？
结论：数据支持、否定，还是仍待确认？
回归：怎样让下一次构建自动检查它？
```

所有接口文档都写清楚单位、正方向、机械角/电角、幅值不变还是功率不变变换，以及限幅前后的位置。不要把仿真曲线直接当成实机结论。

### 3. 用“三层对拍”替代抄代码

1. Python/Simulink 参考模型：先确认方程、符号和边界。
2. 主机 C 实现：对 Clarke/Park、PI、滤波器、SVPWM 做逐点和随机测试。
3. STM32 低压实机：加入 ADC 偏置、量化、死区、延迟和噪声，再比较波形。

DengFOC 代码适合用来读控制意图，不适合原样当生产固件：其中循环频率不固定，且没有完整的同步采样、硬件刹车和故障状态机。

### 4. 现有笔记的阅读顺序

1. [嵌入式基础](/embedded/embedded-system-basics/)
2. [STM32 与 CLion](/embedded/stm32-clion-development/)
3. [通信协议](/embedded/communication-protocols/)
4. [Simulink 电机仿真](/simulation/simulink-motor-simulation/)
5. [三相 PMSM 建模与控制](/motor-control/three-phase-pmsm/)
6. [DengFOC 代码与三环](/motor-control/dengfoc-control-code/)
7. [PMSM 控制基础](/motor-control/pmsm-control-basics/)
8. [速度环 PI 整定](/motor-control/pmsm-speed-loop-pi-tuning/)
9. [参数测量](/motor-control/pmsm-parameter-measurement/)

读到公式或 HAL API 时，回到对应芯片参考手册核对；这些笔记的审核状态仍是 `unverified`。

## 14 周主线计划

默认每周 15–20 小时，使用 STM32G4/F3 或手头等价 MCU、12–24 V 限流电源、编码器/霍尔和低压 BLDC/PMSM 台架。没有硬件时，用电机离散模型、录播 ADC 数据和主机测试替代。

| 周次 | 学习与实现 | 本周交付和退出条件 |
| --- | --- | --- |
| 1 | C11、指针/数组/结构体、位操作、`const`/`static`/`volatile`、栈堆；Git、CMake、GCC/GDB | 环形缓冲、CRC、PI 小模块可主机编译；`-Wall -Wextra` 无未解释警告，至少 20 个测试 |
| 2 | 启动流程、时钟树、Flash/RAM/map、NVIC、SysTick、SWD 调试 | 可复现的 blink/按键/1 kHz tick 工程；能从 map 文件解释内存占用 |
| 3 | 高级定时器中心对齐 PWM、互补输出、死区、Break；ADC 外部触发、DMA、编码器接口 | 示波器确认频率、占空、死区和采样时刻；测出 ISR 周期抖动 |
| 4 | 电流/母线/温度采样校准、异常值和 DMA 双缓冲；驱动层与控制层分离 | 遥测器连续运行并输出 CSV；模拟故障后 PWM 在示例的两个 PWM 周期内关闭，实际阈值按硬件复核 |
| 5 | 一阶对象、离散 PI、限幅、抗饱和、斜坡和状态机 | C 与 Python/Simulink 逐点对拍；先做低压直流电机或六步速度闭环 |
| 6 | UART DMA 环形缓冲、帧长度/CRC/超时/序号；CAN ID、仲裁、过滤和错误计数 | PC CLI 可读写目标、限流和状态；丢帧/坏 CRC 能被拒绝并计数 |
| 7 | PMSM 电压/磁链/转矩方程、Clarke/Park、机械角到电角、方向和零偏 | 变换逆变换性质测试通过；明确每个角度和电流的单位、符号及误差阈值 |
| 8 | SVPWM 扇区、零矢量、占空限幅、采样点；仿真电流环和解耦 | 仿真中电流跟踪误差达到预设目标（示例 ≤5%），不同采样周期下不发散 |
| 9 | 编码器对齐、开环爬升、有感 FOC 上板；固定 `i_d^*=0`、限速、限流 | 同时记录 PWM、ADC 触发、相电流和角度；出现异常能安全回退到停机状态 |
| 10 | 速度环带宽分离、速度 PI、负载阶跃、Rs/Ld/Lq/磁链/J 粗测 | 给出工况、参数和波形；速度稳态误差、超调和响应时间均有实测而非只报仿真值 |
| 11 | 过流/过压/欠压/过温/堵转/编码器失联、看门狗、故障锁存与恢复 | 故障注入矩阵完整；硬件 Break 优先，软件状态机能解释每个错误码 |
| 12 | 模块接口、配置版本、Flash 参数双备份、Doxygen、静态检查、主机 CI | clean build 一键完成；README 有架构图、时序图、接线、参数、限制和复现步骤 |
| 13 | 裸机闭环稳定后再学 FreeRTOS/CMSIS-RTOS；任务、队列、通知、互斥 | 快速电流环仍留在定时 ISR；通信/日志/参数任务不阻塞控制环，记录 CPU 和栈余量 |
| 14 | DWT/ITM/逻辑分析仪/SWV、WCET、抖动、RAM/Flash、故障复盘和面试演示 | 2 分钟讲清架构，10 分钟解释一条波形，能用数据复盘一次 bug |

第 15–16 周只选一个差异化方向：无感 SMO、弱磁/MTPA、HIL 回归、Bootloader/DFU 或 CANopen。若只有 12 周，合并第 1–2、5–6、7–8、11–12 周，砍掉 RTOS 和无感；不要砍第 3、4、9、11 周。

## 三个递进项目

### 项目一：Motor-Firmware-Lab

先不追求电机性能，做一个“能采、能报、能停”的安全节点：

- STM32 定时器输出 PWM，ADC 由定时器触发并经 DMA 搬运；编码器/霍尔提供速度。
- UART 或 CAN 提供目标值、限流、状态和故障码；协议有长度、CRC、超时和序号。
- 采样偏置/增益校准、看门狗、硬件故障输入和软件状态机同时存在。
- 交付 Git 仓库、BOM/接线图、主机单测、CSV 波形和故障报告。

示例验收值（需按板卡调整）：连续采样 10 分钟无丢帧；过流输入触发后两个 PWM 周期内关闭；主机测试覆盖核心模块 80% 以上分支。

### 项目二：Sensor-Foc-Drive

在项目一上加入有感 PMSM/BLDC FOC，先仿真再实机：

```text
ADC/编码器 → 标定与时间戳 → Clarke/Park
          → Id/Iq PI + 限压/抗饱和/解耦
          → 反 Park → SVPWM → 互补 PWM
```

必须包含转子对齐、开环爬升、闭环切换、方向检查、限速限流、急停和编码器零电角校准。示例目标为 20 kHz 电流环、1 kHz 速度环；具体频率取决于 MCU、驱动板和电机。

验收要给出测试条件：电流阶跃误差、速度阶跃超调/稳态误差、ISR 抖动、CPU 占用、母线电压和负载。仿真结果和实机结果要能逐项对拍，不能只放“电机转起来”的视频。

### 项目三：Production-Like-Motor-Controller

把项目二包装成大厂能读懂的固件栈：

- 快速控制 ISR、1 kHz 控制任务、10–100 Hz 通信/遥测任务、日志任务明确分层。
- CAN 参数协议有版本、缩放、心跳、超时、故障码和错误计数；Flash 参数有 CRC 和双备份。
- 过流、欠压、过温、堵转、传感器断线和看门狗都有状态转移、恢复条件和复现步骤。
- 主机单测、录播数据回放、HIL 或故障注入进入 CI；README 说明已知限制和未验证项。

可选指标：CPU 峰值低于 70%、栈余量高于 20%、控制 ISR 抖动低于周期的 5%、连续回归 2 小时无崩溃。指标只是示例，必须带硬件、编译选项和测量方法。

## 必须能讲清的概念

| 模块 | 面试前的最低解释深度 |
| --- | --- |
| C 与内存 | `volatile` 解决什么问题、不能解决什么问题；ISR 共享数据如何避免竞态；栈/堆/链接脚本/map 如何影响固件 |
| PWM 与采样 | 为什么中心对齐、何时触发 ADC、互补输出和死区怎样避免直通、Break 为什么要走硬件链路 |
| 实时性 | ISR 周期、最坏执行时间、抖动、优先级和 DMA 缓冲怎样测量；为什么控制环不能 `delay` 或阻塞通信 |
| FOC | Clarke/Park 的约定、$	heta_e=p	heta_m+	heta_0$、$i_d/i_q$ 的物理意义、编码器零偏和方向如何校准 |
| PI 与 SVPWM | 离散化、积分抗饱和、限压、采样/PWM 延迟、六扇区和线性调制边界如何影响稳定性 |
| 保护 | 过流、欠压、过温、堵转和传感器失联的检测路径、响应时间、锁存/恢复策略和故障码 |
| 通信 | CAN 仲裁/过滤/错误状态，UART 帧同步、CRC、超时、序号和心跳；应用信号如何缩放并处理越界 |
| RTOS | 哪些工作放 ISR、哪些放任务；队列/通知/互斥和优先级反转；栈水位与看门狗如何验证 |
| 调试 | 电机不转、抖动、过流、速度漂移时，如何按“供电→PWM→采样→角度→变换→PI→负载”排查并用波形证伪 |

每道题用四句话回答：定义或现象 → 取舍 → 项目证据 → 失败与修复。这样比背一段控制理论更接近面试追问。

## 求职交付包

投递前至少准备以下材料：

1. 一个可 clean build 的 Git 仓库，包含源码、构建命令、芯片/板卡版本和参数文件。
2. 一张架构图、一张 PWM-ADC-ISR 时序图、一张故障状态机图。
3. 三组数据：电流/速度阶跃、实时性（周期/抖动/CPU/内存）、故障注入（触发到关断的时间）。
4. 3–5 分钟演示和 1 页技术报告；明确哪些是仿真、示例阈值或尚未验证。
5. 两个简历版本：电机控制版突出 FOC/采样/保护，通用嵌入式版突出 C/RTOS/通信/测试。

项目经历不要写“学习了 FOC”。写成“在某 MCU 上用定时器同步 ADC，完成有感 PMSM 电流环；通过示波器测得采样时刻和 ISR 抖动，加入硬件 Break 与软件故障状态机，并用录播数据回归验证”。所有数字都必须能从仓库或实验记录追溯。

## 安全、核验与资料入口

只在 12–24 V、限流、带急停和隔离条件下做上板实验；不要把裸 MOSFET 半桥或高压母线作为几个月内的学习捷径。先用示波器确认 PWM 互补、死区、ADC 触发和故障关断，再接电机。

当前笔记有几类必须主动复核的风险：DengFOC 示例是轮询/SPWM 风格，不能直接代表固定频率 FOC；STM32 示例中的阻塞式回调不能放进快速 ISR；部分低通离散化、参数测量和 PI 推导依赖特定假设。发现矛盾时保留原始条件和“不确定”，不要把 AI 整理内容改写成已验证事实。

推荐的官方资料入口：

- [STM32G4 系列](https://www.st.com/en/microcontrollers-microprocessors/stm32g4-series.html) 与对应参考手册/数据手册
- [STM32CubeG4](https://www.st.com/en/embedded-software/stm32cubeg4.html)
- [Arm CMSIS 文档](https://arm-software.github.io/CMSIS_6/latest/)
- [FreeRTOS 文档](https://www.freertos.org/)
- [TI C2000 MotorControl SDK](https://www.ti.com/tool/C2000WARE-MOTORCONTROL-SDK)

这篇路线是 AI 基于现有笔记和公开岗位样本整理的未验证规划；岗位开放状态、芯片外设细节、控制指标和安全阈值都应在实际项目中重新核对。
