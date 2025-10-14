/*Computes the dimensional weight of a
  box from input provided by the user
*/

#include <stdio.h>

int main()
{
    int height,length,width,volume,weight;

    printf("Rnter height of box: ");
    scanf("%d",&height);

    printf("Enter length of box: ");
    scanf("%d",&length);

    printf("Enter width of box: ");
    scanf("%d",&width);

    volume = height * length * width;

    weight = (volume + 165) / 166;

    printf("volume: %d\n",volume);

    printf("dimensional weight: %d\n",weight);

    return 0;
    


}