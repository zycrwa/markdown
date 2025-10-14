/* computes the dimensional weight of a box */
/* 计算盒子的尺寸重量 */

#include <stdio.h>

int main()
{
    int height,length,width,volume,weight;

    height = 8;
    length = 12;
    width = 10;
    volume = height * length * width;
    weight = (volume + 165) / 166;

    printf("Dimensions: %dx%dx%d\n", length, width, height);
    printf("Volume : %d\n", volume);
    printf("Dimensional weight : %d\n",weight);
    
    return 0;
}