#include <functional>
#include <iostream>
#include <queue>
#include <vector>

typedef std::pair<int,int> pp ;
using namespace std;

int main(){
    int r,c;
    cin >> r >> c;
    vector<vector<int>> g(r,vector<int>(c));
    vector<vector<int>> dis(r,vector<int>(c,-1));
    queue<pp> pq;

    for(int i = 0; i < r; i++){
        for(int j = 0; j < c; j++){
            cin >> g[i][j];
            if(g[i][j] == 1){
                pq.push({i,j});
                dis[i][j] = 0;
            }
        }
    }

    pair<int,int> move[] = {{1,0},{-1,0},{0,1},{0,-1}};

    while(!pq.empty()){
        auto [a,b] = pq.front();
        pq.pop();

        if(g[a][b] == 2){
            cout << dis[a][b]+1 << "\n";
            //cout << a << " " << b << "\n";
            break;
        }

        for(int i = 0; i < 4; i++){
            int ni = a + move[i].first;
            int nj = b + move[i].second;

            if(ni < 0 || ni >= r || nj < 0 || nj >= c) continue;
            if(g[ni][nj] == 3) continue;

            if(dis[ni][nj] != -1) continue;
            dis[ni][nj] = dis[a][b] + 1;

            pq.push({ni,nj});
        }
    }
}
