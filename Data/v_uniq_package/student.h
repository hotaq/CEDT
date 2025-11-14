#ifndef __STUDENT_H_
#define __STUDENT_H_

//you can include any other file here
//you are allow to use any data structure


template <typename T>
void CP::vector<T>::uniq() {
    size_t count = 0;
    
    for(size_t i =0;i<mSize;i++){
        bool found = false;
        for(size_t j =0;j<mSize;j++){
          if(mData[i] == mData[j]){
            found = true;
            break;
          }
        }
        if(!found){
            mData[count] = mData[i];
            count++;
        }
    }
    mSize = count;
}

#endif
