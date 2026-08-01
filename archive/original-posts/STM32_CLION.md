### 0、「CMakeList.txt」配置
+ cmake_minimum_required(VERSION 3.22)          最低 CMake3.22 版本
+ set(CMAKE_C_STANDARD 11)                              设置 C语言标准 11
+ set(CMAKE_C_STANDARD_REQUIRED ON)          <font style="color:rgb(26, 32, 41);">C标准要求硬性开启</font>
+ <font style="color:rgb(26, 32, 41);">set(CMAKE_C_EXTENSIONS ON)                     开启 C 语言扩展</font>
+ <font style="color:rgb(26, 32, 41);">if(NOT CMAKE_BUILD_TYPE)                            没有定义类型，就把它设为Debug</font>

<font style="color:rgb(26, 32, 41);">             set(CMAKE_BUILD_TYPE "Debug")</font>

<font style="color:rgb(26, 32, 41);">      endif()         </font>

+ <font style="color:rgb(26, 32, 41);">set(CMAKE_PROJECT_NAME 7_I2C_MPU6050)项目名字</font>
+ <font style="color:rgb(26, 32, 41);">set(CMAKE_EXPORT_COMPILE_COMMANDS TRUE) </font>
+ <font style="color:rgb(26, 32, 41);">导出编译命令为真  生成 </font><font style="color:rgb(26, 32, 41);background-color:rgba(175, 184, 193, 0.2);">compile_commands.json </font><font style="color:rgb(26, 32, 41);">文件</font>
+ <font style="color:rgb(26, 32, 41);">project(${CMAKE_PROJECT_NAME})                    初始化 CMake 工程</font>
+ <font style="color:rgb(26, 32, 41);">message("Build type: " ${CMAKE_BUILD_TYPE})  打印</font>
+ <font style="color:rgb(26, 32, 41);">enable_language(C ASM)                                     启用对 ASM（汇编）支持</font>
+ <font style="color:rgb(26, 32, 41);">add_executable(${CMAKE_PROJECT_NAME}</font>

<font style="color:rgb(26, 32, 41);">        Lib/SOFT_I2C/SOFT_I2C.h</font>

<font style="color:rgb(26, 32, 41);">        Lib/SOFT_I2C/SOFT_I2C.c)                                 添加一个可执行文件                        </font>

+ <font style="color:rgb(26, 32, 41);">target_link_directories(${CMAKE_PROJECT_NAME} PRIVATE)     第三方的现成库路径</font>
+ <font style="color:rgb(26, 32, 41);"> target_include_directories(${CMAKE_PROJECT_NAME} PRIVAT)头文件包含路径</font>
+ <font style="color:rgb(26, 32, 41);">target_compile_definitions(${CMAKE_PROJECT_NAME} PRIVA)  宏定义</font>



<font style="color:rgb(26, 32, 41);"></font>

<font style="color:rgb(26, 32, 41);"></font>

 







### 0、「CLION」配置   
####  1、文件注释
:::color1
/**

+ @file    i2c_sim.c
+ @brief   软件模拟I2C通信协议的实现文件
+ @author  Your Name
+ @version V1.0.0
+ @date    2026-04-16
+ @note    仅适用于标准I2C从机设备，未支持时钟拉伸
+ @attention 使用前需正确配置SDA/SCL引脚的GPIO模式  
 */

file -> 文件名

brief -> 文件简介

author -> 作者信息

version -> 版本号

data -> 日期

note -> 补充说明

attention 注意警告

:::



#### 2、函数注释
:::color5
/**

+ @brief  模拟I2C发送一个字节
+ @param  data  要发送的8位数据
+ @retval 应答状态：0=ACK成功，1=NACK失败
+ @note   需在起始信号后调用  
*/  
uint8_t I2C_WriteByte(uint8_t data)  
{

}

param->输入参数

retval->输出返回 

:::



### 1、「GPIO」点灯大师  |  GPIO_OUTPUT


<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.nlark.com/yuque/0/2026/png/45294337/1775400275097-390555d2-b0fa-4490-8e17-2e16d7af1f23.png)



<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.nlark.com/yuque/0/2026/png/45294337/1775400730231-9ff86f51-0b2d-4c00-b413-421eaf8d1d3e.png)

#### 1、 GPIO output level
初始高 / 低电平

####  2、GPIO mode
Output Push Pull——推挽输出

引脚可以主动输出高电平和低电平  

Output Open Drain——开漏输出  
       引脚只能低电平，无法输出高电平，需要外接上拉电阻才能实现高电平<font style="color:#DF2A3F;">  </font>

Input  /  Analog  
	输入模式读取电平，无法输出；模拟模式用于ADC等模拟信号采集

#### 3. GPIO Pull-up  /  Pull-down
 控制引脚内部集成的上拉/下拉电阻，用来给引脚提供默认电平，避免浮空状态下的电平不稳定

#### 4. Maximum output speed
Low  
	最大翻转速度约2MHz，是LED、按键等低速外设的最优选择。

Medium  
	最大约10MHz，适合UART、SPI等中等速度的通信外设。

High  
	最大约50MHz，适合USB、高速SPI等高速接口。

Very High  
	最大100MHz+，用于超高速外设。

#### 5. User Label
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



### 2、「GPIO」按键控制  |  GPIO_INPUT
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











### 3、「GPIO」中断控制  |  GPIO_EXTI
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



### 4、 I2C OLED | 硬件 I2C
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

### 5、 SPI  OLED | 软件 SPI
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
/***********************************************************
 *Function: 发送1byte数据/命令
 *Input:    dat-> 写入的数据/命令      cmd-> 0表示命令 1表示数据
 *Output:   None
***********************************************************/
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















### 6、UART | Vofa
Vofa 串口协议规则：



FireWater

:::color5
数值 1，数值 2，数值 3，...，数值 N \r\n

分隔符：英文逗号，

帧结束标记：回车换行 \r\n(0x0D,0x0A)

数值支持:float，int 整数

示例：<font style="color:rgb(0, 0, 0);">1.25,3.68,-0.52,24.7\r\n</font>

:::



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

:::color5
<font style="color:rgb(0, 0, 0);">[float0(4B)] [float1(4B)] ... [floatN(4B)] + 固定4字节帧尾 0x00 0x00 0x80 0x7F</font>

<font style="color:rgb(0, 0, 0);">1、数据区：N 个 IEEE754 单精度 float,每个占 4 字节，小端字节序</font>

<font style="color:rgb(0, 0, 0);">2、帧尾：对应浮点+inf，VOFA</font>

:::



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











### 7、SVPWM 算法验证




### 
