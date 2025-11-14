#ifndef __STUDENT_H_
#define __STUDENT_H_

#include <vector>
#include "queue.h"

template <typename T>
void CP::queue<T>::remove_many(std::vector<size_t> pos)
{
  T* newData = T[mSize-pos.size()];
  int j=0,k=0;
  for(size_t i =0;i<mSize;i++){
    if(i == pos[j]){
      newData[k] = mData[(mFront+i)%mCap];
      k++;x
    }else {

      j++;
    }
  }
  delete [] mData;
  mData = newData;
  mSize = mSize-pos.size();
  mCap = mSize;
  mFront = 0;
}

#endif

