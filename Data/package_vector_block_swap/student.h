#ifndef __STUDENT_H_
#define __STUDENT_H_

template <typename T>
bool CP::vector<T>::block_swap(iterator a, iterator b, size_t m) {
    if(m==0) return false;
    if(a < this->begin() || b < this-begin()){
      return false;
    }
    if(a+m-1 >= this->end()|| b+m-1 >= this->end()){
      return false;

    }
    if(!(a+m <=b || b+m <=a)){
      return false;
    }

    for(size_t i=0;i<m;i++){
      std::swap(*(a+i),*(b+i));
    }

    return true;
}


#endif
