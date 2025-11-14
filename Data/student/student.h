#ifndef STACK_STUDENT_H
#define STACK_STUDENT_H
#include "stack.h"

template <typename T>
void CP::stack<T>::mitosis(int a, int b)
{
    std ::vector<T> temp;
    //mCap += (b - a) * 2;
    for (int i = 0; i <= b; i++)
    {
        temp.push_back(top());
        pop();
    }
    for (int i = temp.size() - 1; i >= a; i--)
    {
        push(temp[i]);
        push(temp[i]);
    }
    for (int i = b; i >= 0; i--)
    {
        push(temp[i]);
    }
}

#endif