# 大模型推理加速就业与技术方向研究底稿

## 研究范围

- 访问日期：2026-08-23（Asia/Shanghai）。
- 目标：调查中国大陆及国际公开岗位中与 LLM inference、GPU/算子优化、AI 编译器、异构芯片适配和推理平台相关的岗位族，并梳理技术依赖、日常工作、进入门槛和适合一名有电气/硬件基础且喜欢内存管理的学生的路线。
- 证据优先级：公司官方招聘页面/API > 项目官方文档/论文；搜索结果和岗位聚合站不作为核心证据。
- 限制：岗位页面是动态的，岗位数量、城市、经验和状态会变化；本底稿不是统计意义上的市场规模或薪资调查。

## 官方岗位样本

### 字节跳动

官方入口：https://joinbytedance.com/search
官方公开搜索 API：https://jobs.bytedance.com/api/v1/public/supplier/search/job/posts

在公开 API 中核对到的样本（访问日 2026-08-23）：

1. `Backend Inference Framework Engineer Graduate (AML Inference) - 2027 Start`，ID `7663392067718039813`，新加坡；Bachelor/Master。要求 Linux、C/C++、数据结构算法、多线程同步/线程池、高并发分布式服务、延迟和资源优化；GPU 资源管理为加分项。详情：https://joinbytedance.com/search/7663392067718039813
2. `Backend Inference Runtime Engineer Graduate (AML Inference) - 2027 Start`，ID `7669789046777940229`，圣何塞；Bachelor/Master。要求 C/C++、Python、CUDA、GPU 架构、GPU 内存模型/调度/通信，以及矩阵、归一化、激活等算子实现和内存访问优化。详情：https://joinbytedance.com/search/7669789046777940229
3. `Large Language Model Inference System Engineer Graduate (Applied Machine Learning) - 2027 Start`，ID `7667726338627356933`，圣何塞；Bachelor/Master。要求数据结构、操作系统、计算机体系结构、C++/Python、CUDA/GPU 性能分析、分布式推理；偏好 PD 分离和 KV Cache 等经验。详情：https://joinbytedance.com/search/7667726338627356933
4. `Machine Learning Engineer - AI Compiler Optimization`，ID `7642171416270260485`，圣何塞。要求 Triton、MLIR 或 TVM 的编译优化/Pass，GPU/NPU 编译、循环/内存/算子优化和性能瓶颈分析。详情：https://joinbytedance.com/search/7642171416270260485
5. `Research Engineer - LLM/VLM Inference Optimization (Seed Infra)`，ID `7626484869123836165`，圣何塞；Bachelor 及以上。要求 C/C++、Python、算法/系统编程、PyTorch/TensorFlow、生产规模推理优化、GPU 架构、FlashAttention/GEMM 等算子；研究和生产经验门槛较高。详情：https://joinbytedance.com/search/7626484869123836165

这些样本说明岗位确实存在，但本轮直接核到的推理框架/运行时样本多数在海外，不能据此承诺中国大陆岗位数量或地点。中国大陆岗位开放状态需另行复核。

### 腾讯

官方入口：https://careers.tencent.com/search.html
官方详情页格式：https://careers.tencent.com/jobdesc.html?postId=<postId>

通过腾讯官方招聘 API（`/tencentcareer/api/post/Query` 与 `/ByPostId`）核对到的大陆样本（访问日 2026-08-23）：

1. `微信-AI Infra 工程师-大模型推理方向`，ID `2037411502792798208`，API 地点北京，经验不限，更新 2026-07-31。要求 C/C++/Python、体系结构与性能调优、CUDA/OpenCL、cuBLAS/cuDNN/CUTLASS、TensorRT/TensorRT-LLM/vLLM/SGLang、异构瓶颈和分布式推理。详情：https://careers.tencent.com/jobdesc.html?postId=2037411502792798208
2. `大模型异构芯片推理适配调优工程师`，ID `2021416952777568256`，岗位城市列深圳/北京/上海/杭州，API 地点北京，经验一年以上，更新 2026-08-14。要求 C/C++/Python、多种 GPU/NPU（CUDA/Triton/TileLang/AscendC/BangC）、vLLM/SGLang、DeepSeek/Qwen、NCCL/NVLink/RoCE、PD 分离及算子精度/性能调优。详情：https://careers.tencent.com/jobdesc.html?postId=2021416952777568256
3. `大模型推理引擎研发工程师`，ID `2074414767455518720`，岗位城市列深圳/北京/上海/杭州，API 地点北京，经验一年以上，更新 2026-07-07。要求 C/C++/Python、CUDA/OpenCL/Ascend C、CUTLASS、vLLM/SGLang/TensorRT-LLM/FasterTransformer、并行和 NVLink。详情：https://careers.tencent.com/jobdesc.html?postId=2074414767455518720
4. `异构加速框架工程师`，ID `1958073231227375616`，岗位城市列深圳/北京/上海，API 地点深圳，经验一年以上，更新 2026-08-05。要求 CUDA/Triton/Ascend C、cuBLAS/CUTLASS/CK、Torch-Compile、KV Cache、动态 batching、Attention、内存和通信优化。详情：https://careers.tencent.com/jobdesc.html?postId=1958073231227375616
5. `微信-WeLM 推理优化工程师`，ID `2020723060671414272`，岗位城市列深圳/上海，API 地点北京，经验两年以上，更新 2026-08-14；本科及以上。要求 C++/Python、PyTorch/JAX、CUDA/Nsight、Transformer/Attention/KV Cache、量化、稀疏、投机解码和分布式。详情：https://careers.tencent.com/jobdesc.html?postId=2020723060671414272

腾讯样本更直接地证明中国大陆存在推理加速岗位，但 API 地点字段与职位标题城市列表可能不完全一致，投递前必须打开详情页确认。

## 官方技术资料

- Transformer 原论文：https://arxiv.org/abs/1706.03762
- FlashAttention：https://arxiv.org/abs/2205.14135；FlashAttention-2：https://arxiv.org/abs/2307.08691
- PagedAttention/vLLM 论文：https://arxiv.org/abs/2309.06180
- Orca continuous batching：https://www.usenix.org/conference/osdi22/presentation/yu
- vLLM：https://docs.vllm.ai/en/latest/
- SGLang：https://docs.sglang.ai/
- TensorRT-LLM：https://nvidia.github.io/TensorRT-LLM/
- llama.cpp：https://github.com/ggml-org/llama.cpp
- CUDA C++ Programming Guide：https://docs.nvidia.com/cuda/cuda-c-programming-guide/
- Triton：https://triton-lang.org/main/
- CUTLASS：https://docs.nvidia.com/cutlass/latest/
- MLIR：https://mlir.llvm.org/；Apache TVM：https://tvm.apache.org/docs/；OpenXLA：https://openxla.org/xla
- NCCL：https://docs.nvidia.com/deeplearning/nccl/user-guide/docs/overview.html
- ONNX Runtime：https://onnxruntime.ai/docs/；OpenVINO：https://docs.openvino.ai/；ExecuTorch：https://pytorch.org/executorch/
- Nsight Systems：https://developer.nvidia.com/nsight-systems；Nsight Compute：https://developer.nvidia.com/nsight-compute
- GPTQ：https://arxiv.org/abs/2210.17323；AWQ：https://arxiv.org/abs/2306.00978；SmoothQuant：https://arxiv.org/abs/2211.10438
- Speculative decoding：https://arxiv.org/abs/2211.17192；Medusa：https://arxiv.org/abs/2401.10774

## 初步结论

岗位不是单一的“大模型工程师”，而是运行时/服务、GPU 算子、量化、编译器/NPU、分布式推理、边缘部署和硬件协同等族群。对硬件基础和内存兴趣最匹配的是 serving runtime + KV cache allocator，其次是 CUDA/Triton kernel 和 C++ 边缘推理；AI 编译器研究、纯量化算法和 GPU 架构研究通常门槛更高。
