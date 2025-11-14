#include<iostream>
#include<list>
using namespace std;

int main(){
    int n,k,v;
    cin >> n >> k >> v;
    list<int> a(n);
    for(auto &x:a ) cin >> x;
    auto it = a.insert(next(a.begin(),k),v);
    while(!a.empty()){
        int l=0,r=0;
        if(*it == *(it++)) r++;
        if(*it == *(it--)) l++;
        int range = r+l+1;
        
    }

    

}