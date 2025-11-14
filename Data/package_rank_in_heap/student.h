#ifndef __STUDENT_H_
#define __STUDENT_H_

using namespace std;

template <typename T,typename Comp>
size_t CP::priority_queue<T,Comp>::get_rank(size_t pos) const {
    int selectd = mData[pos];
    int cnt=0;
    for(size_t i=0;i<mSize;i++){
      if(mLess(selectd,mData[i])) cnt++;
    }
    return cnt;
}

#endif
