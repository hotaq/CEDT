#include <iostream>
#include <queue>
#include <vector>

using namespace std;
int n;
vector<vector<int>> v(n);
void bfs(int current,int target,int &cnt,vector<int> &as){
    as[current] = 0;
    queue<int> q;
    q.push(current);
    while (!q.empty()) {
        int tmp = q.front();
        q.pop();
        for(auto s:v[tmp]){

        }

    }



}



void find_max_k(int n,int k,vector<int> &v){

    int max_sol = 0;

    for(int i =0;i<n;i++){
        int cnt=0;
        bfs(i,k,cnt,v);

        if(cnt > max_sol) max_sol = cnt;
    }


}



int main() {
  int e, k;
  cin >> n >> e >> k;
  vector<int> dis(n,-1);


  for (int i = 0; i < e; ++i) {
    int a, b;
    std::cin >> a >> b;
    v[a].push_back(b);
    v[b].push_back(a);
  }


  find_max_k(n,k,dis);

}
