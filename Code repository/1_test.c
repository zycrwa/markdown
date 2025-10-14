#include "string.h"
#include "stdio.h"
#include "stdlib.h"
#include "math.h"
#include "stdbool.h"

char* convertToTitle(int columnNumber) { 
    
    char *res = (char*)(sizeof(char) * 10);
    if(res == NULL) return NULL;

    int count = 0;

    while(columnNumber > 0){
        columnNumber--;
        int rem = columnNumber % 26;
        res[count++] = rem + 'A' ;
        columnNumber = columnNumber / 26;
    }

    for(int i = 0; i < count / 2; i++){
        char temp = res[i];
        res[i] = res[count - i - 1];
        res[count - i - 1] = temp;
    }

    res[count] = '\0';
    return res;

}

int main(){
    int a = 2147483647;
    char *res = convertToTitle(a);
    printf("%s", res);
}