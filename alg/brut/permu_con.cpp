#include <iostream>
#include <vector>
#include <map>
using namespace std;
vector<string> ans;
int n,k;
map<int,vector<int>> check;
string txt;
vector<bool> vis(1000,false);

bool validate(int prev,int next){
    for(auto s:ans[prev]){
        if(s==next) return true;
    }
    return false;
}

void permu(int idx){
    if(idx == n){
        ans.push_back(txt);
        return;
    }
    for(int i =0;i<n;i++){
        if(vis[i]) continue;

        if(i > 0  && !validate(txt.back(), (char)i)) continue;
        vis[i] = true;
        txt.push_back((char)i);
        permu(idx+1);
        txt.pop_back();
        vis[i] = false;

    }
}


int main(){

    cin >> n >> k;
    for(int i =0;i<k;i++){
        int a,b;cin >> a >>b;
        check[a].push_back(b);
    }
    permu(0);
}
