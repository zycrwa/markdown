#include <stdio.h>
#include <ctype.h>

#define MAX_LEN 100

int main(){
    char arr[MAX_LEN];
    char *p = arr;
    char ch;
    printf("Enter a string: ");

    while((ch = getchar()) != '\n'){
        if(isalpha(ch)){
            *p = tolower(ch);
            p++;
        }
    }

    *p = '\0';

    int is_pal = 1;
    char *q = p - 1;

    p = arr;

    while(p < q){
        if(*p != *q){
            is_pal = 0;
            break;
        }
        p++;
        q--;
    }

    printf("%s\n", is_pal ? "Palindrome" : "Not a palindrome");
    return 0;
    

}