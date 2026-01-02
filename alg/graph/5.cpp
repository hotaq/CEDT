#include<iostream>

using namespace std;

vector<int> edge[100001] ;
int visited[100001] ;
int deg1=0 ;
int ans = -1 ;

void dfs(int pre,int idx,int cnt){
    visited[idx] = cnt;
    for(auto s:edge[idx]){
        if(visited[s] == -1 ){
            dfs(idx,s,cnt+1);
        }else if(s != pre && ans == -1){
            ans = cnt-visited[s];
        }
    }
}




int main(){
    ios_base :: sync_with_stdio(false) ;cin.tie(NULL) ;
    int V ;cin >> V ;
    for(int i=0;i<V;i++){
        int a,b ;
        cin >> a >> b ;
        edge[a].push_back(b) ;
        edge[b].push_back(a) ;
        visited[i] = -1 ;
    }
    dfs(-1,0,0) ;
    cout << ans <<"\n" ;

}
