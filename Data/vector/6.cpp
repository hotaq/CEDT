#include<iostream>
#include<set>
using namespace std;

int main(){
    int m,n;
    cin >> n >> m;
    set<pair<int,int>> mm;
    for(int i =0;i<n;i++){
        int a,b;
        cin >> a >> b;
        mm.insert({a,b});
    }
    for(int i =0;i<m;i++){
        int a,b;
        cin >> a >> b;
        auto it = mm.lower_bound({a,b});
        if(mm.find({a,b}) != mm.end()){
            cout << "0 0" << " ";
       
       
        }else {
            if(it == mm.begin()){
                cout << "-1 -1" << " ";
            }else {
                --it;
                cout << it->first << " " << it->second << " ";
            }
        }
        
}
}