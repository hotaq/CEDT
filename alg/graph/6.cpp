#include <iostream>
#include <queue>
#include <utility>
#include <vector>


using namespace std;




int main(){
    int r,c,t;
    cin >> r >> c >> t;
    int arr[r][c];
    bool visted[r][c];
    //bool visted_one[r][c];
    for(int i =0;i<r;i++){
        for(int j=0;j<c;j++){
            visted[i][j] = false;
        }
    }
    queue<pair<int,int>> save_one;
    for(int i=0;i<r;i++){
        for(int j=0;j<c;j++){
            cin >> arr[i][j];
            if(arr[i][j] == 1){

                save_one.push({i,j});
            }

        }
    }


    while(t--){
        int size_save = save_one.size();
        while (size_save--) {
            int y = save_one.front().first;
            int x = save_one.front().second;
            save_one.pop();

            if(x+1<c){
                if(arr[y][x+1] == 0 && visted[y][x+1]!=true){
                    arr[y][x+1] = 1;
                    save_one.push({y,x+1});
                    visted[y][x+1] = true;

                }
            }
            if(x-1>=0){
                if(arr[y][x-1] == 0 && visted[y][x-1]!=true){
                    arr[y][x-1] = 1;
                    save_one.push({y,x-1});
                    visted[y][x-1] = true;

                }
            }
            if(y+1<r){
                if(arr[y+1][x] == 0 && visted[y+1][x]!=true){
                    arr[y+1][x] = 1;
                    save_one.push({y+1,x});
                    visted[y+1][x] = true;

                }
            }
            if(y-1>=0){
                if(arr[y-1][x] == 0 && visted[y-1][x]!=true){
                    arr[y-1][x] = 1;
                    save_one.push({y-1,x});
                    visted[y-1][x] = true;

                }
            }

        }

    }
    int cnt=0;
    for(int i=0;i<r;i++){
        for(int j=0;j<c;j++){
           // cout << arr[i][j] << " ";
            if(arr[i][j] == 1){
                cnt++;
            }
        }

    }
    cout << cnt;

}
