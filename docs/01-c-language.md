# C 语言学习笔记

## 变量和数据类型

C 语言中的基本数据类型包括：

- `int`：整数
- `float`：单精度浮点数
- `double`：双精度浮点数
- `char`：字符

```c
int age = 18;
float score = 98.5;
char grade = 'A';
```

## 数组和指针

数组用于存储一组相同类型的数据，而指针用于保存地址。

```c
int numbers[5] = {1, 2, 3, 4, 5};
int *p = numbers;
```

## 结构体

结构体可以把多个变量组合成一个更有意义的对象。

```c
struct Student {
    char name[20];
    int age;
};
```
