[经典控制理论](https://blog.csdn.net/weixin_42301220/article/details/127055203)

<!-- 这是一张图片，ocr 内容为： -->
![传递函数](https://cdn.nlark.com/yuque/0/2026/png/45294337/1767345941056-4d500f95-9aa6-4c8e-9257-042ee29d4c19.png)

<!-- 这是一张图片，ocr 内容为： -->
![闭环系统传递函数](https://cdn.nlark.com/yuque/0/2026/png/45294337/1767346234002-54de13f1-9d07-437a-801c-1f4ad08b138d.png)



## 一阶滞后环节
### 1. 数学模型
传递函数：  
$ G(s) = \frac{K}{T s + 1} $

+ $ K $：稳态增益，代表输入稳态时输出的放大倍数。
+ $ T
 $：时间常数，$ T
 $越大，响应越慢。

时域阶跃响应(输入为幅值 $ A $的阶跃信号时):  
$ y(t) = K A \left(1 - e^{-t/T}\right) $  


### 2. SVPWM逆变器举例：一阶滞后的具体表现
我们以**10kHz开关频率的PWM逆变器**为例：

+ 开关周期 $ T_{\text{s}} = 1/f_{\text{s}} = 100\mu\text{s} $
+ 采用SVPWM时，增益 $ K_{\text{PWM}} \approx 1 $



假设指令电压 $ V_{dq}^* $ 从0突变到1，我们来计算输出电压 $ V_{dq} $ 的动态变化：

| 时间 $ t  $ | 输出 $ V_{dq}(t) $ | 说明 |
| --- | --- | --- |
| $ t=0 $ | $ 0 $ | 输入突变，输出初始为0 |
| $ t=T_{\text{s}}=100\mu\text{s} $ | $ 1 \times (1 - e^{-1}) \approx 0.632 $ | 输出上升到稳态值的63.2% |
| $ t=2T_{\text{s}}=200\mu\text{s} $ | $ 1 \times (1 - e^{-2}) \approx 0.865 $ | 输出上升到稳态值的86.5% |
| $ t=3T_{\text{s}}=300\mu\text{s} $ | $ 1 \times (1 - e^{-3}) \approx 0.950 $ | 输出上升到稳态值的95% |


这个过程清晰展示了**一阶滞后的“惯性”**：输入突变时，输出不会跳变，而是按指数曲线缓慢上升，时间常数$ T_s $直接决定了响应速度。

### 3. 一阶滞后环节对电流环的关键影响
在电机控制系统中，电流环是最内环，带宽通常设计在**1kHz~2kHz**，而PWM逆变器的时间常数$ T_{\text{s}}=100\mu\text{s} $看似很小，但在高频段的影响非常显著。



电流环需要快速跟踪指令，而一阶滞后会引入**响应延迟**：

+ 假设电流环带宽为1kHz，当指令突变时，实际电流的响应会被 $ T_{\text{s}} $ 拖慢，导致**转矩脉动**和**动态性能下降**。

### 4. 对稳定性的影响
我们用频率特性来量化影响：  
在电流环带宽 $ f=1\text{kHz}
 $ 处，角频率 $ \omega = 2\pi f \approx 6283\text{rad/s} $

+ 相位滞后：$ \angle G(j\omega) = -\arctan(\omega T_{\text{s}}) \approx -\arctan(6283 \times 100\mu\text{s}) \approx -36^\circ $
+ 幅值衰减：$ |G(j\omega)| = \frac{K_{\text{PWM}}}{\sqrt{(\omega T_{\text{s}})2 + 1}} \approx \frac{1}{\sqrt{0.6282 + 1}} \approx 0.98 $





## DOB 扰动观测器




##  
## 一阶低通滤波器  


连续域标准一阶低通

$ Q(s) = \frac{\hat{d}(s)}{d_{\text{raw}}(s)} = \frac{1}{\tau s + 1} $

+ $ \tau $：滤波时间常数
+ 截止角频率：$ \omega_q = \dfrac{1}{\tau} $，截止频率 $ f_q = \dfrac{1}{2\pi\tau} $  
微分形式：

$ \tau \cdot \frac{d\hat{d}}{dt} + \hat{d} = d_{\text{raw}} $

常用离散化方法



设采样周期 $ T_s $，当前时刻 $ k $，上一时刻 $ k-1 $：  
$ x(k) $：原始输入；$ y(k) $：滤波输出；$ y(k-1) $：上一拍滤波值

### 方法1：前向欧拉（简单，但高频稳定性差，不推荐DOB）
微分近似：

$ \frac{d\hat{d}}{dt}\bigg|_{t=kT_s} \approx \frac{y(k)-y(k-1)}{T_s} $

代入微分方程：

$ \tau \cdot \frac{y(k)-y(k-1)}{T_s} + y(k) = x(k) $

整理迭代式：

$ y(k) = \frac{\tau}{\tau+T_s}y(k-1) + \frac{T_s}{\tau+T_s}x(k) $

定义滤波系数 $ \alpha = \dfrac{T_s}{\tau+T_s} $：

$ \boldsymbol{y(k) = (1-\alpha)\cdot y(k-1) + \alpha \cdot x(k)} $

### 方法2：后向欧拉（伺服/DOB最常用，无条件稳定）
微分用后向差分：

$ \frac{d\hat{d}}{dt}\bigg|_{t=kT_s} \approx \frac{y(k)-y(k-1)}{T_s} $

方程变形：

$ \tau \cdot \frac{y(k)-y(k-1)}{T_s} + y(k) = x(k) $

化简结果**和前向欧拉形式完全一样**：

$ y(k) = (1-\alpha)y(k-1) + \alpha x(k),\quad \alpha=\frac{T_s}{\tau+T_s} $

> 工程直接记住这个迭代公式，就是一阶低通经典代码！
>

### 方法3：双线性变换（Tustin，频域畸变最小，高精度场景）
$ s=\dfrac{2}{T_s}\cdot\dfrac{z-1}{z+1} $ 代入 $ Q(s) $，化简得：

$ y(k) = \frac{2\tau-T_s}{2\tau+T_s}y(k-1) + \frac{T_s}{2\tau+T_s}\big[x(k)+x(k-1)\big] $

优点：频率映射无混叠；缺点：多存一拍输入 $ x(k-1) $，占用内存，普通伺服没必要。

## 三、滤波系数α物理含义（重点）
$ \alpha = \frac{T_s}{\tau+T_s} $

1. $ \tau \gg T_s $（滤波强、带宽低）：$ \alpha \to 0 $  
输出高度依赖历史值，平滑强、响应慢，噪声抑制好；
2. $ \tau \ll T_s $（滤波弱、带宽高）：$ \alpha \to 1 $  
输出几乎等于原始输入，响应快，但噪声完全透传；

### 快速调参示例
采样周期 $ T_s=0.001\ \text{s}=1\ \text{ms} $

+ 设 $ \tau=0.01\ \text{s} $

$ \alpha = \frac{0.001}{0.01+0.001} \approx 0.0909,\quad f_q=\frac{1}{2\pi\tau}\approx15.9\ \text{Hz} $

+ 若 $ \tau=0.002\ \text{s} $

$ \alpha = \frac{0.001}{0.002+0.001}\approx0.333,\quad f_q\approx79.6\ \text{Hz} $

## 四、C语言嵌入式代码（标准一阶低通，适配DOB的Q滤波器）
```c
// 一阶低通结构体
typedef struct
{
    float alpha;    // 滤波系数
    float y_prev;    // 上一时刻输出
} LPF1st_t;

// 初始化
void LPF1st_Init(LPF1st_t *lpf, float Ts, float tau)
{
    lpf->alpha = Ts / (tau + Ts);
    lpf->y_prev = 0.0f;
}

// 单步滤波迭代，输入x(k)，返回y(k)
float LPF1st_Calc(LPF1st_t *lpf, float x)
{
    float y = (1.0f - lpf->alpha) * lpf->y_prev + lpf->alpha * x;
    lpf->y_prev = y;
    return y;
}
```

### DOB场景使用示例
```c
LPF1st_t q_filter;
// 采样1ms，Q滤波器时间常数τ=0.005s
LPF1st_Init(&q_filter, 0.001f, 0.005f);

// 每次中断里更新扰动估计
float d_raw = (w / Pn - u_base); // DOB原始扰动观测值
float d_hat = LPF1st_Calc(&q_filter, d_raw); // 低通滤波后可用扰动
```

## 五、关键工程注意点（DOB专用）
1. **初值处理**  
上电时 `y_prev=0`，若观测值有直流偏置，前几拍输出会漂移；可上电前几拍强制α=1快速收敛。
2. **定点MCU适配（无浮点）**  
把α放大为整数，用移位代替除法：

$ y = ((A\cdot y_{prev}) + (B\cdot x)) >> shift $

3. **饱和保护**  
滤波输出限幅，防止扰动补偿过大导致电流/电压饱和：

```c
d_hat = constrain(d_hat, -MAX_DISTURB, MAX_DISTURB);
```

4. **和DOB匹配准则**  
Q滤波器带宽远小于速度环带宽，一般取速度环带宽的 1/3 ~ 1/5，避免高频噪声放大引发谐振。

## 六、简化记忆
离散一阶低通核心迭代公式：

$ \boldsymbol{y_k = (1-\alpha)y_{k-1} + \alpha x_k},\quad \alpha=\frac{T_s}{\tau+T_s} $

τ越大，α越小，滤波越强、响应越慢；τ越小，α越大，响应越快、噪声越大。























