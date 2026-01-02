#include <functional>
#include <iostream>
#include <queue>
#include <tuple>
#include <vector>


using namespace std;

int main(){
    int r,c;
    cin >>r >> c;
    vector<vector<int>> g(r,vector<int>(c));
    for(int i=0;i<r;i++){
        for(int j=0;j<c;j++){
            cin >> g[i][j];
        }
    }
    pair<int,int> move[] = {{-1,0},{1,0},{0,1},{0,-1}};
    priority_queue<tuple<int,int,int>,vector<tuple<int,int,int>>,greater<tuple<int,int,int>>> pq;
    pq.push({0,0,0});
    vector<vector<int>> dist(r,vector<int>(1e9));
    dist[0][0] = 0;
    while(!pq.empty()){
        auto data = pq.top();
        int ni = get<0>(data);
        int nj = get<1>(data);
        int w = get<2>(data);

        pq.pop();

        if(dist[ni][nj] < w) continue;
        for(int i =0;i<4;i++){
            if(ni + move[i].first >=0 && ni + move[i].first < r && nj + move[i].second >= 0 && nj+move[i].second < c ){
                if(w + g[ni + move[i].first][nj + move[i].second] < dist[ni+move[i].first][nj + move[i].second]){
                    dist[ni+move[i].first][nj + move[i].second] = w + g[ni + move[i].first][nj + move[i].second];
                    pq.push({w + g[ni + move[i].first][nj + move[i].second],ni + move[i].first,nj + move[i].second});
                }
            }
        }
    }

    for(int i =0;i<r;i++){
        for(int j=0;j<c;j++){
            cout << dist[i][j] << " ";
        }
        cout << "\n";
    }



}
