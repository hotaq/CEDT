#include <climits>
#include <cmath>
#include <functional>
#include <iostream>
#include <queue>
#include <utility>
#include <vector>

using namespace std;

typedef pair<int, int> pii;


int main(){
    ios_base::sync_with_stdio(false); cin.tie(nullptr);
    int n;
    cin >> n;
    vector<vector<int>> g(n,vector<int>(n));

    for(int i =0;i<n-1;i++){
            for(int j =i+1;j<n;j++){
                cin >> g[i][j];
                g[j][i] = g[i][j];
        }
    }
    int total_cost  = 0,cnt= 0;
    priority_queue<pii, vector<pii>, greater<pii>> h;
    vector<int> cost(n,INT_MAX);
    vector<bool> used(n,false);

    h.push({0,0});

    while(!h.empty()){
        auto [cos,node] = h.top();
        h.pop();

        if(used[node]) continue;

        used[node] = true;
        total_cost += cos;
        cnt++;
        if(cnt == n ){
            cout << total_cost;
            return 0;
        }
        for(int i =0;i<n;i++){
            if(!used[i] && cost[i] > g[node][i]){
                cost[i] = g[node][i];
                h.push({g[node][i],i});
            }
        }


    }
    cout << total_cost;




}
