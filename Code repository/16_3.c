/* maintains a parts database */
/*
    创建程序用来维护零件的数据库
    创建一个结构体数组：零件的编号，名称，数量
*/
#include <stdio.h>


#define NAME_LEN 25
#define MAX_PARTS 100

struct part{
    int number;/* 编号 */
    char name[NAME_LEN+1];/* 名称 */
    int on_hand;/* 数量 */
}   inventory[MAX_PARTS]; /* 零件数组 */

int num_parts = 0;  /* 零件的记录个数 */

int find_part(int number);
void insert(void);
void search(void);
void update(void);
void print(void);
int read_line(char str[], int n);

int main(void)
{
    char code;
    for(;;){
        printf("Enter operation code:");

        scanf(" %c",&code); // %c前面的空格表示跳过空白字符(\t\n等)
        while(getchar() != '\n')
            ;
        printf("Operation: %d\n",code);

        switch (code){
            case 'i': insert();
                break;
            case 's': search();
                break;
            case 'u': update();
                break;
            case 'p': print();
                break;
            case 'q': return 0;
            default:
                printf("Illegal code\n");

        }
        printf("\n");
    }
}

/*
    输入零件编号
    输出零件的数组位置(0 - num_parts - 1)
    找不到则返回-1
*/
int find_part(int number)
{
    int i;

    for(i = 0;i < num_parts;i++)
        if(inventory[i].number == number)
            return i;
    return -1;
}

/*
    零件数据输入
*/

void insert(void)
{
    int part_number;

    /* 如果零件数组满了无法添加 */
    if(num_parts == MAX_PARTS){
        printf("Database is full; can't add more parts.\n");
        return;
    }
    /* 数组没有满可以添加，输入编号 */
    printf("Enter part number:");
    scanf("%d", &part_number);
    /* 判断零件编号是否已经存在 */
    if(find_part(part_number) != -1){ /*零件已经存在*/
        printf("Part already exists.\n");
        return;
    }
    /* 读入零件的编号 */
    inventory[num_parts].number = part_number;
    /* 读入零件的名称  */
    printf("Enter part name:");
    read_line(inventory[num_parts].name, NAME_LEN);
    
    /* 读入零件的库存数量 */
    printf("Enter quantity on hand:");
    scanf("%d",&inventory[num_parts].on_hand);
    /* 零件的记录个数加1 */
    num_parts++;
    printf("Part added.\n");

}


/*
    零件数据查询
*/
void search(void)
{
    int i, number;

    printf("enter part number:");
    scanf("%d",&number);
    /* 读入数据编码 */
    i = find_part(number);
    if(i >= 0){
        printf("part name:%s\n",inventory[i].name);
        printf("quantity on hand:%d\n",inventory[i].on_hand);
    }else{
        printf("Part not found.\n");
    }
}

void update(void)
{
    int i, number, change;

    printf("enter part number:");
    scanf("%d", &number);
    i = find_part(number);
    if(i >= 0){
        printf("enter change in quantity on hand:");
        scanf("%d", &change);
        inventory[i].on_hand = change;
    }else{
        printf("Part not found.\n");
    }
}

void print(void)
{
    int i;

    printf("part number    Part Name"
          "       Quantity on Hand\n");
    
    for(i = 0;i < num_parts;i++)
        printf("%7d     %-25s%11d\n",
        inventory[i].number,
        inventory[i].name,
        inventory[i].on_hand);

}




/*
    @brief 读入一整行
    @param str 存储输入的字符串
    @param n 最多读取的字符数的个数
    @return 返回读取的字符数的长度

*/
int read_line(char str[], int n)
{
    int ch, i = 0;
    while ( ispace( ch = getchar() ) )
        ;
    while((ch = getchar()) != '\n' && ch != EOF )
        if (i < n)
            str[i++] = ch;
    str[i] = '\0';
    return i;
}