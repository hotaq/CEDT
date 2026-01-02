#ifndef __STACK_STUDENT_H__
#define __STACK_STUDENT_H__
#include "stack.h"
#include<algorithm>
template <typename T>
void CP::stack<T>::jenga(char c, int a)
{
    if(c=='p'){
        int idx = mSize-1-a;
        T tmp = mData[idx];
        for(int i =idx;i<mSize-1;i++){
            mData[i] = mData[i+1];
        }
        mData[mSize-1] = tmp;

    }else {
        while(a--){
            this->pop();
        }
    }
}

#endif

