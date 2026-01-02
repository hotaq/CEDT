#ifndef __STUDENT_H_
#define __STUDENT_H_
#include "list.h"
template <typename T>
void CP::list<T>::implant(CP::list<T> &other,int pos1,int pos2,int count){
    if(count == 0) return;
    node *A = mHeader->next;
    for(int i =0;i<pos1;i++){
        A = A->next;
    }

    node *B = other.mHeader->next;
    for(int i =0;i<pos2;i++){
        B = B->next;
    }
    node *C = B;
    for(int i =1;i<=count;i++){
        C=  C->next;
    }

    B->prev->next = C->next;
    C->next->prev = B->prev;

    node *last_A = A->next;

    A->next = B;
    B->prev = A;


    C->next = last_A;
    last_A->prev = C;

    mSize += count;
    other.mSize -= count;




}
#endif
