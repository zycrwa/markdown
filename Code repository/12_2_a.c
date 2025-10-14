#include <stdio.h>
#include <string.h>
#include <ctype.h>

#define MAX_LEN 100

int main(){
    char arr[MAX_LEN];
    int pos = 0;
    char ch;
    printf("Enter a string: ");

    //过滤非字母，储存小写字符
    while((ch = getchar()) != '\n'){
        if(isalpha(ch)){
            arr[pos] = tolower(ch);//转换成小写的字母
            pos ++;
        }
    }

    arr[pos] = '\0';
    int is_pal = 1;

    //比较前后字符
    for(int i = 0; i < pos / 2; i ++){
        if(arr[i] != arr[pos - i - 1]){
            is_pal = 0;
            break;

        }
    }
    printf("%s\n",is_pal ? "Palindrome" : "Not a palindrome");

    return 0;

}
