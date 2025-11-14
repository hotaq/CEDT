#ifndef __STUDENT_H_
#define __STUDENT_H_


#include <iostream>
#include <vector>

template <typename T>
void CP::queue<T>::move_to_back(size_t pos) {
    for(size_t i=pos;i<mSize-1;i++){
        std::swap(mData[(mFront + i)%mCap],mData[(mFront + i +1)%mCap]);
    }

    
    
}


#endif


