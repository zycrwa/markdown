/* 指向指针的指针 */

#include <stdio.h>
#include <stdlib.h>

struct node{
    int value; // 数据域
    struct node *next; // 指针域
};

void add_to_list(struct node **list, int n){
    struct node *new_node;
    new_node = malloc(sizeof(struct node));//申请内存
    if(new_node == NULL){
        printf("Error: malloc failed in add_to_list\n");
        exit(EXIT_FAILURE);
    }
    new_node->value = n;
    new_node->next = *list; // *list代表
    *list = new_node;
}

int main() {
    struct node *head = NULL;  // 初始化链表头指针为NULL（空链表）

    // 第1次插入：成绩5 → 链表从“空”→ “5 → NULL”
    add_to_list(&head, 5);     

    // 第2次插入：成绩3 → 链表从 “5 → NULL” → “3 → 5 → NULL”
    add_to_list(&head, 3);     

    // 第3次插入：成绩8 → 链表从 “3 → 5 → NULL” → “8 → 3 → 5 → NULL”
    add_to_list(&head, 8);     

    // 遍历链表，打印所有成绩（验证插入结果）
    struct node *current = head;
    while (current != NULL) {
        printf("%d  ", current->value);
        current = current->next;
    }
    printf("\n");

    return 0;
}
