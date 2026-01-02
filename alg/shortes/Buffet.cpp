#include <climits>
#include <cmath>
#include <functional>
#include <iostream>
#include <queue>
#include <vector>

typedef std::pair<int,std::pair<int,int>> ppii;
typedef std::pair<int,int> pii;
typedef std::tuple<int,int,int> tu;
using namespace std;

int main(){
    int n,m; cin >> n >> m;
    vector<int> up(n);
    vector<int> down(n);
    for(int i =0;i<n;i++) cin >> down[i];
    for(int i =0;i<n;i++) cin >> up[i];

    vector<vector<int>> g(n);
    for(int i =0;i<m;i++){
        int a,b;
        cin >> a >>b;
        g[a].push_back(b);
    }


    priority_queue<pii,vector<pii>,greater<pii>> pq;
    vector<int> dis(n,1e9);
    dis[0] = 0;
    pq.push({0,0});
    while (!pq.empty()) {
        auto [w,v] = pq.top();
        pq.pop();

        if(w > dis[v]) continue;
        for(auto z:g[v]){
            int cost  = up[v] + down[z] + w;
            if(dis[z] > cost){
                dis[z] = cost;
                pq.push({cost,z});
            }
        }

    }
    for(auto s:dis){
        if(s==1e9){
            cout << -1 << " ";
        }else {
             cout << s << " ";
        }

    }


}

//10 100 1
//20 1 2
//30 2 3
//40 3 -1
