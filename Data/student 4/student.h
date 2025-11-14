#ifndef _STUDENT_H_INCLUDED
#define _STUDENT_H_INCLUDED
#include "queue.h"

template <typename T>
void CP::queue<T>::reverse() {
  for(size_t i=0;i<(mSize/2)+1;i++){
    std::swap(mData[(mFront+i)%mCap],mData[(mFront+mSize-i-1)%mCap]);
  }
}

template <typename T>
const T& CP::queue<T>::front() const {
  // You MAY need to edit thixs function
  return mData[mFront];
}

template <typename T>
const T& CP::queue<T>::back() const {
  // You MAY need to edit this function
  return mData[(mFront + mSize - 1) % mCap];
}

template <typename T>
void CP::queue<T>::push(const T& element) {
  // You MAY need to edit this function
  ensureCapacity(mSize + 1);
  mData[(mFront + mSize) % mCap] = element;
  mSize++;
}

template <typename T>
void CP::queue<T>::pop() {
  // You MAY need to edit this function
  mFront = (mFront + 1) % mCap;
  mSize--;
}

#endif

