/* prints a one-month reminder list */

#include <stdio.h>
#include <string.h>

#define MAX_REMIND 50
#define MSG_LEN 60

int read_line(char str[], int n);

/*
    读取一行数据的固定长度符数
    返回读取的字符数的个数
*/
int read_line(char str[], int n)
{
    int ch, i = 0;

    while((ch = getchar()) != '\n')
        if(i < n)
            str[i++] = ch;

    str[i] = '\0';
    return i;

}

int main(void)
{
    char reminders[MAX_REMIND][MSG_LEN + 1];
    char day_str[3],msg_str[MSG_LEN + 1];
    int day, i, j, num_remind = 0;

    for(;;){
        if(num_remind == MAX_REMIND){
            printf("-- No space left --\n");
            break;
        }

        printf("Enter day and reminder: ");
        scanf("%2d", &day);

        if(day == 0)
            break;
            
        sprintf(day_str, "%2d", day);/* 赋值 */
        read_line(msg_str, MSG_LEN);

        for(i = 0; i < num_remind; i++)
            if(strcmp(day_str,reminders[i]) < 0)
            /* ascii码表：空字符 数字 大写字母 小写字母 */
            /* 如果比较值小之后就是要插入这里面 */
                break;
        /* 把需要插入的元素，后面所有的元素都向后移动一位 */
        for(j = num_remind; j > i; j--)
            strcpy(reminders[j], reminders[j-1]);
        
        strcpy(reminders[i], day_str);/* 复制字符串 */
        strcat(reminders[i], msg_str);/* 连接字符串 */
        num_remind++;
    }
    
    printf("\nDay Reminder\n");
    for(i = 0; i < num_remind; i++)
        printf(" %s\n", reminders[i]);

    return 0;

}
