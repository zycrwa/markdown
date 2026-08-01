'use strict';

const fs = require('node:fs/promises');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const POSTS_DIR = path.join(ROOT, 'source', '_posts');

const MATH_POSTS = new Set([
  'component-selection-parameters.md',
  'dual-three-phase-pmsm.md',
  'embedded-system-basics.md',
  'motor-drive-power-supply.md',
  'pmsm-control-basics.md',
  'pmsm-harmonic-analysis.md',
  'pmsm-parameter-measurement.md',
  'pmsm-speed-loop-pi-tuning.md',
  'semiconductor-basics.md',
  'three-phase-pmsm.md'
]);

const POSTS = [
  {
    source: '基础元器件.md',
    target: 'semiconductor-basics.md',
    title: '半导体基础：PN 结与 MOSFET',
    date: '2026-08-01 22:00:00',
    category: '电子基础',
    tags: ['PN 结', 'MOSFET', '半导体'],
    permalink: 'electronics/semiconductor-basics/',
    description: '梳理 PN 结的形成、单向导电性，以及增强型 MOSFET 的工作区、关键参数和寄生电容。',
    intro: '本文从 PN 结出发，逐步整理增强型 MOSFET 的工作原理、主要工作区、选型参数与寄生电容影响，作为后续功率器件和电机驱动学习的基础。'
  },
  {
    source: '元器件关键参数.md',
    target: 'component-selection-parameters.md',
    title: '常用元器件关键参数与选型检查表',
    date: '2026-08-01 22:01:00',
    category: '电子基础',
    tags: ['元器件选型', 'PPTC', 'MOSFET'],
    permalink: 'electronics/component-selection-parameters/',
    description: '汇总 PPTC 自恢复保险丝和增强型 NMOSFET 的关键参数与工程选型约束。',
    intro: '本文以工程选型为目标，汇总自恢复保险丝和增强型 NMOSFET 的关键参数、额定值边界与常见降额原则。参数最终应以具体器件的数据手册和工作条件为准。'
  },
  {
    source: '嵌入式基础知识.md',
    target: 'embedded-system-basics.md',
    title: '嵌入式基础：GPIO 输出、Keil 工程与自举电荷泵',
    date: '2026-08-01 22:02:00',
    category: '嵌入式开发',
    tags: ['GPIO', 'Keil', '电荷泵'],
    permalink: 'embedded/embedded-system-basics/',
    description: '整理推挽与开漏输出、Keil 工程目录和半桥高侧驱动自举电荷泵。',
    intro: '本文整理三个常见但彼此独立的嵌入式基础主题：GPIO 推挽与开漏输出、Keil 工程目录结构，以及半桥高侧驱动使用的自举电荷泵。'
  },
  {
    source: '嵌入式.md',
    target: 'embedded-communication-protocols.md',
    title: '嵌入式通信协议：UART、I2C、SPI 与 CAN',
    date: '2026-08-01 22:03:00',
    category: '嵌入式开发',
    tags: ['UART', 'I2C', 'SPI', 'CAN'],
    permalink: 'embedded/communication-protocols/',
    description: '对比 UART、I2C、SPI 和 CAN 的信号、帧格式、时序与工程注意事项。',
    intro: '本文按物理连接、数据帧、时序和可靠性机制整理 UART、I2C、SPI 与 CAN，重点保留调试时最常用的判断依据。'
  },
  {
    source: 'STM32_CLION.md',
    target: 'stm32-clion-development.md',
    title: 'STM32 与 CLion 开发实践',
    date: '2026-08-01 22:04:00',
    category: '嵌入式开发',
    tags: ['STM32', 'CLion', 'CMake', 'HAL'],
    permalink: 'embedded/stm32-clion-development/',
    description: '记录 STM32 在 CLion 和 CMake 环境下的 GPIO、I2C、SPI、UART 与 SVPWM 验证代码。',
    intro: '本文记录 STM32 工程迁移到 CLion/CMake 后的常用配置与外设实验，包括 GPIO、外部中断、I2C、SPI、UART，以及用于验证 SVPWM 的基础代码。'
  },
  {
    source: 'AD使用.md',
    target: 'altium-designer-notes.md',
    title: 'Altium Designer 原理图与 PCB 使用笔记',
    date: '2026-08-01 22:05:00',
    category: '开发工具',
    tags: ['Altium Designer', '原理图', 'PCB'],
    permalink: 'tools/altium-designer-notes/',
    description: '整理 Altium Designer 原理图库、原理图和 PCB 编辑中的常用规则与快捷操作。',
    intro: '本文整理 Altium Designer 中原理图库、原理图和 PCB 的常用操作，重点覆盖引脚与封装关联、ERC/DRC、板层、丝印和板框等容易遗漏的环节。'
  },
  {
    source: 'word使用.md',
    target: 'word-formatting-notes.md',
    title: 'Word 中文论文排版与公式行距设置',
    date: '2026-08-01 22:06:00',
    category: '开发工具',
    tags: ['Word', '论文排版', '公式'],
    permalink: 'tools/word-formatting-notes/',
    description: '记录 Word 中文论文的段落、换行、题注和公式排版设置。',
    intro: '本文记录 Word 中文论文排版中常见的段落设置，重点解决插入公式后行距异常，并保留字体、题注和公式输入的参考资料。'
  },
  {
    source: '滤波器设计.md',
    target: 'analog-filter-design.md',
    title: '模拟滤波器设计：参数、Sallen-Key 与 MFB',
    date: '2026-08-01 22:07:00',
    category: '硬件设计',
    tags: ['模拟滤波器', 'Sallen-Key', 'MFB', '运算放大器'],
    permalink: 'hardware/analog-filter-design/',
    description: '整理模拟滤波器指标、主流响应类型，以及 Sallen-Key 和 MFB 有源滤波器设计。',
    intro: '本文从截止频率、品质因数和响应类型入手，整理 Sallen-Key 与多重反馈（MFB）有源滤波器的拓扑、计算关系和器件选择要点。'
  },
  {
    source: '电机电源.md',
    target: 'motor-drive-power-supply.md',
    title: '电机驱动电源与保护器件设计笔记',
    date: '2026-08-01 22:08:00',
    category: '硬件设计',
    tags: ['电源设计', '过压保护', '热插拔', 'Buck'],
    permalink: 'hardware/motor-drive-power-supply/',
    description: '整理 MAX6495、LM5069、LM5010、LM5005、TPS26213 和 TPS26600 的设计要点。',
    intro: '本文按器件整理电机驱动电源中的过压限制、热插拔、降压稳压和电子保险丝设计。公式和经验值用于辅助理解，实际设计必须回到对应型号的数据手册核对极限值与单位。'
  },
  {
    source: '电机驱动PCB-翻译总结.md',
    target: 'motor-drive-pcb-layout.md',
    title: '电机驱动 PCB 布局与布线要点',
    date: '2026-08-01 22:09:00',
    category: '硬件设计',
    tags: ['电机驱动', 'PCB', '接地', '热设计', '电流采样'],
    permalink: 'hardware/motor-drive-pcb-layout/',
    description: '总结电机驱动 PCB 的接地、散热、过孔、MOSFET 回路和电流采样布局。',
    intro: '电机驱动 PCB 同时面对大电流、高开关频率、热密度和微弱采样信号。本篇按接地、散热、过孔、功率回路和电流采样整理布局布线原则。'
  },
  {
    source: 'pmsm自动控制原理.md',
    target: 'pmsm-control-basics.md',
    title: 'PMSM 控制基础：一阶滞后、DOB 与低通滤波器',
    date: '2026-08-01 22:10:00',
    category: '电机控制',
    tags: ['PMSM', 'DOB', '低通滤波器', '离散化'],
    permalink: 'motor-control/pmsm-control-basics/',
    description: '从一阶滞后环节出发，整理扰动观测器和低通滤波器的离散实现。',
    intro: '本文把电机控制中经常同时出现的一阶滞后环节、扰动观测器（DOB）和一阶低通滤波器串联起来，重点说明连续模型、离散化方法和嵌入式实现之间的关系。'
  },
  {
    source: '三相永磁同步电机.md',
    target: 'three-phase-pmsm.md',
    title: '三相永磁同步电机建模与控制',
    date: '2026-08-01 22:11:00',
    category: '电机控制',
    tags: ['PMSM', '数学建模', 'SVPWM', '电流环'],
    permalink: 'motor-control/three-phase-pmsm/',
    description: '系统整理三相 PMSM 数学模型、SVPWM、电流环和经典双闭环控制。',
    intro: '本文以三相永磁同步电机为对象，从机械方程和三相静止坐标模型出发，推导坐标变换、SVPWM 和电流环设计，并把转速环与参数辨识拆分为独立文章以避免重复。'
  },
  {
    source: '双三相永磁同步电机.md',
    target: 'dual-three-phase-pmsm.md',
    title: '双三相永磁同步电机 SVPWM',
    date: '2026-08-01 22:12:00',
    category: '电机控制',
    tags: ['双三相 PMSM', 'SVPWM', '六相逆变器'],
    permalink: 'motor-control/dual-three-phase-pmsm/',
    description: '整理双三相电压源逆变器的空间矢量关系、两矢量 SVPWM 和幅值分析。',
    intro: '本文整理双三相电压源逆变器的电压空间矢量、传统两矢量 SVPWM 实现和基波幅值关系，为后续矢量空间解耦控制建立基础。'
  },
  {
    source: '永磁同步电机谐波分析.md',
    target: 'pmsm-harmonic-analysis.md',
    title: '永磁同步电机谐波与六相矢量空间分析',
    date: '2026-08-01 22:13:00',
    category: '电机控制',
    tags: ['PMSM', '空间谐波', '六相电机', 'Clarke 变换', 'VSD'],
    permalink: 'motor-control/pmsm-harmonic-analysis/',
    description: '推导三相空间谐波、六相时间谐波、Clarke 变换与矢量空间解耦模型。',
    intro: '本文从三相绕组磁动势出发，扩展到六相电机的时间谐波、Clarke 变换和矢量空间解耦（VSD）模型，保留完整推导链路以便检查各变换矩阵的来源。'
  },
  {
    source: '转速环PI参数整定.md',
    target: 'pmsm-speed-loop-pi-tuning.md',
    title: 'PMSM 转速环 PI 参数整定推导',
    date: '2026-08-01 22:14:00',
    category: '电机控制',
    tags: ['PMSM', 'PI 控制', '转速环', '有功阻尼'],
    permalink: 'motor-control/pmsm-speed-loop-pi-tuning/',
    description: '推导带有功阻尼的 PMSM 转速环 PI 参数、闭环传递函数和工程整定步骤。',
    intro: '本文在电流环近似理想、采用 $i_d=0$ 控制的前提下，推导带有功阻尼反馈的 PMSM 转速环 PI 参数，并给出闭环验证和工程整定顺序。'
  },
  {
    source: '电机疑问讨论.md',
    target: 'pmsm-parameter-measurement.md',
    title: 'PMSM 电感与磁链参数测量',
    date: '2026-08-01 22:15:00',
    category: '电机控制',
    tags: ['PMSM', '参数辨识', '电感测量', '磁链'],
    permalink: 'motor-control/pmsm-parameter-measurement/',
    description: '整理 PMSM 相电感、dq 轴电感和永磁体磁链的测量换算关系。',
    intro: '本文整理 PMSM 参数测量中的相电感模型、两相端口电感与 $d$、$q$ 轴电感换算，并补充反电动势法估算永磁体磁链的关系式。'
  },
  {
    source: 'simulink仿真.md',
    target: 'simulink-motor-simulation.md',
    title: 'Simulink 电机控制仿真常用模块与建议',
    date: '2026-08-01 22:16:00',
    category: '仿真工具',
    tags: ['Simulink', '电机仿真', '无感控制'],
    permalink: 'simulation/simulink-motor-simulation/',
    description: '记录 Simulink 电机控制仿真的常用模块、建模建议和无感仿真入口。',
    intro: '本文汇总 Simulink 电机控制仿真中常用的电源、测量、逻辑和信号路由模块，并记录模型拆分、采样时间和三相无感仿真的实践建议。'
  },
  {
    source: 'dengfoc学习笔记-常用foc代码.md',
    target: 'dengfoc-control-code.md',
    title: 'DengFOC 常用控制代码与三环结构',
    date: '2026-08-01 22:17:00',
    category: '电机控制',
    tags: ['DengFOC', 'FOC', '位置环', '速度环', '电流环'],
    permalink: 'motor-control/dengfoc-control-code/',
    description: '整理 DengFOC 坐标变换、开闭环位置控制、速度环和位置速度电流三环代码。',
    intro: '本文以 DengFOC 示例代码为线索，整理坐标变换、开环位置测试、闭环位置与速度控制，以及位置—速度—电流三环结构，并保留对采样频率和环路带宽的工程观察。'
  }
];

function cleanImportedMarkup(source) {
  return source
    .replace(/<!--\s*这是一张图片，ocr 内容为：\s*-->\s*/g, '')
    .replace(/<\/?font\b[^>]*>/gi, '')
    .replace(/^:::[^\r\n]*\r?\n?/gm, '')
    .replace(/\*\*\*\*/g, '')
    .replace(/^#{1,6}\s*$/gm, '')
    .replace(/[ \t]+$/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function normalizeHeadingLevels(source) {
  const matches = [...source.matchAll(/^(#{1,6})\s+\S/gm)];
  if (!matches.length) return source;
  const minimum = Math.min(...matches.map(match => match[1].length));
  const delta = minimum === 1 ? 1 : minimum > 2 ? 2 - minimum : 0;
  if (!delta) return source;

  return source.replace(/^(#{1,6})(\s+)(.+)$/gm, (line, hashes, spacing, title) => {
    const level = Math.max(2, Math.min(6, hashes.length + delta));
    return `${'#'.repeat(level)}${spacing}${title}`;
  });
}

function restructure(file, source) {
  let result = source;

  if (file === '三相永磁同步电机.md') {
    result = result.replace(
      /## 三、PMSM 的转速环 PI[\s\S]*?(?=## 四、PMSM 的电流环 PI)/,
      '## 三、PMSM 转速环 PI\n\n转速环的完整假设、参数推导和闭环验证已经整理到独立文章：[PMSM 转速环 PI 参数整定推导](/motor-control/pmsm-speed-loop-pi-tuning/)。本篇不再重复相同推导。\n\n'
    );
    result = result.replace(
      /## 七、参数识别[\s\S]*$/,
      '## 七、参数辨识\n\n相电感、$d$/$q$ 轴电感和永磁体磁链的测量换算已经整理到独立文章：[PMSM 电感与磁链参数测量](/motor-control/pmsm-parameter-measurement/)。'
    );
  }

  result = cleanImportedMarkup(result);
  result = normalizeHeadingLevels(result);

  if (file === 'AD使用.md') {
    result = result
      .replace(/^新建项目：四大重要组件\n\n原理图 、PCB、原理图库，PCB 库/, '## 项目组成\n\n一个完整项目通常包含原理图、PCB、原理图库和 PCB 封装库四类核心文件。')
      .replace(/^## 原理图库：/m, '## 原理图库')
      .replace(/^### 原理图操作/m, '## 原理图操作')
      .replace(/^### PCB 操作/m, '## PCB 操作')
      .replace(/^#### (\d+)[、.]\s*/gm, '### $1. ');
  }

  if (file === 'STM32_CLION.md') {
    result = result
      .replace(/CMakeList\.txt/g, 'CMakeLists.txt')
      .replace(/「CLION」/g, 'CLion')
      .replace(/^## 0、CMakeLists\.txt 配置/m, '## CMakeLists.txt 配置')
      .replace(/^## 0、CLion 配置/m, '## CLion 配置');
  }

  if (file === 'dengfoc学习笔记-常用foc代码.md') {
    result = result
      .replace(/备注：dengfoc 选用 spwm/i, '## 设计观察\n\nDengFOC 选用 SPWM。')
      .replace(/设计三环 pid/gi, '设计位置、速度和电流三环 PID')
      .replace(/先计算 位置环误差  输出给  转速环/, '位置环误差的输出作为速度环给定')
      .replace(/转速环误差输出给电流环   此处输出都有限幅/, '速度环误差的输出作为电流环给定，各环输出均需限幅');
  }

  if (file === 'pmsm自动控制原理.md') {
    result = result
      .replace(/^## 一阶滞后环节/m, '## 一、一阶滞后环节')
      .replace(/^## DOB 扰动观测器/m, '## 二、DOB 扰动观测器')
      .replace(/^## 一阶低通滤波器/m, '## 三、DOB 中的一阶低通滤波器')
      .replace(/^## 三、滤波系数α物理含义（重点）/m, '### 4. 滤波系数 $\\alpha$ 的物理含义')
      .replace(/^## 四、C语言嵌入式代码（标准一阶低通，适配DOB的Q滤波器）/m, '### 5. C 语言嵌入式实现')
      .replace(/^## 五、关键工程注意点（DOB专用）/m, '### 6. DOB 工程注意点')
      .replace(/^## 六、简化记忆/m, '### 7. 要点总结');
  }

  if (file === 'word使用.md') {
    result = result
      .replace(/^## word里加入公式后行间距变大\nword里加入公式后行间距变大/m, '## Word 中插入公式后行距变大')
      .replace(/^对齐方式：/m, '### 推荐的段落设置\n\n对齐方式：')
      .replace(/^\*\*按中文习惯控制首尾字符\*\*/m, '### 中文版式选项\n\n**按中文习惯控制首尾字符**');
  }

  if (file === '嵌入式.md') {
    result = result
      .replace(/^### 1、uart/im, '### 1. UART')
      .replace(/^### 2、 I2C/im, '### 2. I2C')
      .replace(/^### 3、 SPI/im, '### 3. SPI')
      .replace(/^### 4、can/im, '### 4. CAN');
  }

  if (file === '永磁同步电机谐波分析.md') {
    result = result.replace(/clark 变换/gi, 'Clarke 变换');
  }

  if (file === '滤波器设计.md') {
    result = result.replace(
      /^## 3、Sallen-Key 拓扑 （\[([^\]]+)\]\(([^)]+)\)）/m,
      '## 3. Sallen-Key 拓扑\n\n参考资料：[$1]($2)'
    );
  }

  if (file === '电机电源.md') {
    result = result.replace(/TPS26213BUck/g, 'TPS26213 Buck');
  }

  if (file === '电机驱动PCB-翻译总结.md') {
    result = result.replace(/Grounding Optmization/g, 'Grounding Optimization');
  }

  if (file === '双三相永磁同步电机.md') {
    result = result.replace(/^### 1\.2 传统的两矢量 SVPWM 算法的实现/m, '### 1.1 传统两矢量 SVPWM 算法');
  }

  if (file === '电机疑问讨论.md') {
    result = result
      .replace(/^1、电机电感参数测量\n\n电感测量：/, '## 相电感模型')
      .replace(/^对于数字电桥两端相接测电感,本处忽略漏感：/m, '## 两相端口电感换算\n\n对于数字电桥的两端测量，本节忽略漏感：')
      .replace(/^最大值：/m, '## 极值与 $d$/$q$ 轴电感\n\n最大值：');
    result += '\n\n## 永磁体磁链估算\n\n利用线电压反电动势峰峰值估算永磁体磁链：\n\n$$\n\\psi_f = \\frac{V_{pp}}{2\\sqrt{3}\\,\\omega_e}, \\qquad \\omega_e = 2\\pi p_n f\n$$\n\n其中，$p_n$ 为极对数，$f$ 为机械转频率。使用该关系前应确认 $V_{pp}$ 的测量对象和速度单位与公式定义一致。';
  }

  return result
    .replace(/[ \t]+$/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function frontMatter(post, hasMath) {
  const lines = [
    '---',
    `title: ${JSON.stringify(post.title)}`,
    `date: ${post.date}`,
    `description: ${JSON.stringify(post.description)}`,
    `permalink: ${post.permalink}`,
    'categories:',
    `  - ${post.category}`,
    'tags:',
    ...post.tags.map(tag => `  - ${tag}`),
    'toc: true'
  ];
  if (hasMath) lines.push('mathjax: true');
  lines.push('---');
  return lines.join('\n');
}

async function main() {
  const sourceNames = new Set(POSTS.map(post => post.source));
  const currentFiles = (await fs.readdir(POSTS_DIR)).filter(file => file.endsWith('.md'));
  const unexpected = currentFiles.filter(file => !sourceNames.has(file));
  if (unexpected.length) throw new Error(`Unexpected Markdown files: ${unexpected.join(', ')}`);

  for (const post of POSTS) {
    const sourcePath = path.join(POSTS_DIR, post.source);
    const targetPath = path.join(POSTS_DIR, post.target);
    const source = await fs.readFile(sourcePath, 'utf8');
    const body = restructure(post.source, source);
    const hasMath = MATH_POSTS.has(post.target);
    const output = `${frontMatter(post, hasMath)}\n\n${post.intro}\n\n<!-- more -->\n\n${body}\n`;

    if (sourcePath !== targetPath) {
      try {
        await fs.access(targetPath);
        throw new Error(`Target already exists: ${post.target}`);
      } catch (error) {
        if (error.code !== 'ENOENT') throw error;
      }
    }

    await fs.writeFile(targetPath, output, 'utf8');
  }

  for (const post of POSTS) {
    if (post.source !== post.target) await fs.unlink(path.join(POSTS_DIR, post.source));
  }

  console.log(`Organized ${POSTS.length} posts.`);
}

if (require.main === module) {
  main().catch(error => {
    console.error(error);
    process.exitCode = 1;
  });
}
