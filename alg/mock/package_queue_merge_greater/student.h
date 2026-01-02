#ifndef __STUDENT_H_
#define __STUDENT_H_

#include "queue.h"
#include<vector>
#include<algorithm>
template <typename T> void CP::queue<T>::merge_greater(CP::queue<T> &other) {
  if(this == &other) return;
  std::vector<T> a(mSize);
  std::vector<T> b(other.mSize);

  for(int i =0;i<mSize;i++){
    a[i] = mData[(mFront+i)%mCap];

  }
  for(int i=0;i<other.mSize;i++){
    b[i] = other.mData[(other.mFront+i)%mCap];
  }

  std::vector<T> newA;
  std::vector<T> newB;
  newA.reserve(a.size() + b.size());
  newB.reserve(b.size());
  std::vector<bool> used(b.size(),false);
  int n = std::min(a.size(),b.size());
  for(int i=0;i<a.size();i++){
    newA.push_back(a[i]);
    if(i<n && b[i] > a[i]){
      newA.push_back(b[i]);
      used[i] = true;

    }
  }

  for(int i =0;i<b.size();i++){
    if(!used[i]) newB.push_back(b[i]);

  }
  
  mFront =0;
  ensureCapacity(newA.size());
  for(int i =0;i<newA.size();i++) mData[i] = newA[i];
  mSize = newA.size();

  other.mFront = 0;
  for(int i =0;i<newB.size();i++) other.mData[i] = newB[i];
  other.mSize = newB.size();


}

#endif


