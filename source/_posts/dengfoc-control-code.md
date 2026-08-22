---
title: "DengFOC 常用控制代码与三环结构"
date: 2026-08-01 22:17:00
updated: 2026-08-22 19:14:00
description: "覆盖 DengFOC 坐标变换与三环代码实现；PMSM 理论模型和 PI 参数推导由关联文章维护。"
permalink: motor-control/dengfoc-control-code/
categories:
  - 电机控制
tags:
  - DengFOC
  - FOC
  - 位置环
  - 速度环
  - 电流环
aliases:
  - DengFOC
  - FOC 三环控制
  - 位置速度电流三环
related_posts:
  - three-phase-pmsm
  - pmsm-speed-loop-pi-tuning
  - stm32-clion-development
  - pmsm-parameter-measurement
  - motor-embedded-software-roadmap
source_docs:
  - "archive/original-posts/dengfoc学习笔记-常用foc代码.md"
review_status: unverified
toc: true
---

本文以 DengFOC 示例代码为线索，整理坐标变换、开环位置测试、闭环位置与速度控制，以及位置—速度—电流三环结构，并保留对采样频率和环路带宽的工程观察。

<!-- more -->

[http://dengfoc.com](http://dengfoc.com/#/)

![dengfoc-control-code 插图 1](/images/posts/dengfoc-control-code/001-c7d8c099d2.png)

## 设计观察

DengFOC 选用 SPWM。

问题：整体设计思路简单，但是电流环和速度环频率一致，这是问题所在。

   采样的频率感觉有点问题，最好能设置成固定频率采样

代码设计思路：

循环读取编码器和电流值

设计位置、速度和电流三环 PID

位置环误差的输出作为速度环给定

速度环误差的输出作为电流环给定，各环输出均需限幅

转速环的限幅是最大电流，电流环最大

## 1、坐标变换
[https://zhuanlan.zhihu.com/p/172484981](https://zhuanlan.zhihu.com/p/172484981)

![dengfoc-control-code 插图 2](/images/posts/dengfoc-control-code/002-e76c62445c.png)

![dengfoc-control-code 插图 3](/images/posts/dengfoc-control-code/003-d3118cd46d.png)

## 2、开环位置环测试
```c
//灯哥开源，转载请著名出处
//仅在DengFOC上测试过
//PWM输出引脚定义
int pwmA = 32;//此处仅供arduino使用
int pwmB = 33;
int pwmC = 25;

//初始变量及函数定义
#define _constrain(amt,low,high) ((amt)<(low)?(low):((amt)>(high)?(high):(amt)))
//宏定义实现的一个约束函数,用于限制一个值的范围。
//具体来说，该宏定义的名称为 _constrain，接受三个参数 amt、low 和 high，分别表示要限制的值、最小值和最大值。该宏定义的实现使用了三元运算符，根据 amt 是否小于 low 或大于 high，返回其中的最大或最小值，或者返回原值。
//换句话说，如果 amt 小于 low，则返回 low；如果 amt 大于 high，则返回 high；否则返回 amt。这样，_constrain(amt, low, high) 就会将 amt 约束在 [low, high] 的范围内。
float voltage_power_supply=12.6; //母线电压，这里也可以理解成输入电压
float shaft_angle=0,open_loop_timestamp=0;//电机机械角度，开环时间戳(用于计算开环机械角度的时间)
float zero_electric_angle=0,Ualpha,Ubeta=0,Ua=0,Ub=0,Uc=0,dc_a=0,dc_b=0,dc_c=0;
//零电角(0度,暂未使用,通常作用：编码器的零点和机械零点对齐)     Ualpha,Ubeta,Ua,Ub,Uc,  dc_a,dc_b,dc_c(占空比0-1)

void setup() {
  // put your setup code here, to run once:
  Serial.begin(115200);
  //PWM设置
  pinMode(pwmA, OUTPUT);
  pinMode(pwmB, OUTPUT);
  pinMode(pwmC, OUTPUT);
  ledcSetup(0, 30000, 8);  //pwm频道, 频率, 精度
  ledcSetup(1, 30000, 8);  //pwm频道, 频率, 精度
  ledcSetup(2, 30000, 8);  //pwm频道, 频率, 精度
  ledcAttachPin(pwmA, 0);
  ledcAttachPin(pwmB, 1);
  ledcAttachPin(pwmC, 2);
  Serial.println("完成PWM初始化设置");
  delay(3000);

}

// 电角度求解
float _electricalAngle(float shaft_angle, int pole_pairs) {
  return (shaft_angle * pole_pairs);
}

// 归一化角度到 [0,2PI]
float _normalizeAngle(float angle){
  float a = fmod(angle, 2*PI);   //取余运算可以用于归一化，列出特殊值例子算便知
  return a >= 0 ? a : (a + 2*PI);
  //三目运算符。格式：condition ? expr1 : expr2
  //其中，condition 是要求值的条件表达式，如果条件成立，则返回 expr1 的值，否则返回 expr2 的值。可以将三目运算符视为 if-else 语句的简化形式。
  //fmod 函数的余数的符号与除数相同。因此，当 angle 的值为负数时，余数的符号将与 _2PI 的符号相反。也就是说，如果 angle 的值小于 0 且 _2PI 的值为正数，则 fmod(angle, _2PI) 的余数将为负数。
  //例如，当 angle 的值为 -PI/2，_2PI 的值为 2PI 时，fmod(angle, _2PI) 将返回一个负数。在这种情况下，可以通过将负数的余数加上 _2PI 来将角度归一化到 [0, 2PI] 的范围内，以确保角度的值始终为正数。
}

// 设置PWM到控制器输出
void setPwm(float Ua, float Ub, float Uc) {

  // 计算占空比
  // 限制占空比从0到1
  dc_a = _constrain(Ua / voltage_power_supply, 0.0f , 1.0f );
  dc_b = _constrain(Ub / voltage_power_supply, 0.0f , 1.0f );
  dc_c = _constrain(Uc / voltage_power_supply, 0.0f , 1.0f );

  //写入PWM到PWM 0 1 2 通道
  ledcWrite(0, dc_a*255);
  ledcWrite(1, dc_b*255);
  ledcWrite(2, dc_c*255); //此处是8倍分辨率所以要乘255
}

void setPhaseVoltage(float Uq,float Ud, float angle_el) {
  angle_el = _normalizeAngle(angle_el + zero_electric_angle);
  // 帕克逆变换
  Ualpha =  -Uq*sin(angle_el);
  Ubeta =   Uq*cos(angle_el);

  // 克拉克逆变换
  Ua = Ualpha + voltage_power_supply/2; //这里需要加上电压偏置的一半，当做虚拟电压，实际情况ua,ub,uc没办法是负电压，ua,ub,uc的零电压相当于母线电压的一半
  Ub = (sqrt(3)*Ubeta-Ualpha)/2 + voltage_power_supply/2;
  Uc = (-Ualpha-sqrt(3)*Ubeta)/2 + voltage_power_supply/2;
  setPwm(Ua,Ub,Uc);
}

//开环速度函数，输入单位为rad/s
float velocityOpenloop(float target_velocity){
  unsigned long now_us = micros();
  //获取从开启芯片以来的微秒数，它的精度是 4 微秒。 micros() 返回的是一个无符号长整型（unsigned long）的值

  //计算当前每个Loop的运行时间间隔，这里单位是us转换成s
  float Ts = (now_us - open_loop_timestamp) * 1e-6f;

  //由于 micros() 函数返回的时间戳会在大约 70 分钟之后重新开始计数，在由70分钟跳变到0时，TS会出现异常
  //因此需要进行修正。如果时间间隔小于等于零或大于 0.5 秒，则将其设置为一个较小的默认值，即 1e-3f
  //可以理解成异常处理，暂不考虑
  if(Ts <= 0 || Ts > 0.5f) Ts = 1e-3f;

  // 通过乘以时间间隔和目标速度来计算需要转动的机械角度，存储在 shaft_angle 变量中。
  // 还需要对轴角度进行归一化，以确保机械角速度的值在 0 到 2π 之间。
  shaft_angle = _normalizeAngle(shaft_angle + target_velocity*Ts);

  // 使用早前设置的voltage_power_supply的1/3作为Uq值，这个值会直接影响输出力矩
  // 最大只能设置为Uq = voltage_power_supply/2，否则ua,ub,uc会超出供电电压限幅

  float Uq = voltage_power_supply/2;

  setPhaseVoltage(Uq,  0, _electricalAngle(shaft_angle, 7));

  open_loop_timestamp = now_us;  //用于计算下一个时间间隔

  return Uq;
}

void loop() {
  // put your main code here, to run repeatedly:
   velocityOpenloop(5);
}

```

设计思路

开环速度控制->给定预期速度，单位 rad/s

预期速度->积分计算预期机械角度->预期电角度

电角度 and 给定 q 轴电压->计算 ua,ub,uc->对比母线电压给出占空比

## 3、闭环位置环
```c
#include "AS5600.h"

int pwmA = 32;
int pwmB = 33;
int pwmC = 25;

//初始变量及函数定义
#define _constrain(amt,low,high) ((amt)<(low)?(low):((amt)>(high)?(high):(amt)))
//宏定义实现的一个约束函数,用于限制一个值的范围。
//具体来说，该宏定义的名称为 _constrain，接受三个参数 amt、low 和 high，分别表示要限制的值、最小值和最大值。该宏定义的实现使用了三元运算符，根据 amt 是否小于 low 或大于 high，返回其中的最大或最小值，或者返回原值。
//换句话说，如果 amt 小于 low，则返回 low；如果 amt 大于 high，则返回 high；否则返回 amt。这样，_constrain(amt, low, high) 就会将 amt 约束在 [low, high] 的范围内。
float voltage_limit=12.6;
float voltage_power_supply=12.6;
float shaft_angle=0,open_loop_timestamp=0;
float zero_electric_angle=0,Ualpha,Ubeta=0,Ua=0,Ub=0,Uc=0,dc_a=0,dc_b=0,dc_c=0;

#define _3PI_2 4.71238898038f

int PP=7,DIR=-1;
//dir代表的是方向，如果编码的方向和开环方向不一致则为-1

/**
 * @brief 计算电角度
 *
 * @return float 电角度
 * @note 电角度 = 机械角度 * 极对数 - 零电角度
 */
float _electricalAngle(){
  return  _normalizeAngle((float)(DIR *  PP) * getAngle_Without_track()-zero_electric_angle);
}

// 归一化角度到 [0,2PI]
float _normalizeAngle(float angle){
  float a = fmod(angle, 2*PI);   //取余运算可以用于归一化，列出特殊值例子算便知
  return a >= 0 ? a : (a + 2*PI);  }

// 设置PWM到控制器输出
void setPwm(float Ua, float Ub, float Uc) {

  // 限制上限
  Ua = _constrain(Ua, 0.0f, voltage_limit);
  Ub = _constrain(Ub, 0.0f, voltage_limit);
  Uc = _constrain(Uc, 0.0f, voltage_limit);
  // 计算占空比
  // 限制占空比从0到1
  dc_a = _constrain(Ua / voltage_power_supply, 0.0f , 1.0f );
  dc_b = _constrain(Ub / voltage_power_supply, 0.0f , 1.0f );
  dc_c = _constrain(Uc / voltage_power_supply, 0.0f , 1.0f );

  //写入PWM到PWM 0 1 2 通道
  ledcWrite(0, dc_a*255);
  ledcWrite(1, dc_b*255);
  ledcWrite(2, dc_c*255);
}

/**
 * @brief  Clarke逆变换
 *
 * @param Uq
 * @param Ud
 * @param angle_el
 * @note 使用电角度和Uq,Ud计算出Ua,Ub,Uc然后设置PWM输出
 */
void setPhaseVoltage(float Uq,float Ud, float angle_el) {
  angle_el = _normalizeAngle(angle_el);
  // 帕克逆变换
  Ualpha =  -Uq*sin(angle_el);
  Ubeta =   Uq*cos(angle_el);

  // 克拉克逆变换
  Ua = Ualpha + voltage_power_supply/2;
  Ub = (sqrt(3)*Ubeta-Ualpha)/2 + voltage_power_supply/2;
  Uc = (-Ualpha-sqrt(3)*Ubeta)/2 + voltage_power_supply/2;
  setPwm(Ua,Ub,Uc);
}

void setup() {
  // put your setup code here, to run once:
  Serial.begin(115200);
  //PWM设置
  pinMode(pwmA, OUTPUT);
  pinMode(pwmB, OUTPUT);
  pinMode(pwmC, OUTPUT);
  ledcSetup(0, 30000, 8);  //pwm频道, 频率, 精度
  ledcSetup(1, 30000, 8);  //pwm频道, 频率, 精度
  ledcSetup(2, 30000, 8);  //pwm频道, 频率, 精度
  ledcAttachPin(pwmA, 0);
  ledcAttachPin(pwmB, 1);
  ledcAttachPin(pwmC, 2);
  Serial.println("完成PWM初始化设置");
  BeginSensor();  //初始化传感器
  setPhaseVoltage(3, 0,_3PI_2);//这里是让磁场方向和a轴对齐
  delay(3000);
  zero_electric_angle=_electricalAngle();//计算零电角度
  setPhaseVoltage(0, 0,_3PI_2);
  Serial.print("0电角度：");Serial.println(zero_electric_angle);

}

//==============串口接收==============
float motor_target;
int commaPosition;
String serialReceiveUserCommand() {

  // a string to hold incoming data
  static String received_chars;

  String command = "";

  while (Serial.available()) {
    // get the new byte:
    char inChar = (char)Serial.read();
    // add it to the string buffer:
    received_chars += inChar;

    // end of user input
    if (inChar == '\n') {

      // execute the user command
      command = received_chars;

      commaPosition = command.indexOf('\n');//检测字符串中的逗号
      if(commaPosition != -1)//如果有逗号存在就向下执行
      {
          motor_target = command.substring(0,commaPosition).toDouble();            //电机角度
          Serial.println(motor_target);
      }
      // reset the command buffer
      received_chars = "";
    }
  }
  return command;
}

void loop() {
  // put your main code here, to run repeatedly:
  Serial.println(getAngle()); //输出机械角度
  float Sensor_Angle=getAngle();
  float Kp=0.133;
  //输入电角度，计算uq
  setPhaseVoltage(_constrain(Kp*(motor_target-DIR*Sensor_Angle)*180/PI,-6,6),0,_electricalAngle());
  serialReceiveUserCommand();
}
```

![dengfoc-control-code 插图 4](/images/posts/dengfoc-control-code/004-052204eb6f.png)

## 4、闭环速度环
编码器采样 -> 计算采样间隔 ->计算速度和圈数 ->滤波

编码器采样同时计算转子电角度，并使得 d 轴和 转子 s 轴重合，使得获得最大力矩

所谓的闭环只是修改 uq 大小，基于不同大小的 uq 电压来更随速度环

```c
void setup() {
  Serial.begin(115200);
  DFOC_Vbus(12.6);   //设定驱动器供电电压
  DFOC_alignSensor(Motor_PP,Sensor_DIR);  //封装编码器对齐函数，获得编码器零点偏差
}

void loop()
{
  //设置速度环PID
   DFOC_M0_SET_VEL_PID(0.005,0.00,0,0);
  //设置速度
   DFOC_M0_setVelocity(serial_motor_target());
  //接收串口，串口接收速度指令
  serialReceiveUserCommand();
}

void DFOC_M0_setVelocity(float Target)
{
  setTorque(DFOC_M0_VEL_PID((serial_motor_target()-DFOC_M0_Velocity())*180/PI),_electricalAngle());   //速度闭环
}
//输入目标速度减去实际-滤波后速度
//DFOC_M0_Velocity中会读取编码器的角度所以读取编码器的频率和循环频率是一样的

//后面输出的是转子的电角度
void setTorque(float Uq,float angle_el) {
  S0.Sensor_update(); //更新传感器数值
  Uq=_constrain(Uq,-(voltage_power_supply)/2,(voltage_power_supply)/2);
  float Ud=0;
  angle_el = _normalizeAngle(angle_el);
  // 帕克逆变换
  Ualpha =  -Uq*sin(angle_el);
  Ubeta =   Uq*cos(angle_el);

  // 克拉克逆变换
  Ua = Ualpha + voltage_power_supply/2;
  Ub = (sqrt(3)*Ubeta-Ualpha)/2 + voltage_power_supply/2;
  Uc = (-Ualpha-sqrt(3)*Ubeta)/2 + voltage_power_supply/2;
  setPwm(Ua,Ub,Uc);
}

```

## 5、位置-速度-电流闭环

```cpp
// 初始化配置
void setup() {
    Serial.begin(115200);
    DFOC_Vbus(12.6);           // 设置母线电压
    DFOC_alignSensor(Motor_PP, Sensor_DIR);  // 传感器校准，寻找偏差角度
}

void loop() {
    runFOC();  // 核心FOC循环

    // 三闭环控制模式（位置→速度→电流）
    DFOC_M0_SET_ANGLE_PID(1, 0, 0, 100000, 30);    // 角度环参数
    DFOC_M0_SET_VEL_PID(0.02, 1, 0, 100000, 0.5);  // 速度环参数
    DFOC_M0_SET_CURRENT_PID(5, 200, 0, 100000);    // 电流环参数
    DFOC_M0_set_Velocity_Angle(serial_motor_target());  // 位置-速度-电流三闭环

    // 数据输出输，输出电流和角速度
    if(count++ > 30) {
        Serial.printf("%f,%f\n", DFOC_M0_Current(), DFOC_M0_Velocity());
    }
    serialReceiveUserCommand();  // 串口接收目标值
}
```

核心算法：坐标变换和 spwm 输出

```cpp
void setTorque(float Uq, float angle_el) {
  Uq = _constrain(Uq, -(voltage_power_supply)/2, (voltage_power_supply)/2);
  float Ud = 0;
  angle_el = _normalizeAngle(angle_el);

  // Park逆变换（将d-q坐标系转换为α-β坐标系）
  Ualpha = -Uq * sin(angle_el);
  Ubeta = Uq * cos(angle_el);

  // Clark逆变换（将α-β坐标系转换为三相坐标系）
  Ua = Ualpha + voltage_power_supply/2;
  Ub = (sqrt(3)*Ubeta - Ualpha)/2 + voltage_power_supply/2;
  Uc = (-Ualpha - sqrt(3)*Ubeta)/2 + voltage_power_supply/2;
  setPwm(Ua, Ub, Uc);
}
```

```cpp
void DFOC_M0_set_Velocity_Angle(float Target) {
  // 角度环输出作为速度环输入，速度环输出作为电流环输入
  DFOC_M0_setTorque(    //电流环环
    DFOC_M0_VEL_PID(	//速度环
      DFOC_M0_ANGLE_PID((Target - DFOC_M0_Angle()) * 180/PI)  //位置环
      - DFOC_M0_Velocity()
    )
  );
}
```

1. 系统初始化
├── DFOC_Vbus()      → PWM、编码器、电流传感器初始化
└── DFOC_alignSensor() → 传感器零点校准
2. 主循环 runFOC()
├── S0.Sensor_update()      → 更新编码器角度
└── CS_M0.getPhaseCurrents() → 采样三相电流
3. 控制算法执行
├── 角度环：计算角度误差 → PID输出速度指令
├── 速度环：计算速度误差 → PID输出电流指令
├── 电流环：计算电流误差 → PID输出电压指令
└── setTorque() → 坐标变换 → PWM输出
4. 串口通信
└── serialReceiveUserCommand() → 接收上位机指令
