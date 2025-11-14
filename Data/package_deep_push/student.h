#ifndef __STUDENT_H_
#define __STUDENT_H_
#include<vector>

template <typename T>
void CP::stack<T>::deep_push(size_t pos,const T& value) {
        if(pos > mSize)return;
        std ::vector<T> temp;
        if(pos ==0){
        push(value); return;
        }
              for(int i =0;i<pos;i++){
                temp.push_back(top());
                pop();
        }
        push(value);
        for(int i=temp.size()-1;i>=0;i--){
               push(temp[i]);
        }

        // 1 2 3 4 10
        // 10 4 3 2 1     
        
     
}
#endif


1 2 3 4 5
pos = 0 
value 10
normal push 
1 2 3 4 5 10

pos > 0 , 2
1 2 3 value 4 5 
vector = 5 4

