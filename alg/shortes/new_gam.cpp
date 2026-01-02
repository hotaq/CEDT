#include<iostream>

using namespace std;
int r,c;
int arr[501][501];
int ans = 0;
pair<int,int> moveas[] = {{-1,1},{0,1},{1,1}};
#define mod  100000007 
void dfs(int i,int j,int last){
    if(j == c){
        ans = (ans + 1)%mod;
        return;
    }

    for(int d =0;d<3;d++){
        if(d == last) continue;
        int ni = i + moveas[d].first;
        int nj = j + moveas[d].second;

        if(ni > r || ni < 1 || nj > c || ni < 1) continue;

        if(arr[ni][nj] == 1) continue;

        dfs(ni,nj,d);
        
    }

}


int main(){
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    cin >>r >> c;
    for(int i =1;i<=r;i++){
        for(int j =1;j<=c;j++){
            cin >> arr[i][j];
        }
    }

    for(int i =1;i<=r;i++){
        if(arr[i][1] == 0){
            dfs(i,1,-1);
        }
    }

    cout << ans%mod << " ";

}