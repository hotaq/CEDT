#include<iostream>
#include <queue>
#include <vector>

using namespace std;




bool dfs(int u, vector<bool> &vis,vector<vector<int>> &v){
    vis[u] = true;


     for(auto s:v[u]){
        if(v[s].size()>2){
            return false;
        }

        if(!vis[s] && !dfs(s,vis,v)){
            return false;
        }
    }
    return true;

}


int main(){
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    int n,e;
    cin >> n >> e;
    vector<vector<int>> v(n);
    vector<bool> vis(n,false);
    for(int i =0;i<e;i++){
        int a,b;
        cin >> a >> b;
        v[a].push_back(b);
        v[b].push_back(a);
    }
    int cnt=0;
    for(int i =0;i<n;i++){
        if(!vis[i] && v[i].size() <= 1  && dfs(i,vis,v)){
            cnt++;
        }
    }

    cout << cnt;
    return 0;



}
