#include <stdio.h>
#include <stdlib.h>

#define HASH_SIZE 1009

// 定义Node结构体
typedef struct Node {
    int key;
    int value;
    struct Node* next;
} Node;

// 定义MyHashMap结构体
typedef struct {
    Node** buckets;
} MyHashMap;

// 哈希函数
int hash(int key) {
    return key % HASH_SIZE;
}

// 创建哈希表
MyHashMap* myHashMapCreate() {
    MyHashMap* map = (MyHashMap*)malloc(sizeof(MyHashMap));
    map->buckets = (Node**)calloc(HASH_SIZE, sizeof(Node*));
    return map;
}

// 插入/更新键值对
void myHashMapPut(MyHashMap* map, int key, int value) {
    int index = hash(key);
    Node* curr = map->buckets[index];
    while (curr) {
        if (curr->key == key) {
            curr->value = value;
            return;
        }
        curr = curr->next;
    }
    Node* newNode = (Node*)malloc(sizeof(Node));
    newNode->key = key;
    newNode->value = value;
    newNode->next = map->buckets[index];
    map->buckets[index] = newNode;
}

// 查找Value
int myHashMapGet(MyHashMap* map, int key) {
    int index = hash(key);
    Node* curr = map->buckets[index];
    while (curr) {
        if (curr->key == key) {
            return curr->value;
        }
        curr = curr->next;
    }
    return -1;
}

// 删除键值对
void myHashMapRemove(MyHashMap* map, int key) {
    int index = hash(key);
    Node* curr = map->buckets[index];
    Node* prev = NULL;
    while (curr) {
        if (curr->key == key) {
            if (prev) {
                prev->next = curr->next;
            } else {
                map->buckets[index] = curr->next;
            }
            free(curr);
            return;
        }
        prev = curr;
        curr = curr->next;
    }
}

// 销毁哈希表
void myHashMapFree(MyHashMap* map) {
    for (int i = 0; i < HASH_SIZE; i++) {
        Node* curr = map->buckets[i];
        while (curr) {
            Node* temp = curr;
            curr = curr->next;
            free(temp);
        }
    }
    free(map->buckets);
    free(map);
}

// 测试用例
int main() {
    MyHashMap* map = myHashMapCreate();
    
    // 插入键值对
    myHashMapPut(map, 1, 100);
    myHashMapPut(map, 2, 200);
    myHashMapPut(map, 101, 300); // 101%1009=101，和1的桶不同
    
    // 查找
    printf("Key 1: %d", myHashMapGet(map, 1));   // 输出100

    // 更新
    myHashMapPut(map, 1, 1000);

    // 删除
    myHashMapRemove(map, 2);

    
    // 销毁
    myHashMapFree(map);
    return 0;
}