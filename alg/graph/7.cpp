#include <iostream>
#include <vector>


using namespace std;


void dfs(int n,vector<vector<int>> &g,vector<bool> &vis){
    vis[n] = true;

    for(auto s:g[n]){
        if(!vis[s]){
            dfs(s,g,vis);

        }
    }
}


int main(){
    int v,e;
    cin >> v >> e;
    vector<vector<int>> g(v,vector<int>(v));
    vector<bool> visited(v,false);
    for(int i =0;i<e;i++){
        int a,b;
        cin >> a >> b;
        g[a-1].push_back(b-1);
        g[b-1].push_back(a-1);
    }
    int cnt=0;
    for(int i =0;i<v;i++){
        if(!visited[i]){
            dfs(i,g,visited);
            cnt++;
        }

    }
    cout << cnt << endl;
    //return 0;


}
