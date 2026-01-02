#include <functional>
#include <iostream>
#include <queue>
#include <utility>
#include <vector>

typedef std::pair<int, int> pp;
using namespace std;


int main(){
    int n,m,k;
    cin >> n >> m >>k;
    vector<int> str(k);
    for(int i =0;i<k;i++){
        cin >> str[i];
    }

    vector<int> tims(n);
    for(int i = 0;i<n;i++){
        cin >> tims[i];

    }

    vector<vector<int>> node(n);
    for(int i =0;i<m;i++){
        int a,b;
        cin >> a >>b;
        node[a].push_back(b);
        node[b].push_back(a);
    }

    priority_queue<pp,vector<pp>,greater<pp>> pq;
    vector<int> dis(n,1e9);
    for(auto s:str){
        dis[s] = tims[s];
        pq.push({dis[s],s});
    }

    while(!pq.empty()){
        int power = pq.top().first;
        int v = pq.top().second;
        pq.pop();
        if(power > dis[v]) continue;


        for(auto next:node[v]){
            int check = power + tims[next];
            if(dis[next] > check){
                dis[next] = check;
                pq.push({check,next});
            }
        }
    }

    int ans = -1;
    for(int i =0;i<dis.size();i++){
        ans = max(ans,dis[i]);
    }
    cout << ans;
}
