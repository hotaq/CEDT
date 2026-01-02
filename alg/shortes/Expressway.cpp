#include <iostream>
using namespace std;

typedef pair<int,int> pii;

int main(){
    int n, a;
    cin >> n >> a;


    priority_queue<pii, vector<pii>, greater<pii>> pq;

    
    vector<vector<pii>> g(n+1);

    g[1].push_back({2,a});
    g[2].push_back({1,a});

    for(int i=3;i<=n;i++){
        int x; cin >> x;
        while(x--){
            int u,w;
            cin >> u >> w;
            g[i].push_back({u,w});
            g[u].push_back({i,w});
        }

        pq.push({0,1});
        vector<int> dist(n+1,INT_MAX);
        dist[1] = 0;
        while(!pq.empty()){
            auto [d,u] = pq.top(); pq.pop();
            if(d > dist[u]) continue;

            for(auto [v,w] : g[u]){
                if(dist[v] > d + w){
                    dist[v] = d + w;
                    pq.push({dist[v], v});
                }
            }
        }
        cout << dist[2] << " ";
    }




}
