# AI 知识库索引

> 本文件由 `npm run knowledge:index` 根据文章 Front Matter 自动生成，请勿手工编辑。

AI 处理新资料时，应先在本索引中按标题、别名、标签和范围筛选候选文章，再精读候选正文。相同主题优先合并，边界不同但有关联的主题通过 `related_posts` 连接。

## 概览

| ID | 标题 | 分类 | 审核状态 |
| --- | --- | --- | --- |
| `altium-designer-notes` | Altium Designer 原理图与 PCB 使用笔记 | 开发工具 | `unverified` |
| `analog-filter-design` | 模拟滤波器设计：参数、Sallen-Key 与 MFB | 硬件设计 | `unverified` |
| `component-selection-parameters` | 常用元器件关键参数与选型检查表 | 电子基础 | `unverified` |
| `dengfoc-control-code` | DengFOC 常用控制代码与三环结构 | 电机控制 | `unverified` |
| `dual-three-phase-pmsm` | 双三相永磁同步电机 SVPWM | 电机控制 | `unverified` |
| `embedded-communication-protocols` | 嵌入式通信协议：UART、I2C、SPI 与 CAN | 嵌入式开发 | `unverified` |
| `embedded-system-basics` | 嵌入式基础：GPIO 输出、Keil 工程与自举电荷泵 | 嵌入式开发 | `unverified` |
| `encoder-pll-speed-estimation` | 编码器 PLL 位置跟踪与速度估计 | 电机控制 | `unverified` |
| `git-daily-usage` | Git 日常使用指南 | 开发工具 | `unverified` |
| `llm-inference-acceleration-career-report` | 大模型推理加速就业与技术方向调研报告（2026） | 人工智能 | `unverified` |
| `motor-drive-pcb-layout` | 电机驱动 PCB 布局与布线要点 | 硬件设计 | `unverified` |
| `motor-drive-power-supply` | 电机驱动电源与保护器件设计笔记 | 硬件设计 | `unverified` |
| `motor-embedded-software-roadmap` | 电机嵌入式软件实习路线：从 PMSM/FOC 到可交付固件 | 学习路线 | `unverified` |
| `pmsm-control-basics` | PMSM 控制基础：一阶滞后、DOB 与低通滤波器 | 电机控制 | `unverified` |
| `pmsm-harmonic-analysis` | 永磁同步电机谐波与六相矢量空间分析 | 电机控制 | `unverified` |
| `pmsm-parameter-measurement` | PMSM 电感与磁链参数测量 | 电机控制 | `unverified` |
| `pmsm-speed-loop-pi-tuning` | PMSM 转速环 PI 参数整定推导 | 电机控制 | `unverified` |
| `semiconductor-basics` | 半导体基础：PN 结与 MOSFET | 电子基础 | `unverified` |
| `simulink-motor-simulation` | Simulink 电机控制仿真常用模块与建议 | 仿真工具 | `unverified` |
| `stm32-clion-development` | STM32 与 CLion 开发实践 | 嵌入式开发 | `unverified` |
| `three-phase-pmsm` | 三相永磁同步电机建模与控制 | 电机控制 | `human-verified` |
| `word-formatting-notes` | Word 中文论文排版与公式行距设置 | 开发工具 | `unverified` |

## 检索信息

### Altium Designer 原理图与 PCB 使用笔记

- ID：`altium-designer-notes`
- 文件：`source/_posts/altium-designer-notes.md`
- 范围：覆盖 Altium Designer 原理图库、原理图和 PCB 编辑操作；电机功率板布局规范由独立文章维护。
- 别名：AD、Altium、AD 原理图与 PCB
- 标签：Altium Designer、原理图、PCB
- 关联文章：`motor-drive-pcb-layout`、`component-selection-parameters`
- 原稿：`archive/original-posts/AD使用.md`

### 模拟滤波器设计：参数、Sallen-Key 与 MFB

- ID：`analog-filter-design`
- 文件：`source/_posts/analog-filter-design.md`
- 范围：覆盖模拟滤波器指标、Sallen-Key 与 MFB 设计；控制算法中的低通离散化由 PMSM 控制基础文章维护。
- 别名：有源滤波器、Sallen-Key 滤波器、MFB 滤波器
- 标签：模拟滤波器、Sallen-Key、MFB、运算放大器
- 关联文章：`pmsm-control-basics`、`motor-drive-pcb-layout`
- 原稿：`archive/original-posts/滤波器设计.md`

### 常用元器件关键参数与选型检查表

- ID：`component-selection-parameters`
- 文件：`source/_posts/component-selection-parameters.md`
- 范围：覆盖 PPTC 与增强型 NMOSFET 的工程选型；器件原理、电源保护和 PCB 应用分别由关联文章维护。
- 别名：器件选型、PPTC 选型、NMOSFET 选型
- 标签：元器件选型、PPTC、MOSFET
- 关联文章：`semiconductor-basics`、`motor-drive-power-supply`、`motor-drive-pcb-layout`、`altium-designer-notes`
- 原稿：`archive/original-posts/元器件关键参数.md`

### DengFOC 常用控制代码与三环结构

- ID：`dengfoc-control-code`
- 文件：`source/_posts/dengfoc-control-code.md`
- 范围：覆盖 DengFOC 坐标变换与三环代码实现；PMSM 理论、PI 参数推导与编码器 PLL 由关联文章维护。
- 别名：DengFOC、FOC 三环控制、位置速度电流三环
- 标签：DengFOC、FOC、位置环、速度环、电流环
- 关联文章：`three-phase-pmsm`、`pmsm-speed-loop-pi-tuning`、`stm32-clion-development`、`pmsm-parameter-measurement`、`motor-embedded-software-roadmap`、`encoder-pll-speed-estimation`
- 原稿：`archive/original-posts/dengfoc学习笔记-常用foc代码.md`

### 双三相永磁同步电机 SVPWM

- ID：`dual-three-phase-pmsm`
- 文件：`source/_posts/dual-three-phase-pmsm.md`
- 范围：覆盖双三相逆变器空间矢量与两矢量 SVPWM；谐波和 VSD 推导由六相矢量空间文章维护。
- 别名：双三相 PMSM、六相逆变器 SVPWM
- 标签：双三相 PMSM、SVPWM、六相逆变器
- 关联文章：`three-phase-pmsm`、`pmsm-harmonic-analysis`
- 原稿：`archive/original-posts/双三相永磁同步电机.md`

### 嵌入式通信协议：UART、I2C、SPI 与 CAN

- ID：`embedded-communication-protocols`
- 文件：`source/_posts/embedded-communication-protocols.md`
- 范围：覆盖 UART、I2C、SPI 与 CAN 的协议原理和工程约束；STM32 代码实现由开发实践文章维护。
- 别名：串口与总线协议、UART I2C SPI CAN
- 标签：UART、I2C、SPI、CAN
- 关联文章：`embedded-system-basics`、`stm32-clion-development`、`motor-embedded-software-roadmap`
- 原稿：`archive/original-posts/嵌入式.md`

### 嵌入式基础：GPIO 输出、Keil 工程与自举电荷泵

- ID：`embedded-system-basics`
- 文件：`source/_posts/embedded-system-basics.md`
- 范围：覆盖 GPIO 输出模式、Keil 工程结构和自举电荷泵；通信协议与 STM32 实现由关联文章维护。
- 别名：GPIO 输出模式、Keil 工程结构、自举电荷泵
- 标签：GPIO、Keil、电荷泵
- 关联文章：`embedded-communication-protocols`、`stm32-clion-development`、`motor-drive-power-supply`、`motor-embedded-software-roadmap`
- 原稿：`archive/original-posts/嵌入式基础知识.md`

### 编码器 PLL 位置跟踪与速度估计

- ID：`encoder-pll-speed-estimation`
- 文件：`source/_posts/encoder-pll-speed-estimation.md`
- 范围：分析编码器二阶 PLL 的连续模型、传递函数、稳态跟踪能力、环形位置处理与参数选择；具体控制环设计由关联文章维护。
- 别名：编码器 PLL、编码器锁相环、PLL 速度估计
- 标签：编码器、PLL、速度估计、位置观测器
- 关联文章：`pmsm-control-basics`、`dengfoc-control-code`、`pmsm-speed-loop-pi-tuning`、`motor-embedded-software-roadmap`
- 原稿：`archive/incoming/2026-08-03/编码器PLL理论分析.md`

### Git 日常使用指南

- ID：`git-daily-usage`
- 文件：`source/_posts/git-daily-usage.md`
- 范围：整理 Git 日常工作流、分支与提交原理、差异复核、历史查看、Merge Request，以及 pre-commit 和 GitLab CI 排错。
- 别名：Git 日常使用、Git 工作流、GitLab MR、Git 分支与提交、Git CI 排错
- 标签：Git、版本控制、GitLab
- 关联文章：`motor-embedded-software-roadmap`
- 原稿：`archive/incoming/2026-08-24/Git分支、提交与CI问题整理.md`

### 大模型推理加速就业与技术方向调研报告（2026）

- ID：`llm-inference-acceleration-career-report`
- 文件：`source/_posts/llm-inference-acceleration-career-report.md`
- 范围：基于 2026-08-23 可核对的官方岗位样本、开源项目文档和论文，分析大模型推理加速的就业岗位族、技术栈、进入门槛、硬件与内存方向匹配度及 12 周验证路线。
- 别名：大模型推理加速就业报告、LLM Inference 加速方向、推理系统工程师路线
- 标签：大模型推理、推理加速、CUDA、GPU、C++、KV Cache、AI 编译器、量化、就业调研
- 关联文章：无
- 原稿：`archive/incoming/2026-08-23/llm-inference-acceleration-career-report-research.md`

### 电机驱动 PCB 布局与布线要点

- ID：`motor-drive-pcb-layout`
- 文件：`source/_posts/motor-drive-pcb-layout.md`
- 范围：覆盖电机驱动 PCB 的接地、散热、功率回路和采样布局；器件原理与电源保护由关联文章维护。
- 别名：电机驱动板布局、功率 PCB 布线
- 标签：电机驱动、PCB、接地、热设计、电流采样
- 关联文章：`altium-designer-notes`、`analog-filter-design`、`component-selection-parameters`、`motor-drive-power-supply`、`semiconductor-basics`
- 原稿：`archive/original-posts/电机驱动PCB-翻译总结.md`

### 电机驱动电源与保护器件设计笔记

- ID：`motor-drive-power-supply`
- 文件：`source/_posts/motor-drive-power-supply.md`
- 范围：覆盖电机驱动中的过压、热插拔、Buck 与电子保险丝设计；PCB 布局和半导体原理由关联文章维护。
- 别名：电机驱动电源、热插拔与电子保险丝、Buck 电源设计
- 标签：电源设计、过压保护、热插拔、Buck
- 关联文章：`component-selection-parameters`、`embedded-system-basics`、`motor-drive-pcb-layout`、`semiconductor-basics`
- 原稿：`archive/original-posts/电机电源.md`

### 电机嵌入式软件实习路线：从 PMSM/FOC 到可交付固件

- ID：`motor-embedded-software-roadmap`
- 文件：`source/_posts/motor-embedded-software-roadmap.md`
- 范围：面向未来 12–16 周的电机嵌入式软件求职路线，基于现有 PMSM/FOC 与 STM32 笔记，覆盖 C、实时外设、同步采样、控制实现、保护、通信、测试、项目作品和面试验收。
- 别名：电机嵌入式软件学习路线、PMSM FOC 嵌入式路线、电机控制固件求职路线
- 标签：电机嵌入式、STM32、FOC、PMSM、C 语言、实时系统、实习求职、项目制学习
- 关联文章：`embedded-system-basics`、`stm32-clion-development`、`embedded-communication-protocols`、`three-phase-pmsm`、`pmsm-control-basics`、`dengfoc-control-code`、`pmsm-parameter-measurement`、`pmsm-speed-loop-pi-tuning`、`simulink-motor-simulation`、`encoder-pll-speed-estimation`、`git-daily-usage`
- 原稿：`archive/incoming/2026-08-22/motor-embedded-software-roadmap-research.md`、`archive/original-posts/嵌入式基础知识.md`、`archive/original-posts/嵌入式.md`、`archive/original-posts/STM32_CLION.md`、`archive/original-posts/三相永磁同步电机.md`、`archive/original-posts/dengfoc学习笔记-常用foc代码.md`、`archive/original-posts/转速环PI参数整定.md`、`archive/original-posts/电机疑问讨论.md`、`archive/original-posts/simulink仿真.md`

### PMSM 控制基础：一阶滞后、DOB 与低通滤波器

- ID：`pmsm-control-basics`
- 文件：`source/_posts/pmsm-control-basics.md`
- 范围：覆盖一阶滞后、扰动观测器和低通离散化；PMSM 完整模型、速度环整定与编码器 PLL 由关联文章维护。
- 别名：PMSM 自动控制原理、扰动观测器、一阶低通滤波器
- 标签：PMSM、DOB、低通滤波器、离散化
- 关联文章：`analog-filter-design`、`three-phase-pmsm`、`pmsm-speed-loop-pi-tuning`、`motor-embedded-software-roadmap`、`encoder-pll-speed-estimation`
- 原稿：`archive/original-posts/pmsm自动控制原理.md`

### 永磁同步电机谐波与六相矢量空间分析

- ID：`pmsm-harmonic-analysis`
- 文件：`source/_posts/pmsm-harmonic-analysis.md`
- 范围：覆盖三相空间谐波、六相时间谐波与 VSD 模型；不重复三相 PMSM 基础控制和双三相 SVPWM 实现。
- 别名：PMSM 谐波分析、六相电机 VSD、矢量空间解耦
- 标签：PMSM、空间谐波、六相电机、Clarke 变换、VSD
- 关联文章：`dual-three-phase-pmsm`、`three-phase-pmsm`、`simulink-motor-simulation`
- 原稿：`archive/original-posts/永磁同步电机谐波分析.md`

### PMSM 电感与磁链参数测量

- ID：`pmsm-parameter-measurement`
- 文件：`source/_posts/pmsm-parameter-measurement.md`
- 范围：覆盖 PMSM 相电感、dq 轴电感与永磁体磁链测量；控制模型和代码实现由关联文章维护。
- 别名：PMSM 参数辨识、电机电感测量、永磁体磁链测量
- 标签：PMSM、参数辨识、电感测量、磁链
- 关联文章：`three-phase-pmsm`、`dengfoc-control-code`、`simulink-motor-simulation`、`motor-embedded-software-roadmap`
- 原稿：`archive/original-posts/电机疑问讨论.md`

### PMSM 转速环 PI 参数整定推导

- ID：`pmsm-speed-loop-pi-tuning`
- 文件：`source/_posts/pmsm-speed-loop-pi-tuning.md`
- 范围：覆盖带有功阻尼的 PMSM 转速环 PI 推导；电流环、完整电机模型、反馈估计和代码实现由关联文章维护。
- 别名：转速环 PI、速度环参数整定、PMSM 速度环
- 标签：PMSM、PI 控制、转速环、有功阻尼
- 关联文章：`pmsm-control-basics`、`dengfoc-control-code`、`three-phase-pmsm`、`motor-embedded-software-roadmap`、`encoder-pll-speed-estimation`
- 原稿：`archive/original-posts/转速环PI参数整定.md`

### 半导体基础：PN 结与 MOSFET

- ID：`semiconductor-basics`
- 文件：`source/_posts/semiconductor-basics.md`
- 范围：覆盖 PN 结与增强型 MOSFET 的工作原理；具体器件选型、电源应用和 PCB 布局由关联文章维护。
- 别名：PN 结、MOSFET 基础、功率半导体基础
- 标签：PN 结、MOSFET、半导体
- 关联文章：`component-selection-parameters`、`motor-drive-power-supply`、`motor-drive-pcb-layout`
- 原稿：`archive/original-posts/基础元器件.md`

### Simulink 电机控制仿真常用模块与建议

- ID：`simulink-motor-simulation`
- 文件：`source/_posts/simulink-motor-simulation.md`
- 范围：覆盖 Simulink 电机控制模块、建模建议与无感仿真入口；电机和谐波理论由关联文章维护。
- 别名：电机 Simulink 仿真、PMSM 仿真、无感控制仿真
- 标签：Simulink、电机仿真、无感控制
- 关联文章：`three-phase-pmsm`、`pmsm-harmonic-analysis`、`pmsm-parameter-measurement`、`motor-embedded-software-roadmap`
- 原稿：`archive/original-posts/simulink仿真.md`

### STM32 与 CLion 开发实践

- ID：`stm32-clion-development`
- 文件：`source/_posts/stm32-clion-development.md`
- 范围：覆盖 STM32 的 CLion/CMake 配置与外设代码；通信协议原理和 FOC 理论由关联文章维护。
- 别名：STM32 CLion、STM32 CMake、STM32 HAL 外设
- 标签：STM32、CLion、CMake、HAL
- 关联文章：`embedded-system-basics`、`embedded-communication-protocols`、`dengfoc-control-code`、`motor-embedded-software-roadmap`
- 原稿：`archive/original-posts/STM32_CLION.md`

### 三相永磁同步电机建模与控制

- ID：`three-phase-pmsm`
- 文件：`source/_posts/three-phase-pmsm.md`
- 范围：三相 PMSM 的建模假设、abc/αβ/dq 方程、Simulink 状态模型、SPMSM 简化、SVPWM 三种占空比算法与电流环；速度环、参数测量和谐波分析由关联文章维护。
- 别名：三相 PMSM、PMSM FOC、永磁同步电机建模、PMSM 数学模型、PMSM Simulink 模型
- 标签：PMSM、数学建模、状态空间、Simulink、SVPWM、电流环
- 关联文章：`dual-three-phase-pmsm`、`pmsm-control-basics`、`pmsm-harmonic-analysis`、`pmsm-parameter-measurement`、`pmsm-speed-loop-pi-tuning`、`dengfoc-control-code`、`simulink-motor-simulation`、`motor-embedded-software-roadmap`
- 原稿：`archive/original-posts/三相永磁同步电机.md`、`archive/incoming/2026-08-10/pmsm_mathematical_model.md`

### Word 中文论文排版与公式行距设置

- ID：`word-formatting-notes`
- 文件：`source/_posts/word-formatting-notes.md`
- 范围：覆盖 Word 中文论文中的段落、字体、题注与公式排版，不涉及论文内容写作和引用管理。
- 别名：Word 公式排版、中文论文格式
- 标签：Word、论文排版、公式
- 关联文章：无
- 原稿：`archive/original-posts/word使用.md`

