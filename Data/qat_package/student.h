#ifndef __STUDENT_H_
#define __STUDENT_H_

namespace CP {

template <typename T>
T queue<T>::operator[](int idx) {

    if (idx < 0) idx = mSize + idx;

    size_t real_index = (mFront + idx) % mCap;


    return mData[real_index];
}

}

#endif
