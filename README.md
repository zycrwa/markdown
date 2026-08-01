# c语言学习

## 知识库入口

这个仓库已经配置成一个可浏览的多文档 Markdown 知识库。打开网页后，可以在左侧看到多个文档，点击即可切换并渲染正文。

### 访问入口

- 直接打开： [knowledge.html](knowledge.html)
- 或者通过本地服务访问：

```bash
python3 -m http.server 8000
```

然后访问：

```text
http://127.0.0.1:8000/knowledge.html
```

### 当前支持

- 多文档列表展示
- 点击切换内容
- Markdown 基础渲染
- 后续可继续扩展为搜索、标签、目录和 AI 读取接口

# 数据类型

```c
/*
类型 				储存大小	 范围
char 				1字节	   0-255
unsigned char		1字节	   0-255
signed char	 		1字节	   -128-127
int					4字节	   
unsigned int 		4字节
short  				2字节
unsigned short      2字节
long				8字节

float 				4字节
double              8字节
long double			8字节
*/
```



# 常量

```c
85         /* 十进制 */
0213       /* 八进制 */
0x4b       /* 十六进制 */
30         /* 整数 */
30u        /* 无符号整数 */
30l        /* 长整数 */
30ul       /* 无符号长整数 */

3.14159       /* 合法的 */
314159E-5L    /* 合法的 */
510E          /* 非法的：不完整的指数 */
210f          /* 非法的：没有小数或指数 */
.e55          /* 非法的：缺少整数或分数 */
```



# 数组

```c
/* 定义和初始化数组 */
double balance[5] = {1000.0, 2.0, 3.4, 7.0, 50.0};
double balance[] = {1000.0, 2.0, 3.4, 7.0, 50.0};

/* 获取数组长度 */
int numbers[] = {1,2,3,4,5};
int length = sizeof(numbers) / sizeof(numbers[0]);

/* 多维数组 */
int a[3][4] = {  
 {0, 1, 2, 3} ,   /*  初始化索引号为 0 的行 */
 {4, 5, 6, 7} ,   /*  初始化索引号为 1 的行 */
 {8, 9, 10, 11}   /*  初始化索引号为 2 的行 */
};

int a[3][4] = {0,1,2,3,4,5,6,7,8,9,10,11};

/* 传递数组给函数 */
void myFunction(int param[])
{
  
}

void myFunction(int param[10])
{
    
}

void myFunction(int *param)
{
    
}

/* 函数与指针 */
double *p;
double balance[10];

p = balance;//单独数组名字就相当于指针
*(p + 0) = balance[0]
*(p + 1) = balance[1]

/* 动态数组 */
int size = 5;
int *dynamicArray = (int *)malloc(size * sizeof(int));
free( dynamicArray);// 动态数组内存释放
```



# 指针

```c
/* 指针的运算 */
int var[] = {10,100,200};
int i, *ptr;
ptr = var;
for(i = 0; i<3;i++)
{
    printf("储存值：%d",*ptr);
    ptr++;
}

/* 指针数组 */
int *ptr[10];
//每一个数组的值都是指针
const char *names[] = {
                   "Zara Ali",
                   "Hina Ali",
                   "Nuha Ali",
                   "Sara Ali",
   };
for (int i = 0; i < MAX; i++){
     printf("Value of names[%d] = %s\n", i, names[i] );
}

/* 传递指针给函数 */
double getAverage( int *arr,int size)
{
    int i,sum =0;
    double avg;
    for(i = 0;i<size;i++)
        sum += arr[i];
    avg = (double) sum/ size;
}

/* 从函数返回指针 */
int *myFunction()
{
    
}

/* 函数指针 */
void populate_array(int *array,size_t arraySize,int (*getNextValue)(void))//传入函数
{
    for(size_t i = 0;i<arraySize;i++)
        array[i] = (*getNextValue)();//这里传入的是函数的指针，调用指针函数
}

```

# 字符串

```c
char site[7] = {'R', 'U', 'N', 'O', 'O', 'B', '\0'};
char site[] = "RUNOOB";
/*
字符串函数
strcpy(s1,s2);	复制s2到字符串s1
strcat(s1,s2);	连接字符串s2到s1末尾
strlen(s1);		返回字符串长度，不包含'/0'
strcmp(s1,s2);	比较大小
*/
```



# 选择语句

```c
if()
    
else if()
    
else if()

else

// 条件表达式
k = (i >= 0 ? i : 0)

//switch 语句
switch (grade){
    case 4: printf("Excellent");
        	break;
    case 3: printf("Good");
        	break;
    default:printf("Illegal grade");
        	break;
}
```



# 循环

```c
while(i < n){
 
}

do{
	statement(s);
}while(condition);

for(i = 10;i > 0;i--){
    
}
```



# 函数注释

示例：

```c
/*
*@brief 计算两个整数的和
*@param a 第一个整数
*@param b 第二个整数
*@return 两个整数的和
*/
int add(int a, int b){
    return a + b;
}
```





# 格式符说明符

| 格式说明符 | 说明         | 对应的数据类型 |
| ---------- | ------------ | -------------- |
| %c         | 字符         | char           |
| %d         | 有符号十进制 | int            |
| %i         | 有符号十进制 | int            |
| %u         | 无符号十进制 | unsigned int   |
| %o         | 八进制       | int            |
| %x         | 十六进制     | int            |
| %f         | 单精度浮点数 | float          |
| %lf        | 双精度浮点数 | double         |
| %s         | 字符串       | char[ ]        |
| %p         | 指针地址     | 指针           |

修饰符

%5d:输出5个字符宽度，右对齐

%-5d:左对齐

%05d:不足部分用0填充

%.2f:保留两位小数

%10.2f:总宽度10，保留2位小数，右对齐







# 结构,联合和枚举

```c
/* 结构变量定义 */

struct(关键字) tag(结构体标签){
    member-list;
    member-list;
    member-list;    
}variable-list(结构体变量);

struct tag t1,t2[20];

typedef struct
{
    int a;
    int b;
    double c;
}Simple;

Simple u1,u2[20],*u3;

/* 结构体变量的初始化 */
/* 在定义中初始化 */
struct Books
{
    char title[50];
    char author[50];
    char subject[100];
    int book_id;
}book = { "c语言" , "RUNOOB" , "编程语言" , "123456" }；

/* 在定义后初始化 */
struct Books Book1;
strcpy(Book1.title,"C Programming");
strcpy(Book1.author,"Nuha Ali");
strcpy(Book1.subject,"C Programming Tutorial");
Book1.book_id = 123456;

/* 结构体指针 */
struct Books *struct_pointer;
struct_pointer = &Book1;
/* 使用指针来访问结构体成员 */
struct_pointer->title
```

```c
/* 共用体 */
union Data
{
    int i;
    float f;
    char str[20];
}data;

typedef struct{
    int kind; /*tag field*/
    union{
        int i;
        double d;
    }u;
}NUMBER;
```

```c
/* 枚举 */
enum DAY
{
    MON=1,TUE,WED,THU,FRI,SAT,SUN
};
enum DAY day;
/* 枚举中day 类似 union */
int main(){
	for(day = MON;day <= SUN; day++){
        printf("枚举元素：%d \n",day)  //输出为1，2，3，4，5，6
    }
}
```





# typedef-关键字

```c
typedef unsigned(修饰符) char(字符类型) BYTE
```



# 预处理器

| 指令     | 描述                                 | 示例                                                |
| -------- | ------------------------------------ | --------------------------------------------------- |
| #define  | 定义宏                               | #define PI 3.1415926                                |
| #include | 包含头文件                           |                                                     |
| #undef   | 取消定义的宏                         | #undef PI                                           |
| #ifdef   | 如果宏定义则编译后续代码             | #ifdef DEBUG      printf(“Debug info\n”);    #endif |
| #ifndef  | 如果宏未定义则编译(常用于头文件保护) | #ifndef HEADER_H #define HEADER_H  #endif           |
| #if      | 条件编译                             | #if VERSION >2 #endif                               |
| #else    | #if/#ifdef/#ifndef的替代分支         | #ifdef WIN32 #else #endif                           |
| #elif    |                                      | #if defined(UNIX) #elif defined (WIN32) #endif      |
| #endif   | 结束条件编译                         |                                                     |
| #error   | 产生编译错误并输出消息               |                                                     |
| #pragma  | 编译器特定指令                       |                                                     |

```c
// 宏延续运算符 \
#define  message_for(a, b)  \
    printf(#a " and " #b ": We love you!\n")

//标记粘贴运算符 ##
#define tokenpaster(n) printf ("token" #n " = %d", token##n)
 
int main(void)
{
   int token34 = 40;
   
   tokenpaster(34);
   return 0;
}
```



# <string.h>

## strcpy

```c
//函数原型
char *strcpy(char *dest,const char *src){
    char *p = dest;     // p指向dest的起始地址
    while(*p != '\0'){  //p是指针，*p是取地址符号
        *p = *src;		//*src赋值给*p
        p++;			//p和src的指针都移动下一位置
        src++;
    }
    *p = '\0';			//字符串的结尾放置一个'\0'
    return dest;
}
    
```



## strncpy

```c
char *strcnpy(char *dest,const char *src,size_t n)
//dest -- 用于储存复制内容的目标数组
//src  -- 要复制的字符串
//n    -- 字符数
```



## strcat

```c
char *strcat(char *dest,const char *src)
// src追加字符串到dest后面
```



## strcmp

```c
int strcmp(const char *str1,const char *str2)

// str1 < str2 返回小于0
// str1 == str2 返回等于0
```

```c
小写英文的ascii大于大写
```



#  stdlib.h

## string.h

```c
size_t strlen(const char *str)
/* 返回字符串长度，不包含空字符 */
```

## malloc

```c
void *malloc(size_t size)
//size -- 内存块的大小，以字节为单位,该函数不会初始化内存
```

## calloc

```c
void *calloc(size_t nitems,size_t size)
//nitems要被分配元素个数
//元素大小
```

## free

```c
void free(void *ptr)
ptr -- 指针指向一个要释放内存的内存块，该内存块之前是通过调用 malloc、calloc 或 realloc 进行分配内存的。如果传递的参数是一个空指针，则不会执行任何动作。 
备注：指针释放后后处
free(array);
array = NULL;
```



# stdio.h

## sprintf

```c
int sprintf(char *str,const char *format,......)
// format是一个字符串
#include <stdio.h>
#include <math.h>

int main()
{
   char str[80];

   sprintf(str, "Pi 的值 = %f", M_PI);
   puts(str);
   
   return(0);
}
```



# <ctype.h>

## isspace()函数

```c
int isspace(int c) /* 检查字符是否是空白字符 */
' '	 (0x20)	空格符
'\t' (0x09)	水平制表符
'\n' (0x0a)	换行符
'\v' (0x0b)	垂直制表符
'\f' (0x0c)	换页符
'\r' (0x0d)	回车符

如果c是一个空白字符，则该函数返回true，否则返回false
```



## isalnum

```c
int isalnum(int c);
//c 是一个数字或一个字母，则该函数返回非零值，否则返回0
```



## tolower

```c
int tolower(int c);
// c 有相对应的小写字母，则该函数返回 c 的小写字母，否则 c 保持不变。返回值是一个可被隐式转换为 char 类型的 int 值。
```



# 指针和数组

```c
//int(*arr)[8]和int* brr[8]的区别
//int(*arr)[8]的意思是指向一个8位数组的指针
//int* brr[8] 是一个8位数组，数组里面就是放置一个个指针
int main() {
    int(*arr)[8]; // 数组指针
    int* brr[8];  // 指针数组
    int a[8] = {1,2,3,4,5,6,7,8};

    // 关键：初始化arr，让它指向a数组
    arr = &a; // &a的类型是int(*)[8]，与arr匹配！

    // 现在可以安全使用arr了：
    (*arr)[0] = 10; // 修改a[0]为10（等价于arr[0][0]）
    arr[0][1] = 20; // 修改a[1]为20（等价于(*arr)[1]）

    // brr的使用是正确的
    brr[0] = a;     // a退化为int*，赋值给brr[0]
    brr[1] = &a[1]; // &a[1]是int*，赋值给brr[1]

    return 0;
}



//指向指针的指针
#define HASH_SIZE 1009

typedef struct Node{
    int key;
    int value;
    struct Node* next;
}Node;


typedef struct {
    Node** buckets;  //可以理解为指向“Node*数组”的指针
} MyHashMap;


MyHashMap* myHashMapCreate() {
    MyHashMap* map = (MyHashMap*)malloc(sizeof(MyHashMap));
    map->buckets = (Node**)calloc(HASH_SIZE,sizeof(Node*)); // calloc实际上是分配了一个node*数组并且返回这个数组的地址
    return map;
}


//指向指针的指针
char* strs[] = {"flower", "flow", "flight"};
/*
	strs[0],strs[1],strs[2] 本身就是一个字符串指针
	strs[0][0]->"flower"的第0个字符串->'f';
	strs[0][1]->"flower"的第1个字符串->'l';
*/
```

