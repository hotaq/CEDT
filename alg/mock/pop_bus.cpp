#include <climits>
#include <iostream>
#include <queue>
#include <utility>
#include <vector>

typedef std::pair<int,int> pp ;
using namespace std;

int main(){
    int r,c;
    cin >>r >>c;
    vector<vector<char>> v(r,vector<char>(c));
    vector<pp> pop[6];
    for(int i =0;i<r;i++){
        for(int j=0;j<c;j++){
            char a;
            cin >>a ;
            v[i][j] = a;
            if(a >= '1' && a <= '5'){
                pop[a-'0'].push_back({i,j});
            }
        }
    }

    for (int i = 1; i <= 5; i++) {
        if(pop[i].size() == 2){
            //cout << pop[i][0].first;
            int ds1 = abs(pop[i][0].first-0) + abs(pop[i][0].second);
            int ds2 = abs(pop[i][1].first-0) + abs(pop[i][1].second);
            if(ds2<ds1) swap(pop[i][0],pop[i][1]);

        }

    }
   // cout << v[2][3];

    queue<pp> pq;
    vector<vector<int>> dis(r,vector<int>(c,1e9));
    pp move[] = {{1,0},{0,1},{0,-1}};
    pq.push({0,0});
    dis[0][0] = 0;
    while (!pq.empty()) {
        auto [i,j] = pq.front();
        pq.pop();
        if(i==r-1 && j == c-1){
            cout << dis[i][j];
            break;
        }
        for(int u =0;u<3;u++){
            int ni = i + move[u].first;
            int nj=  j + move[u].second;



            if (ni < 0 || ni >= r || nj < 0 || nj >= c) continue;
            if (v[ni][nj] == 'X') continue;
            if(v[ni][nj] >= '1' && v[ni][nj] <= '5'){
                int pop_num = v[ni][nj]-'0';
                auto ppa = pop[pop_num][1];
                if(pop[pop_num].size() == 2){
                    if(dis[ppa.first][ppa.second] > dis[i][j]){
                         dis[ppa.first][ppa.second] = dis[i][j]+1;
                         pq.push({ppa.first,ppa.second});
                    }
                    //continue;
                }
               //


            }
            if(dis[ni][nj] > dis[i][j] +1 ){
                dis[ni][nj] = dis[i][j] + 1;

                pq.push({ni,nj});




                }
        }




        }



    }
