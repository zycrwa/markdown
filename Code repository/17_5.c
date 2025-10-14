#include <stdio.h>
#include <stdlib.h>
#include <ctype.h>

int read_line(char str[], int n);

int read_line(char str[], int n)
{
    int ch, i = 0;
    while ( isspace( ch = getchar() ) )
        ;
        
    do{
        if (i < n)
            str[i++] = ch;
    }while((ch = getchar()) != '\n' && ch != EOF);

    str[i] = '\0';
    return i;
}

#define NAME_LEN 25

struct part {
    int number; //零件编号
    char name[NAME_LEN+1]; //零件名字
    int on_hand;    //零件数量
    struct part *next;  //指向下一个零件的指针 
};

struct part *inventory = NULL; /* points to first part */

struct part *find_part(int number);
void insert(void);
void search(void);
void update(void);
void print(void);


int main(void)
{
    char code;
    
    for(;;){
        printf("Enter operation code: ");
        scanf(" %c",&code);
        while(getchar() != '\n')
        ;
        switch(code){
            case 'i':insert();
                break;
            case 's':search();
                break;
            case 'u':update();
                break;
            case 'p':print();
                break;
            default:
                printf("Illegal code\n");
        }
        printf("\n");
    }
}


struct part *find_part(int number)
{
    struct part *p;

    for(p = inventory;
        p != NULL && p->number != number;
        p = p->next);
    
    if(p != NULL && p -> number == number)
        return p;

    return NULL;
}

void insert(void)
{
    struct part *cur, *prev, *new_node;

    new_node = malloc(sizeof(struct part));
    if(new_node == NULL)
    {
        printf("Database is full; can't add more parts.\n");
        return;
    }

    printf("Enter part number:");
    scanf("%d", &new_node -> number);
    
    /* 链表按照零件编号升序排列，寻找插入位置 */
    /* find the insertion point in the list */
    for(cur = inventory,prev = NULL;
        cur != NULL && new_node -> number > cur -> number;
        prev = cur,cur = cur -> next)
        ;
    
    
    if (cur != NULL && new_node ->number == cur -> number){
        printf("Part already exists.\n");
        free(new_node);
        return;
    }
    printf("Enter part name:");
    read_line(new_node -> name, NAME_LEN);
    printf("Enter quantity on hand:");
    scanf("%d",&new_node -> on_hand);

    new_node ->next = cur;
    if(prev == NULL)
        inventory = new_node;
    else
        prev -> next = new_node;     
}

void search(void)
{
    int number;
    struct part *p;

    printf("Enter part number:");
    scanf("%d", &number);
    p = find_part(number);
    if (p != NULL)
    {
        printf("part name: %s\n",p -> name);
        printf("quantity on hand: %d\n",p -> on_hand);
    }
    else
        printf("Part not found.\n");
}

void update(void)
{
    int number,change;
    struct part *p;

    printf("Enter part number:");
    scanf("%d", &number);
    p = find_part(number);
    if (p != NULL)
    {
        printf("Enter change in quantity on hand:");
        scanf("%d", &change);
        p -> on_hand += change;
    }
    else
        printf("Part not found.\n");
}

void print(void)
{
    struct part *p;

    printf("Number\tName\tQuantity on hand\n");
    for(p = inventory; p != NULL; p = p -> next)
        printf("%d\t%s\t%d\n",p -> number,p -> name,p -> on_hand);
}