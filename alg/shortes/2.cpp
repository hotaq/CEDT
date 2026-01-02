#include <climits>
#include <functional>
#include <iostream>
#include <queue>
#include <tuple>
#include <vector>


using namespace std;

int main(){
    int n,e,s;
    cin >> n >> e >> s;
    vector<vector<pair<int,int>>> g(n);
    while(e--){
        int a,b,c;
        cin >> a >> b >> c;
        g[a].push_back({b,c});

    }
    vector<int> dis(n,1e9);
    dis[s] = 0;
    for(int i =0;i<n-1;i++){

        for(int j=0;j<n;j++){
            if(dis[j] == 1e9) continue;

            for(auto &p :g[j]){
                int v = p.first;
                int w = p.second;

                if(dis[j] + w < dis[v]){
                    dis[v] = dis[j] + w;
                    if(i==n){cout << -1;break;}
                }
            }

        }

    }




}
    for(auto s:dis){
        cout << s <<  " ";
    }
}
