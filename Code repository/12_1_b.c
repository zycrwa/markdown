#include <stdio.h>
#define MAX 100

int main()
{
    char msg[MAX];
    char *p = msg;
    char ch;
    printf("Enter a message: ");

    while((ch = getchar()) != '\n' && p < msg + MAX){
        *p = ch;
        p++;
    }

    *p = '\0';

    while(p > msg){
        p--;
        putchar(*p); 
    }
    putchar('\n');
    return 0;

}