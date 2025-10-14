/* prints a table of compound interest */
/* 计算利息表 */

#include <stdio.h>

#define NUM_RATES ((int)(sizeof(values) / sizeof(values[0])))
#define INITIAL_BALANCE 100.00


int main(void)
{
    int i, low_rate, num_years, year;
    double values[5];

    printf("Enter interest rate: ");
    scanf("%d", &low_rate);

    printf("Enter number of years: ");
    scanf("%d", &num_years);

    printf("\nYears");
    for(i=0 ;i < NUM_RATES; i++){
        printf("%6d%%",low_rate + i);
        values[i] = INITIAL_BALANCE;
    }
    printf("\n");

    for(year = 1; year <= num_years; year++){
        printf("%3d   ",year);
        for(i = 0; i < NUM_RATES; i++){
            values[i] += (low_rate + i) / 100.0 * values[i];
            printf("%7.2f",values[i]);
        }
        printf("\n");
    }

    return 0;
}