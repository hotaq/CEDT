#include <iostream>
using namespace std;

bool dfs(int n, int a, vector<vector<int>>& ed, vector<bool>& visited){
    visited[n] = true;
    for(int e : ed[n]){
        if(!visited[e]){
            if(dfs(e, n, ed, visited))
                return true;
        } else if(e != a){
            return true;
        }
    }
    return false;
}

int main() {
    ios_base::sync_with_stdio(false); cin.tie(0);
    int n, v, e, a, b;
    cin >> n;
    for(int i = 0; i < n; i++){
        cin >> v >> e;
        vector<vector<int>> ed(v);
        vector<bool> visited(v, false);
        for(int j = 0; j < e; j++){
            cin >> a >> b;
            ed[a].push_back(b);
            ed[b].push_back(a);
        }
        bool ind = false;
        for(int j = 0; j < v; ++j){
            if(!visited[j]){
                if(dfs(j, -1, ed, visited)){
                    ind = true;
                    break;
                }
            }
        }
        cout << (ind ? "YES" : "NO") << "\n";
    }
}
