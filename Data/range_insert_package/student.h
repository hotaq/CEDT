#ifndef __STUDENT_H_
#define __STUDENT_H_


template <typename T>
void CP::vector<T>::insert(iterator position,iterator first,iterator last) {
    size_t index = position - begin();
    size_t count = last - first;
    if(count == 0) return;

    T* newData = new T[mSize + count]();
    for(size_t i = 0;i<index;i++){
        newData[i] = mData[i];
    }
    for(size_t i =0;i<count;i++ ){
      newData[index +i] = *(first + i);
    }

    for(size_t i = index;i<mSize;i++){
      newData[i + count] = mData[i];
    }

    del [] mData;
    mData = newData;
    msize += count; 
   
}

#endif
