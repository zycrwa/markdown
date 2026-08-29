---
title: "STM32 与 CLion 开发实践"
date: 2026-08-01 22:04:00
updated: 2026-08-22 19:14:00
description: "覆盖 STM32 的 CLion/CMake 配置与外设代码；通信协议原理和 FOC 理论由关联文章维护。"
permalink: embedded/stm32-clion-development/
categories:
  - 嵌入式开发
tags:
  - STM32
  - CLion
  - CMake
  - HAL
aliases:
  - STM32 CLion
  - STM32 CMake
  - STM32 HAL 外设
related_posts:
  - embedded-system-basics
  - embedded-communication-protocols
  - dengfoc-control-code
  - motor-embedded-software-roadmap
review_status: unverified
toc: true
---

本文记录 STM32 工程迁移到 CLion/CMake 后的常用配置与外设实验，包括 GPIO、外部中断、I2C、SPI、UART，以及用于验证 SVPWM 的基础代码。

<!-- more -->

## CMakeLists.txt 配置

下面的配置给出了 STM32 CMake 工程的基本骨架。源文件、头文件目录和宏定义应根据实际工程补充。

```cmake
cmake_minimum_required(VERSION 3.22)

set(CMAKE_C_STANDARD 11)
set(CMAKE_C_STANDARD_REQUIRED ON)
set(CMAKE_C_EXTENSIONS ON)

if(NOT CMAKE_BUILD_TYPE)
    set(CMAKE_BUILD_TYPE "Debug")
endif()

set(CMAKE_PROJECT_NAME 7_I2C_MPU6050)
set(CMAKE_EXPORT_COMPILE_COMMANDS TRUE)

project(${CMAKE_PROJECT_NAME})
message("Build type: ${CMAKE_BUILD_TYPE}")
enable_language(C ASM)

add_executable(${CMAKE_PROJECT_NAME}
    Lib/SOFT_I2C/SOFT_I2C.h
    Lib/SOFT_I2C/SOFT_I2C.c
)

target_link_directories(${CMAKE_PROJECT_NAME} PRIVATE)
target_include_directories(${CMAKE_PROJECT_NAME} PRIVATE)
target_compile_definitions(${CMAKE_PROJECT_NAME} PRIVATE)
```

其中，`CMAKE_EXPORT_COMPILE_COMMANDS` 会生成 `compile_commands.json`，供 CLion、clangd 等工具读取编译参数；`enable_language(C ASM)` 则同时启用 C 与汇编语言支持。

## CLion 配置
### 1. 文件注释

```c
/**
 * @file      i2c_sim.c
 * @brief     软件模拟 I2C 通信协议的实现文件
 * @author    Your Name
 * @version   V1.0.0
 * @date      2026-04-16
 * @note      仅适用于标准 I2C 从机设备，暂不支持时钟拉伸
 * @attention 使用前需正确配置 SDA/SCL 引脚的 GPIO 模式
 */
```

常用 Doxygen 字段包括：`file` 表示文件名，`brief` 表示简介，`author`、`version` 和 `date` 记录版本信息，`note` 用于补充说明，`attention` 用于标出注意事项。

### 2. 函数注释

```c
/**
 * @brief  模拟 I2C 发送一个字节
 * @param  data 要发送的 8 位数据
 * @retval 应答状态：0 表示 ACK，1 表示 NACK
 * @note   需在起始信号后调用
 */
uint8_t I2C_WriteByte(uint8_t data)
{
    // 在这里实现发送逻辑
}
```

`param` 描述输入参数，`retval` 描述返回值及其含义。

## GPIO 输出：点亮 LED

![stm32-clion-development 插图 1](/images/posts/stm32-clion-development/001-eb1e2314ac.png)

![stm32-clion-development 插图 2](/images/posts/stm32-clion-development/002-0afcca555d.png)

### 1、 GPIO output level
初始高 / 低电平

###  2、GPIO mode
Output Push Pull——推挽输出

引脚可以主动输出高电平和低电平

Output Open Drain——开漏输出
       引脚只能低电平，无法输出高电平，需要外接上拉电阻才能实现高电平

Input  /  Analog
	输入模式读取电平，无法输出；模拟模式用于ADC等模拟信号采集

### 3. GPIO Pull-up  /  Pull-down
 控制引脚内部集成的上拉/下拉电阻，用来给引脚提供默认电平，避免浮空状态下的电平不稳定

### 4. Maximum output speed
Low
	最大翻转速度约2MHz，是LED、按键等低速外设的最优选择。

Medium
	最大约10MHz，适合UART、SPI等中等速度的通信外设。

High
	最大约50MHz，适合USB、高速SPI等高速接口。

Very High
	最大100MHz+，用于超高速外设。

### 5. User Label
引脚别名，生成宏定义

```c
#define LED_Pin GPIO_PIN_12
#define LED_GPIO_Port GPIOA
```

```c
// 灯亮（PA12输出低）
HAL_GPIO_WritePin(LED_GPIO_Port, LED_Pin, GPIO_PIN_RESET);
// 灯灭（PA12输出高）
HAL_GPIO_WritePin(LED_GPIO_Port, LED_Pin, GPIO_PIN_SET);
```

## GPIO 输入：按键控制
```c
// KEY 编码器按键
if (!HAL_GPIO_ReadPin(KEY_GPIO_Port,KEY_Pin)) {
    // 如果检测到低电平，先延时等待50ms
    HAL_Delay(50);
    // 再判断KEY3是否还处于低电平
    if (!HAL_GPIO_ReadPin(KEY_GPIO_Port,KEY_Pin)) {
        // 确认不是抖动，蓝灯亮灭翻转
        HAL_GPIO_TogglePin(LED_GPIO_Port,LED_Pin );
        // 等待KEY3松开，才能开始下一次检测
        while (!HAL_GPIO_ReadPin(KEY_GPIO_Port,KEY_Pin))
        {
        }
    }
}
```

## GPIO 外部中断
```c
void EXTI0_IRQHandler(void)
{
  HAL_GPIO_EXTI_IRQHandler(KEY_Pin);
}

void HAL_GPIO_EXTI_IRQHandler(uint16_t GPIO_Pin)
{
  if(__HAL_GPIO_EXTI_GET_IT(GPIO_Pin) != RESET)
  {
    __HAL_GPIO_EXTI_CLEAR_IT(GPIO_Pin);  \\清空中断标志
    HAL_GPIO_EXTI_Callback(GPIO_Pin);    \\中断回调
  }
}

void HAL_GPIO_EXTI_Callback(uint16_t GPIO_Pin)
{
  if(HAL_GPIO_ReadPin(KEY_GPIO_Port, KEY_Pin) == 0){          //确认KEY按下
    HAL_GPIO_TogglePin(LED_GPIO_Port, LED_Pin);
    while(HAL_GPIO_ReadPin(KEY_GPIO_Port, KEY_Pin) == 0);
  }
}
```

```c
void HAL_GPIO_EXTI_Callback(uint16_t GPIO_Pin)
{
  // 确认一下是否为KEY按下
  if(HAL_GPIO_ReadPin(KEY_GPIO_Port, KEY_Pin) == 0){
    // 翻转灯
    HAL_GPIO_TogglePin(LED_GPIO_Port, LED_Pin);
    // 等待KE1松开
    while(HAL_GPIO_ReadPin(KEY_GPIO_Port, KEY_Pin) == 0);
  }
}
```

```c
void MX_GPIO_Init(void)
{
    GPIO_InitTypeDef GPIO_InitStruct = {0};
    /*Configure GPIO pin : KEY_Pin */
    GPIO_InitStruct.Pin = KEY_Pin;
    GPIO_InitStruct.Mode = GPIO_MODE_IT_FALLING;
    GPIO_InitStruct.Pull = GPIO_NOPULL;
    HAL_GPIO_Init(KEY_GPIO_Port, &GPIO_InitStruct);

    /* EXTI interrupt init*/
    HAL_NVIC_SetPriority(EXTI0_IRQn, 2, 0);
    HAL_NVIC_EnableIRQ(EXTI0_IRQn);
}
```

## 硬件 I2C：驱动 OLED
```c
// 主机发送数据（阻塞式，最常用）
HAL_StatusTypeDef HAL_I2C_Master_Transmit(
    I2C_HandleTypeDef *hi2c,   // I2C句柄
    uint16_t DevAddress,      // 从机地址(7位/10位)
    uint8_t *pData,           // 发送数据
    uint16_t Size,            // 数据长度
    uint32_t Timeout          // 超时
);

// 主机接收数据（阻塞式，最常用）
HAL_StatusTypeDef HAL_I2C_Master_Receive(
    I2C_HandleTypeDef *hi2c,
    uint16_t DevAddress,
    uint8_t *pData,
    uint16_t Size,
    uint32_t Timeout
);

// 写寄存器
HAL_I2C_Mem_Write(
    I2C_HandleTypeDef *hi2c,
    uint16_t DevAddress,
    uint16_t MemAddress,      // 寄存器地址
    uint16_t MemAddSize,      // 寄存器地址长度 8/16bit
    uint8_t *pData,
    uint16_t Size,
    uint32_t Timeout
);

// 读寄存器
HAL_I2C_Mem_Read(
    I2C_HandleTypeDef *hi2c,
    uint16_t DevAddress,
    uint16_t MemAddress,
    uint16_t MemAddSize,
    uint8_t *pData,
    uint16_t Size,
    uint32_t Timeout
);

//中断方式
HAL_I2C_Master_Transmit_IT();
HAL_I2C_Master_Receive_IT();
HAL_I2C_Mem_Write_IT();
HAL_I2C_Mem_Read_IT();

//DMA方式
HAL_I2C_Master_Transmit_DMA();
HAL_I2C_Master_Receive_DMA();
HAL_I2C_Mem_Write_DMA();
HAL_I2C_Mem_Read_DMA();

//中断回调函数
// 发送完成
void HAL_I2C_MasterTxCpltCallback(I2C_HandleTypeDef *hi2c);
// 接收完成
void HAL_I2C_MasterRxCpltCallback(I2C_HandleTypeDef *hi2c);
// 错误回调
void HAL_I2C_ErrorCallback(I2C_HandleTypeDef *hi2c);
```

## 软件 SPI：驱动 OLED
时钟极性 CPOL：时钟信号空闲时是高电平还是低电平

+ CPOL=0,SCLK 空闲低电平
+ CPOL=1,SCLK 空闲高电平

时钟相位 CPHA：时钟相位，决定数据采样时机

+ CPHA=0,数据第一个时钟沿采样
+ CPHA=1,数据在第二个时钟采样

例如：

+ CPOL=0,CPHA=0,SCLK 空闲时低电平，数据在第一个时钟沿采样-上升沿
+ CPOL=1,CPHA=0,SCLK 空闲时高电平，数据在第一个时钟沿采样-下降沿
+ CPOL=0,CPHA=1,SCLK 空闲时低电平，数据在第二个时钟沿采样-下降沿
+ CPOL=1,CPHA=1.SCLK 空闲时高电平，数据在第二个时钟沿采样-上升沿

可参考代码：

```c
/***
 *Function: 发送1byte数据/命令
 *Input:    dat-> 写入的数据/命令      cmd-> 0表示命令 1表示数据
 *Output:   None
***/
void OLED_WR_Byte(uint8_t dat, uint8_t cmd)
{
    uint8_t i=0;

    if (cmd)
        OLED_RS_Set();        //RS高电平数据模式
    else
        OLED_RS_Clr();        //RS低电平命令模式

    for (i = 0; i < 8; i++)   //SPI协议发送1byte数据
    {
        OLED_SCLK_Clr();      //时钟拉低(准备发数据)
        if (dat&0x80)
            OLED_SDIN_Set();
        else
            OLED_SDIN_Clr();

        OLED_SCLK_Set();
        dat<<=1;               //左移
    }
    OLED_RS_Set();             //RS恢复高电平
}
```

## UART 与 VOFA+
Vofa 串口协议规则：

FireWater

数值 1，数值 2，数值 3，...，数值 N \r\n

分隔符：英文逗号，

帧结束标记：回车换行 \r\n(0x0D,0x0A)

数值支持:float，int 整数

示例：1.25,3.68,-0.52,24.7\r\n

```cpp
// 发送3路浮点
float a=1.1f,b=2.2f,c=3.3f;
char buf[64];
sprintf(buf,"%.2f,%.2f,%.2f\r\n",a,b,c);
HAL_UART_Transmit(&huart1,(uint8_t*)buf,strlen(buf),10);
```

优点：简单、可读、调试简单

缺点：传输数据量大、CPU 开销大

JustFloat

[float0(4B)] [float1(4B)] ... [floatN(4B)] + 固定4字节帧尾 0x00 0x00 0x80 0x7F

1、数据区：N 个 IEEE754 单精度 float,每个占 4 字节，小端字节序

2、帧尾：对应浮点+inf，VOFA

```cpp
// 联合体自动映射float内存字节
typedef union {
    float f;
    uint8_t b[4];
} FloatByte;

void Vofa_Send_JustFloat(float ch1,float ch2,float ch3)
{
    FloatByte fb1,fb2,fb3;
    fb1.f=ch1; fb2.f=ch2; fb3.f=ch3;
    // 帧尾固定
    uint8_t tail[4]={0x00,0x00,0x80,0x7F};
    // 拼接缓冲区
    uint8_t tx_buf[16];
    memcpy(tx_buf,fb1.b,4);
    memcpy(tx_buf+4,fb2.b,4);
    memcpy(tx_buf+8,fb3.b,4);
    memcpy(tx_buf+12,tail,4);
    // 串口发送16字节
    HAL_UART_Transmit(&huart1,tx_buf,16,10);
}
```

## SVPWM 算法验证
