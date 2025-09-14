/* -*- coding: utf-8 -*- */
/*converts a fahrenheit temperature to celsius*/

#include <stdio.h>

/* 常量 */
#define FREEZING_POINT 32.0f
#define SCALE_FACTOR (5.0f/9.0f)

int main(void)
{
    float fahrenheit,celsius;
    printf("Enter fahrenheit temperature: ");
    scanf("%f",&fahrenheit);

    celsius = (fahrenheit - FREEZING_POINT) * SCALE_FACTOR;
    printf("Celsius equivalent: %.1f\n",celsius);

    return 0;

}