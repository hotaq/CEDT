#ifndef __STUDENT_H_
#define __STUDENT_H_
#include <algorithm>

template <typename T>
void CP::list<T>::merge(CP::list<CP::list<T>> &ls) {
 auto itr = ls.begin();
 for(size_t i=0;i<ls.size();i++){
  if((*itr).size() > 0){
    mSize += (*itr).size();
    (*itr).begin().ptr-> prev = mHeader->prev;
    mHeader->prev->next = (*itr).begin().ptr;

    auto itr_last = ls.end();
    itr_last--;
    mHeader->prev = itr_last.ptr;
    itr_last.ptr->next = mHeader;
    (*itr).end().ptr->prev = (*itr).end().ptr;
    (*itr).end().ptr->next = (*itr).end().ptr;
    

  }
  (*itr).mSize = 0;
  itr++;
 }

}

#endif
