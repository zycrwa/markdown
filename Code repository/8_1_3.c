/* utf-8 */
/* checks numbers for repeated digits */
/* 检查数字是否有重复数字 */
#include <stdio.h>
#include <stdbool.h>
#include <string.h>


int main(void)
{
    bool digit_seen[10] = {false};
    int digit;
    long n;

    printf("enter anumber: ");
    scanf("%ld", &n);

    while (n > 0){
        digit = n % 10;
        if (digit_seen[digit])
            break;
        digit_seen[digit] = true;
        n /= 10;    
    }

    if (n > 0)
        printf("repeated digit %d\n", digit);
    else 
        printf("no repeated digit\n");
    
    return 0;

}