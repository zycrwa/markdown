---
title: "AI Infra 就业与学习路线：从系统基础到推理运行时（2026）"
date: 2026-08-23 00:40:00
updated: 2026-08-24 00:00:59
description: "面向非模型算法路线的 AI Infra 岗位地图，以及系统基础、推理运行时、训练系统、编译器后端与平台工程的学习资料和 24 周实践路线。"
permalink: ai/llm-inference-acceleration-career-report/
categories:
  - 人工智能
tags:
  - AI Infra
  - 大模型推理
  - 推理系统
  - 系统软件
  - C++
  - CUDA
  - AI 编译器
  - 分布式训练
  - 边缘推理
  - 学习路线
  - 就业调研
aliases:
  - 大模型推理加速就业与技术方向调研报告（2026）
  - 大模型推理加速就业报告
  - LLM Inference 加速方向
  - AI Infra 学习路线
  - 推理系统工程师路线
related_posts: []
source_docs:
  - "archive/incoming/2026-08-23/llm-inference-acceleration-career-report-research.md"
review_status: unverified
toc: true
---

本文面向这样一种选择：不把主要精力放在训练新模型、设计网络结构或发表模型算法论文，而是学习 AI 系统中更基础、更通用的工程岗位。

这里的 **AI Infra** 是 AI Infrastructure 的缩写，指支撑模型训练、部署和运行的基础设施，包括资源调度、推理服务、运行时、编译器、算子库、GPU/NPU 适配、监控和成本优化。它不是一个单独岗位，而是一组岗位的总称。

本文根据 2026-08-23 核对的字节跳动、腾讯官方招聘页面，以及开源项目官方文档和论文，重新整理岗位边界、学习顺序和作品要求。岗位状态、薪资和技术栈会变化，文中的判断属于未验证的求职参考。

<!-- more -->

## 一、先区分 AI 行业里的几类岗位

很多人把“AI 工作”理解成训练模型，其实模型只是整个系统的一层。一个模型从代码变成用户可用的服务，会涉及下面这些层。它们是系统分层，不是严格的单向执行顺序：

```text
模型与权重
   ↓
编译、图优化、算子和后端适配
   ↓
推理运行时、内存、调度和批处理
   ↓
服务接口、资源调度、监控和故障处理
   ↓
GPU/NPU/CPU/边缘设备上的实际部署
```

### 岗位地图

| 岗位族 | 主要工作 | 常见技术 | 岗位性质 |
| --- | --- | --- | --- |
| 模型算法/训练研发 | 结构设计、训练、微调、损失函数、数据和论文 | PyTorch、数学、分布式训练、实验设计 | 是；不是本文主线 |
| AI 应用开发 | 调 API、RAG、Agent、业务流程和前端接口 | Python、Web、数据库、模型 API | 不是底层 Infra |
| AI Infra/ML 平台 | 训练或推理平台、资源调度、任务编排、监控、权限和成本 | Linux、Python/Go/C++、RPC、容器、Kubernetes、分布式系统 | 是基础设施 |
| 推理运行时/推理引擎 | 模型加载、图执行、动态批处理、内存、并发、延迟和吞吐 | C++、Python、CUDA、ONNX、TensorRT、vLLM、SGLang | 是基础设施 |
| 分布式训练系统 | 数据/张量/流水并行、通信、Checkpoint、容错和集群效率 | PyTorch Distributed、NCCL、DeepSpeed、Megatron、CUDA | 是基础设施，不负责设计模型结构 |
| AI 编译器/后端 | 图优化、算子融合、layout、IR、代码生成和自动调优 | C++、LLVM、MLIR、TVM、Triton、硬件 ISA | 是基础设施 |
| GPU/NPU Runtime 与算子库 | 设备内存、Kernel、通信、算子实现和芯片适配 | C/C++、CUDA、CANN/Ascend C 或其他 NPU SDK | 是基础设施 |
| AI 性能工程 | 定位 CPU/GPU/NPU 瓶颈，优化带宽、Kernel、调度、功耗和尾延迟 | Profiler、体系结构、CUDA、perf、benchmark | 是基础设施 |
| C++ 边缘推理 | 在手机、机器人、汽车、工业设备上做模型转换和运行时部署 | C++、ONNX Runtime、llama.cpp、OpenVINO、NPU SDK | 是端侧基础设施 |
| MLOps/平台运维 | 发布、训练任务、镜像、监控、弹性和服务可靠性 | Python/Go、Kubernetes、云平台、Prometheus | 偏平台工程 |

因此，**AI Infra 不是“只做大模型”的岗位**。它的核心能力是系统软件、计算机体系结构、并发、内存、编译器、设备和性能工程，这些能力也能服务于不同模型和不同硬件。

## 二、你的目标应该怎样定位

你明确表示对模型开发兴趣不大，更想做 AI 中重要、基础的岗位。比较适合的定位顺序是：

### 第一选择：AI 系统软件 / 推理运行时

这是最适合作为主线的方向。日常工作可能包括：

- 设计模型执行器和请求处理流程；
- 管理 CPU/GPU/NPU 内存和异步任务；
- 实现动态批处理、请求队列、取消、超时和 OOM 处理；
- 分析首 token 延迟、token 间隔、吞吐和 p99 尾延迟；
- 修改 vLLM、SGLang、TensorRT-LLM、ONNX Runtime 或自研 Runtime；
- 把模型、编译器、算子和设备后端连接起来。

这里会接触 KV Cache、分页内存、Prefix Cache 等知识，但它们只是运行时中的组成部分，不需要把个人职业方向命名成“KV allocator”。

**KV allocator 是什么？** 大模型逐 token 生成时，会保存历史 token 的 Key/Value 张量，避免每一步重新计算，这块内存称为 KV Cache。KV allocator 就是负责给不同请求分配、复用和回收这些内存块的模块，可以把它理解成“推理运行时内部专门管理 KV Cache 的内存池”。它是 Runtime 的一个子系统，不是通常意义上的独立岗位。PagedAttention 使用分页组织和访问 KV Cache，allocator 负责管理相应的物理块；二者有关联，但不是同一个概念。

### 第二选择：AI 编译器 / NPU 后端 / 算子性能

这是更偏底层、长期价值较高的路线：

- 把模型计算图转换成适合目标硬件的 IR；
- 做算子融合、layout 变换、内存规划和代码生成；
- 维护 CPU/GPU/NPU 算子实现和精度测试；
- 分析硬件带宽、缓存、并行度和指令执行效率。

它的门槛高于一般模型部署，需要 C++、编译原理、体系结构和一定数学基础。适合在系统基础稳定后进入，不建议一开始就把“实现完整 AI 编译器”作为目标。

### 第三选择：AI 平台 / Serving / 资源调度

这条路线更接近分布式系统和平台工程：

- GPU 资源池、任务调度和隔离；
- RPC、服务发现、限流、重试和故障转移；
- Docker/Kubernetes、监控、日志和告警；
- 模型服务发布、灰度、扩缩容、成本和 SLO。

它对 C++ 的要求可能不如 Runtime 岗稳定，常见语言还包括 Go 和 Python；但系统设计、网络、容器和分布式能力很重要。

可以用“数据面/控制面”区分它与推理 Runtime：数据面执行模型、批处理请求并管理推理内存；控制面负责模型部署、路由、配额、扩缩容、资源调度和故障恢复。不同公司的岗位边界可能重叠，但这两个视角有助于读懂 JD。

### 第四选择：分布式训练系统

不做模型算法也可以参与训练系统。该方向关注如何让已有模型在多机多卡上稳定、高效地训练：

- Data/Tensor/Pipeline/Expert Parallel 的切分与通信；
- NCCL collective、通信与计算重叠；
- 显存优化、混合精度、Checkpoint 和故障恢复；
- 训练任务调度、弹性和集群利用率。

这也是重要的 AI Infra 岗位，但通常依赖多 GPU 环境，短期个人项目的验证成本高于单机推理 Runtime。可以先学 PyTorch Distributed 和 NCCL 的基本模型，再根据实验室或实习条件深入。

### 辅助选择：C++ 边缘推理

边缘推理是很好的实践入口，也可以作为求职备选：

- 没有高端 GPU 时可以用 CPU、llama.cpp 或 ONNX Runtime 开始；
- 能训练模型加载、量化、内存、线程和性能测试能力；
- 将来可转向 NPU 后端、设备 Runtime 或服务器推理。

但要区分“核心推理引擎/后端开发”和“配置厂商 SDK 做业务接入”。前者属于 AI Infra，后者可能更接近应用集成。

### 推荐的个人标签

不要笼统写“大模型工程师”，可以根据项目选择：

- AI Infra / ML Systems Engineer；
- Inference Runtime Engineer；
- Inference Engine / Performance Engineer；
- AI Compiler / NPU Backend Engineer；
- GPU/NPU Runtime Engineer；
- AI Platform / Model Serving Engineer；
- Edge AI Runtime Engineer。

## 三、AI Infra 的共同基础

### 1. 系统编程

必须能独立写、测、调一个中小型 C++ 系统：

- C++17：RAII、移动语义、对象生命周期、模板、容器和 allocator；
- 内存：对齐、缓存局部性、内存映射、池化、碎片和所有权；
- 并发：线程、锁、条件变量、线程池、取消和超时；先保证正确性，再把原子和无锁结构作为进阶内容；
- 工程：CMake、Git、单元测试、日志、错误处理和可重复构建；
- 调试：GDB、AddressSanitizer、ThreadSanitizer、perf。

### 2. Linux 与操作系统

需要理解进程、虚拟内存、文件描述符、系统调用、调度、I/O、NUMA 和基本网络，而不是只会在 Linux 上执行 Python 脚本。

### 3. AI 推理最小知识

不需要先成为模型研究员，但要能解释：

- Transformer、Attention、RoPE、GQA/MQA 的基本张量形状；
- 矩阵乘、Softmax、数据类型和计算量/访存量的基本关系；
- Prefill 和 Decode 为什么有不同的计算/访存特征；
- 模型权重、临时 workspace 和 KV Cache 如何占用内存；
- 量化如何影响带宽、显存、精度和算子覆盖；
- TTFT、TPOT/ITL、吞吐、p50/p95/p99 的含义。

### 4. 性能工程

任何“加速”都需要回答：

- 瓶颈是计算、内存带宽、容量、Kernel 启动、调度还是通信？
- 基线是什么，测试模型、shape、dtype、batch 和硬件是什么？
- 结果是否在多个输入和多个并发下成立？
- 精度、功耗、稳定性和尾延迟是否变差？

## 四、具体学习资料

下面按学习顺序列资料，不建议一次性全部通读。每个阶段只选一本主教材配合官方文档，其余资料用于查缺补漏；24 周路线是入门验证，不代表半年后已经掌握整个 AI Infra。

- **必学**：C++ 基础、Linux/操作系统、并发、CMake/测试、最小 Python/PyTorch、一个推理 Runtime；
- **查阅**：cppreference、Core Guidelines、GDB/perf/Sanitizer 和各项目官方文档；
- **选方向后进阶**：CUDA、MLIR/TVM、Kubernetes、NCCL 和多 GPU。

当前开发机是 Windows，建议使用 WSL2 完成 Linux/C++/ONNX Runtime 的日常实验；`perf`、TSan、vLLM、Triton 和 CUDA 工具优先在原生 Linux、WSL2 支持的环境或远程 Linux GPU 机器上运行。不同工具在 Windows/WSL2 的支持程度会变化，实验前应核对官方要求。

### A. C++、Linux 与系统基础：第一优先级

| 主题 | 资料 | 使用方式 |
| --- | --- | --- |
| C++ 语言参考 | [cppreference](https://en.cppreference.com/) | 遇到语言、容器、并发库问题时查，不建议从头背 |
| C++ 工程规范 | [C++ Core Guidelines](https://isocpp.github.io/CppCoreGuidelines/CppCoreGuidelines) | 重点看资源管理、接口、并发和错误处理 |
| C++ 并发 | 《C++ Concurrency in Action》 | 重点掌握线程、锁、原子、条件变量和线程池 |
| C++ 设计 | 《Effective Modern C++》 | 重点掌握移动语义、类型推导、智能指针和接口设计 |
| 数据结构与算法 | [MIT 6.006](https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-fall-2011/) | 掌握数组、哈希、树、堆、图和复杂度，不以刷题数量代替实现能力 |
| 最小 Python | [Python 官方教程](https://docs.python.org/3/tutorial/) | 能读写实验脚本、处理数据、调用 PyTorch 和编写测试 |
| 操作系统 | [OSTEP](https://pages.cs.wisc.edu/~remzi/OSTEP/) | 先读进程、虚拟内存、并发和文件系统章节 |
| 系统底层 | [CS:APP](https://csapp.cs.cmu.edu/) | 重点读机器表示、链接、异常控制流、虚拟内存和并发 |
| CMake | [CMake 官方教程](https://cmake.org/cmake/help/latest/guide/tutorial/) | 让项目可以在干净环境一键构建 |
| 单元测试 | [GoogleTest](https://google.github.io/googletest/) | 给内存池、队列、调度器建立回归测试 |
| 调试 | [GDB 文档](https://sourceware.org/gdb/documentation/) | 能定位崩溃、死锁和生命周期问题 |
| 内存/竞态检查 | Clang [ASan](https://clang.llvm.org/docs/AddressSanitizer.html)、[UBSan](https://clang.llvm.org/docs/UndefinedBehaviorSanitizer.html)、[TSan](https://clang.llvm.org/docs/ThreadSanitizer.html) | 使用工具检查越界、未定义行为和数据竞争，而不是只靠打印日志 |
| CPU 性能 | [Linux perf](https://perf.wiki.kernel.org/) 与 `man perf` | 查看 CPU 时间、调用栈、缓存和热点 |
| 网络编程 | [Beej's Guide to Network Programming](https://beej.us/guide/bgnet/) | 理解 socket、TCP 和客户端/服务端的最小实现 |

配套作品：C++ ring buffer、线程池、固定大小内存池、生产者消费者队列。每个作品都要有单测、压力测试、Sanitizer 和 benchmark。

### B. 计算机体系结构与性能：第二优先级

| 主题 | 资料 | 重点 |
| --- | --- | --- |
| 体系结构（Kernel/编译器分支选读） | 《Computer Architecture: A Quantitative Approach》 | Cache、带宽、流水、SIMD、GPU 和性能估算 |
| 系统性能（按问题查阅） | 《Systems Performance》 | 以指标和工具定位瓶颈，而不是凭感觉优化 |
| Linux 性能 | Brendan Gregg 的 [Linux Performance](https://www.brendangregg.com/linuxperf.html) | perf、火焰图、I/O、CPU 和内存分析 |
| 分布式系统（平台分支选读） | 《Designing Data-Intensive Applications》 | 复制、一致性、消息、故障和可扩展性 |
| RPC | [gRPC 官方文档](https://grpc.io/docs/) | 为后续模型服务和调度器建立服务接口 |
| 容器平台 | [Kubernetes 官方文档](https://kubernetes.io/docs/home/) | 后续学习 GPU 调度、部署、扩缩容和监控 |

不需要一开始把 Kubernetes 学成集群管理员。先理解 Pod、Service、Deployment、资源限制、探针和滚动发布即可。

### C. AI 与推理基础：第三优先级

| 主题 | 资料 | 重点 |
| --- | --- | --- |
| PyTorch 张量 | [PyTorch Tutorials](https://pytorch.org/tutorials/) | 重点掌握 shape、dtype/device、`inference_mode`、Profiler 和模型导出；autograd 只需理解基本作用 |
| Transformer | [原始论文](https://arxiv.org/abs/1706.03762) | 读懂 Attention、位置编码和层结构，不追求复现大模型 |
| NLP/模型基础 | [Hugging Face LLM Course](https://huggingface.co/learn/llm-course) | 模型加载、Tokenizer、推理和评测基础 |
| ML 系统全景 | [Machine Learning Systems](https://www.mlsysbook.ai/) | 建立数据、模型、服务、硬件和可靠性的整体位置感 |
| 深度学习系统 | [CMU 10-414/714](https://dlsyscourse.org/) | 选读张量、自动微分、算子和执行系统，不必完成全部训练作业 |
| 推理性能 | [vLLM PagedAttention 论文](https://arxiv.org/abs/2309.06180) | 理解推理服务中的内存和批处理问题 |
| 连续批处理 | [Orca 论文](https://www.usenix.org/conference/osdi22/presentation/yu) | 理解请求级调度与迭代级调度 |

学习目标是能看懂 Runtime 的输入输出和瓶颈，不是转去做模型结构研究。

### D. 推理 Runtime 与服务：主方向资料

| 项目 | 官方资料 | 建议读法 |
| --- | --- | --- |
| llama.cpp | [GitHub](https://github.com/ggml-org/llama.cpp) | 先运行，再看模型加载、量化、线程和后端抽象 |
| ONNX Runtime | [官方文档](https://onnxruntime.ai/docs/) | 了解模型导出、Execution Provider 和算子覆盖 |
| OpenVINO | [官方文档](https://docs.openvino.ai/) | 作为 CPU/Intel/边缘部署的对照后端 |
| TensorRT-LLM | [官方文档](https://nvidia.github.io/TensorRT-LLM/) | 有 NVIDIA GPU 后学习 Engine、量化和批处理 |
| vLLM | [官方文档](https://docs.vllm.ai/en/latest/) | 重点看 scheduler、worker、KV 管理和 benchmark |
| SGLang | [官方文档](https://docs.sglang.ai/) | 对照 Prefix/Radix Cache 和结构化请求调度 |
| ExecuTorch | [官方文档](https://pytorch.org/executorch/) | 了解 PyTorch 模型到端侧 Runtime 的路线 |
| ncnn | [GitHub](https://github.com/Tencent/ncnn) | 了解移动端 C++ 推理、ARM 优化和轻量部署 |
| MNN | [GitHub](https://github.com/alibaba/MNN) | 了解移动/边缘多后端、模型转换和设备部署 |
| LiteRT | [官方文档](https://ai.google.dev/edge/litert) | 了解移动端模型部署、硬件加速和平台集成 |

建议先选 `llama.cpp` 或 ONNX Runtime 做本地项目，再选择 vLLM 或 SGLang 做服务 Runtime 源码阅读。不要同时通读所有项目。

### E. GPU、Kernel 与异构硬件：主方向的进阶资料

| 主题 | 资料 | 进入时机 |
| --- | --- | --- |
| CUDA 编程 | [CUDA C++ Programming Guide](https://docs.nvidia.com/cuda/cuda-c-programming-guide/) | 完成 CPU Runtime 基线后 |
| GPU 教材 | 《Programming Massively Parallel Processors》 | 配合 CUDA Guide 理解线程层次、访存、同步和优化 |
| CUDA 示例 | [CUDA Samples](https://github.com/NVIDIA/cuda-samples) | 从 vector、reduction、transpose 开始 |
| GPU 时间线 | [Nsight Systems](https://developer.nvidia.com/nsight-systems) | 分析端到端调度和 CPU/GPU 重叠 |
| Kernel 细节 | [Nsight Compute](https://developer.nvidia.com/nsight-compute) | 分析访存、占用率、寄存器和吞吐 |
| Triton | [Triton Tutorials](https://triton-lang.org/main/getting-started/tutorials/index.html) | 快速实现 RMSNorm、Softmax 或矩阵乘小实验 |
| Kernel 模板 | [CUTLASS](https://docs.nvidia.com/cutlass/latest/) | 理解 tile、layout 和 Tensor Core |
| 多 GPU 通信 | [NCCL 文档](https://docs.nvidia.com/deeplearning/nccl/user-guide/docs/overview.html) | 进入分布式推理或训练平台后 |

没有 NVIDIA GPU 时，先做 CPU Runtime、ONNX/llama.cpp 和编译器基础，不要用几张 Vector Add 截图代替系统项目。

### F. AI 编译器与后端：第二条进阶路线

| 主题 | 资料 | 可交付练习 |
| --- | --- | --- |
| PyTorch 图与编译入口 | [torch.compile](https://pytorch.org/docs/stable/torch.compiler.html) / [FX](https://pytorch.org/docs/stable/fx.html) | 观察 Python 模型如何变成图并进入后端 |
| MLIR | [Toy Tutorial](https://mlir.llvm.org/docs/Tutorials/Toy/) | 观察 Dialect、Pass、Lowering 和代码生成 |
| Apache TVM | [官方文档](https://tvm.apache.org/docs/) | 完成一个 TensorIR 或算子调度示例 |
| Triton/CUDA | [Triton Tutorials](https://triton-lang.org/main/getting-started/tutorials/index.html) / [CUDA Guide](https://docs.nvidia.com/cuda/cuda-c-programming-guide/) | 把图变换与实际 Kernel、layout 和硬件约束连接起来 |
| LLVM（选读） | [Kaleidoscope Tutorial](https://llvm.org/docs/tutorial/MyFirstLanguageFrontend/) | 理解 LLVM IR 和代码生成；它是通用编译器入门，不是 AI 编译链本身 |
| OpenXLA | [官方文档](https://openxla.org/xla) | 了解图编译和硬件后端的整体位置 |

编译器路线不要求第一阶段实现完整编译器。先做一个 ONNX/MLIR 小 Pass、算子融合或 layout 变换，并用正确性测试验证。

### G. 分布式训练与集群：可选进阶路线

| 主题 | 资料 | 重点 |
| --- | --- | --- |
| PyTorch 分布式 | [Distributed Overview](https://pytorch.org/tutorials/beginner/dist_overview.html) | 先理解进程组、collective、DDP、FSDP 和并行边界 |
| FSDP | [PyTorch FSDP Tutorial](https://pytorch.org/tutorials/intermediate/FSDP_tutorial.html) | 参数、梯度和优化器状态如何分片 |
| DeepSpeed | [官方教程](https://www.deepspeed.ai/tutorials/) | ZeRO、训练内存和大规模训练工程 |
| Megatron-Core | [官方文档](https://docs.nvidia.com/megatron-core/developer-guide/latest/) | Tensor/Pipeline/Expert Parallel 的工程实现 |
| 通信 | [NCCL 文档](https://docs.nvidia.com/deeplearning/nccl/user-guide/docs/overview.html) | collective、拓扑、通信错误和性能 |
| 批任务调度 | [Kueue](https://kueue.sigs.k8s.io/) / [Volcano](https://volcano.sh/en/docs/) | 了解 Kubernetes 上的队列、配额和批任务调度 |

没有多 GPU 环境时，只做单机小实验和通信模型分析，不要把模拟数据写成真实集群性能。

### H. AI 平台、观测与统一基准：平台分支资料

| 主题 | 资料 | 重点 |
| --- | --- | --- |
| 推理服务 | [NVIDIA Triton Inference Server](https://docs.nvidia.com/deeplearning/triton-inference-server/user-guide/docs/) | 模型仓库、动态批处理、实例组和服务指标 |
| Kubernetes 模型服务 | [KServe](https://kserve.github.io/website/latest/) | 模型部署、路由、自动扩缩容和推理图 |
| 指标 | [Prometheus](https://prometheus.io/docs/introduction/overview/) | Counter、Gauge、Histogram、告警和查询 |
| Trace/日志 | [OpenTelemetry](https://opentelemetry.io/docs/) | 跨服务追踪、指标和日志关联 |
| 标准基准 | [MLPerf Inference](https://mlcommons.org/benchmarks/inference/) | 学习固定场景、质量约束和可比较结果的设计 |
| LLM 服务基准 | [vLLM benchmarks](https://github.com/vllm-project/vllm/tree/main/benchmarks) / [GenAI-Perf](https://github.com/triton-inference-server/perf_analyzer/tree/main/genai-perf) | 测 TTFT、TPOT、吞吐和并发，避免只给单次延迟截图 |

## 五、24 周学习路线

默认每周投入 15–20 小时。每周必须有代码、测试数据和复盘；从第 9 周开始浏览真实 JD、修正技能差距，有可复现作品后再逐步投递实习或初级岗位。

### 第 1–12 周：共同基础

| 周次 | 主题 | 学习资料 | 交付物 |
| --- | --- | --- | --- |
| 1–2 | C++17、CMake、Git、GDB、RAII | cppreference、Core Guidelines、CMake Tutorial | 可构建的 C++ 小库和单测 |
| 3–4 | 数据结构、内存、移动语义、缓存局部性 | MIT 6.006、Effective Modern C++、CS:APP | 内存池、ring buffer 和 benchmark |
| 5–6 | 线程、锁、条件变量、线程池和错误处理 | C++ Concurrency in Action、Sanitizers | 线程池、队列、ASan/TSan 检查报告 |
| 7 | Linux、虚拟内存、进程和 perf | OSTEP、Linux perf | 进程/内存小实验和 CPU 热点报告 |
| 8 | TCP、HTTP/RPC 和服务基础 | Beej、gRPC | 简单服务、结构化日志、指标和压测 |
| 9–10 | Python/PyTorch、Transformer 推理最小知识 | Python/PyTorch Tutorials、Hugging Face、Transformer 论文 | CPU 参考实验、shape/dtype 和内存说明 |
| 11–12 | llama.cpp 或 ONNX Runtime | 对应官方文档和源码 | C++ 推理 CLI，固定模型、输入和性能基线 |

### 第 13–20 周：只选一条主线

| 主线 | 第 13–16 周 | 第 17–20 周 | 主要交付 |
| --- | --- | --- | --- |
| 推理 Runtime（首选） | 用现有后端实现请求队列、并发、取消、超时和指标 | 学习动态批处理、Cache/内存子模块，并对照 vLLM/SGLang | 可压测的 Runtime 服务和性能报告 |
| AI 编译器/NPU 后端 | 完成 LLVM Kaleidoscope 或 MLIR Toy，理解 IR/Pass/Lowering | 做一个小 Pass、layout/算子变换或后端实验 | 正确性测试、IR 前后对照和性能说明 |
| AI 平台/Serving | 学习 Docker、gRPC、监控、限流和健康检查 | 学习 Kubernetes 部署、资源限制、滚动更新或批任务调度 | 可观测、可部署的小型模型服务平台 |
| 分布式训练系统 | 学习 PyTorch Distributed、DDP/FSDP 和 collective | 有多 GPU 条件时做通信/显存实验；否则做单机代码与模型分析 | 并行策略、显存和通信实验报告 |

### 第 21–22 周：压力、故障与性能验证

- 修复测试、内存、竞态和异常路径；
- 固定环境、模型、输入、基线和 benchmark 脚本；
- 加入并发、超时、取消、资源耗尽和异常输入测试；
- 使用统一指标报告吞吐、延迟分位数、内存和质量边界；
- 选择一个上游项目提交小修复、测试、文档或最小复现；

### 第 23–24 周：工程化和求职

- 增加 CI、Docker、README、架构图、性能报告和已知限制；
- 根据目标 JD 修改简历和面试准备，不再同时扩展其他主线。

第 13–20 周只选择下面一个主项目；如果时间允许，再做一个不超过一周的小型对照实验，不要同时铺开三套技术栈。

### 项目一：AI Runtime Mini

这是 Runtime 主线项目，目标是展示基础设施能力，而不是展示模型效果。以 llama.cpp、ONNX Runtime 或 OpenVINO 作为真实推理后端，自己实现其外部的服务、调度和观测层，不要求从零实现完整模型算子：

- C++ 封装现有后端的模型加载和推理接口；
- 用线程池和请求队列处理多个请求；
- 实现简单动态批处理或迭代调度；
- 增加取消、超时、错误和资源上限；
- 统计 TTFT、TPOT、吞吐、p50/p95/p99 和峰值内存；
- 选择一个小模块与 llama.cpp、ONNX Runtime 或 vLLM 的设计对照。

分页 KV、内存池或 Cache 管理可以放在这个项目中，但它们只是项目子模块，不需要单独包装成职业方向。没有合适模型或 GPU 时，可以先用 trace-driven 模拟器输入不同长度和到达时间的请求，验证调度、队列和内存策略，再接真实后端。

### 项目二：性能与后端实验

根据硬件条件选一种：

- 有 NVIDIA GPU：CUDA/Triton 实现 RMSNorm、Softmax、transpose 或小型矩阵乘，使用 Nsight 分析；
- 没有 NVIDIA GPU：用 perf 优化 CPU 线程、SIMD、内存映射或 ONNX Execution Provider；
- 有 NPU/边缘设备：完成模型导出、算子覆盖、内存占用和功耗/延迟测试。

要求至少覆盖三组 shape、两种 dtype 或两种线程配置，并记录失败结果。没有稳定加速时，解释原因本身也是有效成果。

### 项目三：AI 平台小系统

如果想投 AI Platform/Serving 岗，可以做一个小型服务平台：

- gRPC/HTTP 请求接口；
- 模型服务进程和任务队列；
- 限流、超时、重试和健康检查；
- Prometheus 指标或结构化日志；
- Docker 部署，之后再尝试 Kubernetes Deployment、Service、资源限制和滚动更新。

它不需要一开始搭建真正的 GPU 集群，重点是把可靠性、观测和资源管理讲清楚。项目一、项目二、项目三代表不同主线，半年内选择一个做深即可，不要求全部完成。

## 六、如何选择岗位方向

### 适合优先投递的岗位关键词

系统和 Runtime：

- AI Infra Engineer；
- ML Systems Engineer；
- Inference Runtime/Engine Engineer；
- Model Serving Engineer；
- Inference Performance Engineer；
- C++/CUDA 推理优化工程师。

编译器和硬件后端：

- AI Compiler Engineer；
- MLIR/TVM/LLVM 后端工程师；
- NPU Compiler/Backend Engineer；
- GPU/NPU Runtime Engineer；
- 算子开发与异构适配工程师。

平台和服务：

- AI Platform Engineer；
- GPU Resource Scheduler；
- 模型服务平台工程师；
- MLOps/Model Deployment Engineer。

边缘方向：

- Edge AI Runtime Engineer；
- C++ 推理引擎工程师；
- ONNX/TensorRT/OpenVINO/NPU 适配工程师。

不要只搜索“KV allocator”，因为它通常不是独立职位名称。

### 面试最低准备线

应该能用自己的项目回答：

- C++ 的对象生命周期、移动语义、内存对齐和异常路径；
- 线程池、队列、锁、数据竞争、取消和超时；
- Linux 虚拟内存、文件描述符、进程/线程和性能分析；
- Transformer 推理中 Prefill、Decode、Cache 和批处理的差异；
- 如何定义吞吐、TTFT、TPOT、p95/p99 和峰值内存；
- 看到服务变慢、内存上涨或请求超时后，如何复现、测量、定位和回归；
- 如果是编译器岗位，还要能解释 IR、Pass、算子融合、layout 和 lowering；
- 如果是平台岗位，还要能解释 RPC、限流、重试、监控和资源隔离。

## 七、未来发展与薪资边界

### 未来发展

AI Infra 的价值不依赖某一个模型名称：模型会变化，硬件会变化，但模型仍然需要被编译、部署、调度、执行、监控和优化。

- **推理 Runtime/系统软件**：直接影响延迟、吞吐、显存和服务成本，持续受到降本增效需求推动；
- **分布式训练系统**：基础模型训练仍依赖通信、并行、容错和集群效率，岗位核心但通常需要多卡实践条件；
- **编译器/NPU 后端**：硬件越来越多，模型到硬件之间需要稳定的编译和适配层，长期稀缺但门槛高；
- **GPU/NPU 性能工程**：算力增长后，带宽、内存和通信瓶颈更突出，技术上限高；
- **AI 平台/Serving**：模型服务会长期需要资源调度、可靠性、扩缩容和成本控制，技能更接近云原生和分布式系统；
- **边缘 Runtime**：受隐私、低时延、功耗和设备成本推动，入口较宽，但岗位质量差异较大。

### 薪资参考

公开招聘页面通常不显示完整薪资，以下只是中国大陆一线/新一线城市、税前固定月薪的粗略范围，不是统计中位数，也不包含不确定的奖金和股权：

| 岗位族 | 初级常见参考 | 备注 |
| --- | --- | --- |
| 普通 MLOps/模型部署 | 12–22k/月 | 更偏平台配置和业务交付 |
| C++ 边缘推理/Runtime | 15–30k/月 | 核心引擎、NPU 和性能岗可能更高 |
| AI Infra/Serving/推理系统 | 20–35k/月 | 初级岗位较少，通常要求 C++、Linux、并发和服务指标 |
| CUDA/GPU/NPU/编译器后端 | 20–40k/月 | 需要硬件、编译器或 Kernel 作品 |

没有相关实习时，应按区间下沿甚至普通 C++ 岗位评估；有高质量开源贡献、可复现性能项目或相关实习，才更有机会接近上沿。公司的城市、学历、业务阶段和是否包含奖金会造成很大差异；CUDA、NPU SDK 和编译器后端还可能形成厂商绑定，应持续保留通用的 C++、系统和性能分析能力。

## 八、学习笔记和代码如何放进仓库

建议把原始记录、可发布文章和代码实验分开：

1. 每天的命令、错误日志和草稿先放 `inbox/`；
2. 经过验证的知识整理到 `source/_posts/`，补充来源、条件、指标和 `review_status`；
3. 实验代码和 benchmark 放在会被 Git 跟踪的项目目录，不要放进当前被忽略的 `app/`；
4. 原始资料处理完成后归档到 `archive/incoming/YYYY-MM-DD/`；
5. 每份实验至少记录环境、版本、模型、输入 shape、基线、指标、结果、失败原因和可复现命令。

推荐笔记模板：

```text
# 目标
# 背景与原理
# 环境与版本
# 最小实现
# 基线与测试条件
# 结果：延迟 / 吞吐 / 内存 / 精度 / 功耗
# 失败与限制
# 可复现命令
# 下一步
```

看完论文或课程不是交付物。能够在干净环境中构建、运行、测量、解释失败，并把结果写下来，才是可以用于面试的学习证据。

## 九、岗位样本与资料边界

本次核对的官方岗位显示，AI Infra 招聘经常把 C/C++、Linux、并发、GPU/NPU、内存、算子、运行时、分布式和性能测试组合在一起，而不是只要求会调用模型 API。代表性页面包括：

- [字节跳动：Backend Inference Framework Engineer Graduate](https://joinbytedance.com/search/7663392067718039813)
- [字节跳动：Backend Inference Runtime Engineer Graduate](https://joinbytedance.com/search/7669789046777940229)
- [字节跳动：Large Language Model Inference System Engineer Graduate](https://joinbytedance.com/search/7667726338627356933)
- [腾讯：微信-AI Infra 工程师-大模型推理方向](https://careers.tencent.com/jobdesc.html?postId=2037411502792798208)
- [腾讯：大模型异构芯片推理适配调优工程师](https://careers.tencent.com/jobdesc.html?postId=2021416952777568256)
- [腾讯：异构加速框架工程师](https://careers.tencent.com/jobdesc.html?postId=1958073231227375616)

岗位页面是动态的，不能据此推导行业总岗位数、录用概率或薪资中位数。完整的岗位、论文和官方资料链接保留在 `source_docs` 指向的研究底稿中。

## 十、最终建议

你的目标可以明确为：

> **不做模型算法研究，先成为懂 C++/Linux/并发/性能的 AI 系统工程师，再根据兴趣进入推理 Runtime、AI 编译器/NPU 后端、分布式训练系统或 AI 平台。**

最合理的顺序是：

1. 用 8 周建立 C++、Linux、操作系统、并发和性能工具基础；
2. 用 4 周掌握推理最小知识，并完成一个可复现的 Runtime/部署基线；
3. 用 8 周在推理 Runtime、编译器/NPU 后端、分布式训练或 AI 平台中只选一条深入；
4. 用 2 周完成压力、故障和性能验证，再用 2 周整理工程、开源贡献和简历；
5. 第 9 周开始浏览真实 JD，完成 Runtime 基线后再逐步投递相关实习或初级岗位。

不需要现在就决定自己是“KV allocator 工程师”。先把系统基础和一个完整的 AI Runtime 项目做出来，岗位方向会比现在清晰得多。
