#include <iostream>
#include <vector>

typedef std::vector<std::vector<int>> vv ;
using namespace std;

vv g;
vv w;
bool ok;
void dfs(int v, int parent,vector<bool> &vis, int target,int sum){
    if(ok) return;

    if(sum == target){
        ok = true;
        return;
    }
    vis[v] = true;
    //if(sum > target) return;
    for(int i =0;i<g[v].size();i++){
        if(!vis[g[v][i]]){
            dfs(g[v][i],v,vis,target,sum+w[v][i]);
        }


    }
    vis[v] = false;
}


int main(){
    int n,m;
    cin >> n >> m;
    vector<int> check(8);
    for(int i =0;i<8;i++){
        cin >> check[i];
    }
    g.assign(n,{});
    w.assign(n,{});
    for(int i =0;i<m;i++){
        int a,b,c;
        cin >> a >> b >>c;
        g[a].push_back(b);
        g[b].push_back(a);
        w[a].push_back(c);
        w[b].push_back(c);
    }
    vector<bool> vis(n,false);
    for(int i =0;i<8;i++){
        int target = check[i];
        ok = false;
        for(int st = 0;st<n;st++){
            dfs(st,-1,vis,target,0);
            if(ok){
                break;
            }
        }
        if(ok){
            cout << "YES" << "\n";
        }else {
           cout << "NO" << "\n";
        }
    }

}


//4 6
//45 29 37 22 45 34 36 38
//1 2 20
//0 1 7
//1 3 15
//2 3 3
//0 2 10
//0 3 15
