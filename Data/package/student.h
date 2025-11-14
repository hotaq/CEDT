#ifndef __STUDENT_H_
#define __STUDENT_H_

#include <algorithm>
#include <iostream>

template <typename T>
void CP::queue<T>::move_to_front(size_t pos) {
   while(pos){
    std::swap(mData[(mFront + pos)%mCap],mData[(mFront + pos -1)%mCap]);
    pos--;
   }
    
}

#endif

