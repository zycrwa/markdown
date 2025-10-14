/* prints a table of squares using a while statement */

#include <stdio.h>

int main(void)
{
    int i, n;

    printf("this program prints atable of squares.\n");
    printf("enter number of entries in table:");

    scanf("%d", &n);
   
    i = 1;
    while(i <= n)
    {
        printf("%10d%10d\n", i, i * i);
        i = i + 1;

    }

    return 0;

}