---
title: "Simulink 电机控制仿真常用模块与建议"
date: 2026-08-01 22:16:00
description: "记录 Simulink 电机控制仿真的常用模块、建模建议和无感仿真入口。"
permalink: simulation/simulink-motor-simulation/
categories:
  - 仿真工具
tags:
  - Simulink
  - 电机仿真
  - 无感控制
toc: true
---

本文汇总 Simulink 电机控制仿真中常用的电源、测量、逻辑和信号路由模块，并记录模型拆分、采样时间和三相无感仿真的实践建议。

<!-- more -->

## 1. Simulink 常用仿真模块
![power-黑色库](/images/posts/simulink-motor-simulation/001-aa948152bb.png)

![DC Voltage Source](/images/posts/simulink-motor-simulation/002-8749df8e63.png)

![多相逆变器](/images/posts/simulink-motor-simulation/003-061d55749d.png)

![三相对称无源](/images/posts/simulink-motor-simulation/004-d1467ff08a.png)

![多相电压电流测量](/images/posts/simulink-motor-simulation/005-b50291c32a.png)

![内部模块](/images/posts/simulink-motor-simulation/006-36c8fb62e5.png)

![示波器](/images/posts/simulink-motor-simulation/007-075855ff40.png)

![常数](/images/posts/simulink-motor-simulation/008-4d9b52b175.png)

![三角波载波](/images/posts/simulink-motor-simulation/009-b200e410e6.png)

![非门](/images/posts/simulink-motor-simulation/010-decab63d5a.png)

![MUX DEMUX](/images/posts/simulink-motor-simulation/011-0b65414ceb.png)

![goto from](/images/posts/simulink-motor-simulation/012-a0e540e040.png)

## 2. Simulink 建模建议
![simulink-motor-simulation 插图 13](/images/posts/simulink-motor-simulation/013-402622a460.png)

注释掉内容就不需要允许

## 3. Simulink 三相电机无感仿真
