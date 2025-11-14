#ifndef __STUDENT_H__
#define __STUDENT_H__

#include <algorithm>
#include <vector>
#include "priority_queue.h"

template <typename T,typename Comp >
T CP::priority_queue<T,Comp>::get_kth(size_t k) const {
    CP::priority_queue<T,Comp> tmp(*this);

    for(size_t i=1;i<k;i++){
      tmp.pop();
    }
    return tmp.top();
  
}

#endif
