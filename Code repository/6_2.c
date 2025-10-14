/* calculates the number of digits in an integer */

#include <stdio.h>

int main(void)
{
    int digits = 0;
    int n;

    printf("Enter an integer: ");
    scanf("%d", &n);

    do{
        n = n / 10;
        digits++;

    }while(n != 0);

    printf("Number of digits: %d\n", digits);

    return 0;

}