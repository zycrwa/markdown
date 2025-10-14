#include <stdio.h>

#define MAX 100

int main()
{
    char msg[MAX];

    int i = 0;

    char ch;

    printf("Enter a message: ");
    //读取字符到字符串，直到'\n’或数组满了
    while((ch = getchar()) != '\n' && i < MAX){
        msg[i] = ch;
        i++;
    }
    msg[i] = '\0';/* 字符串结束符 */

    
    while(i > 0){
        i--;
        putchar(msg[i]);
    }
    putchar('\n');
    return 0;
    

}