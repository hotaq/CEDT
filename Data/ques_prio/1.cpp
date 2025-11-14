#include<iostream>
#include<map>
using namespace std;

int main(){
    int n,m,co,pre;
    cin >> n >> m;
    int top;
    map<string,int> name;
    for(int i =0;i<n;i++){
        string x;
        cin >> x;
        name[x]++;
    }
   
    priority_queue<int> check;
    for(auto s:name){
        check.push(s.second);
    }
   

    while(!check.empty() && co < m && check.top() != 0){
       pre = check.top();
       check.pop();
       co++;    

   }
   cout << pre << "\n";
}


