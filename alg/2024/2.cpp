#include <iostream>
#include <queue>
#include <vector>


using namespace std;

int main() {
    int r,c,k;
    cin >> r >> c >> k;
    vector<vector<int>> g(r,vector<int>(c));
    vector<vector<bool>> vis(r,vector<bool>(c,false));
    vector<pair<int,int>> move = {{-1,0},{1,0},{0,-1},{0,1}};
    queue<pair<int,int>> one;
    for(int i=0;i<r;i++){
        for(int j=0;j<c;j++){
            int x;
            cin >> x;
            g[i][j] = x;
            if(x == 1) one.push({i,j});

        }
    }

    while (!one.empty() && k) {
        int size_o = one.size();
        for(int u =0;u<size_o;u++){
            auto [i,j] = one.front();
            one.pop();

            for(auto [dx,dy] : move){
                int x = i + dx;
                int y = j + dy;
                if(x >= 0 && x < r && y >= 0 && y < c && g[x][y] == 0){
                    g[x][y] = 2;
                    one.push({x,y});
                }
            }

            }

            k--;
    }
    for(int i =0;i<r;i++){
        for(int j=0;j<c;j++){
            cout << g[i][j] << " ";
        }
        cout << endl;
    }
    return 0;
}
