#include <vector>
#include<algorithm>
using namespace std;

template <typename T>
vector<T> Union(const vector<T>& A, const vector<T>& B) {
    vector<T> v;
    sort(A.begin(),A.end());
    sort(B.begin(),B.end());
    for(size_t i=0;i<A.size();i++){
        v.push_back(A[i]);
    }
    for(int i=0;i<B.size();i++){
        if(find(v.begin(),v.end(),B[i]) == v.end()){
            v.push_back(B[i]);
        }
    }

    return v;
}

template <typename T>
vector<T> Intersect(const vector<T>& A, const vector<T>& B) {
    vector<T> v;
    sort(A.begin(),A.end());
    sort(B.begin(),B.end());
    for(int i =0;i<A.size();i++){
        for(int j =0;j<B.size();j++){
            if(A[i] == B[j]){
                
                v.push_back(A[i]);
                
            }
        }
    }
    return v;
}
