#include<iostream>
#include<set>
using namespace std;
int main(){
    int n;
    cin >> n;
    set<long long> s;
    bool check = true;
    for(int i =0;i<n;i++) {
        long long x;
        cin >> x;
        s.insert(x);
        if(s.find(x) != s.end()){
            check = false;
            
        }
    }
    if(check){
        cout << "YES\n";
    }else {
        cout << "NO\n";
    }
   
    

}
