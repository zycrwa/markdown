/* sorts an array of integers using quicksort algorithm */

#include <stdio.h>

#define N 10

void quicksort(int a[],int low,int high);

int split(int a[],int low,int high);

int main(void)
{
    int a[N],i;

    printf("Enter %d numbers to be sorted: ",N);
    for(i = 0; i < N; i++)
        scanf("%d",&a[i]);

    quicksort(a,0,N-1);

    printf("After sorting:\n");
    for(i = 0; i < N; i++)
        printf("%d ",a[i]);
    printf("\n");

    return 0;

}

/*
    
*/
void quicksort(int a[],int low,int high)
{
    int middle;

    if (low >= high)
        return;
    middle = split(a,low,high);
    //这里使用递归
    quicksort(a,low,middle-1);
    quicksort(a,middle+1,high);

}

    /*
 * 将数组分割成两部分，左侧元素小于等于基准元素，右侧元素大于等于基准元素
 * a: 待分割的数组
 * low: 分割范围的起始索引
 * high: 分割范围的结束索引
 * 返回值: 基准元素的最终位置索引
 */
int split(int a[],int low,int high)
{
    int part_element = a[low];

    for(;;){
        // 从右向左找到第一个小于基准元素的元素
        while (low < high && part_element <= a[high])
        {
            high--;
        }
        if (low >= high)break;
        
        a[low++] = a[high];
        /* 
            a[low] = a[high];
            low++;
        */

        // 从左向右找到第一个大于基准元素的元素
        while (low < high && a[low] <= part_element)
            low++;
        if (low >= high) break;
        a[high--] = a[low];
    }

    // 将基准元素放到正确的位置,这个时候，high和low相等
    a[high] = part_element;
    return high;
}