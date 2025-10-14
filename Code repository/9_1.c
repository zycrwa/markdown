/* computes pairwise averages of three numbers */

#include <stdio.h>

double average(double a, double b)
{
    return (a+b)/2.0;
}

int main(void)
{
    double x,y,z;

    printf("Enter three numbers: ");
    scanf("%lf %lf %lf", &x, &y, &z);

    printf("average of %g and %g: %g\n",x,y,average(x,y));
    printf("average of %g and %g: %g\n",y,z,average(y,z));
    printf("average of %g and %g: %g\n",x,z,average(x,z));

    return 0;

}