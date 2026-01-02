#include <algorithm>
#include <climits>
#include <cmath>
#include <functional>
#include <iostream>
#include <queue>
#include <utility>
#include <vector>

#define pii pair<unsigned long long,int>
using namespace std;

int main(){
   int n;
   cin >> n;
   vector<vector<unsigned long long>> g(n,vector<unsigned long long>(n));
   vector<unsigned long long> node(n);

   for(int i = 0; i < n; i++) cin >> node[i];

   for(int i = 0; i < n; i++){
       for(int j = 0; j < n; j++){
           if(i != j){
               g[i][j] = node[i] ^ node[j];
           }
       }
   }

   unsigned long long total_max = 0;
   int cnt = 0;

   priority_queue<pii, vector<pii>> h;
   vector<bool> used(n, false);
   vector<unsigned long long> beuty(n, 0);

   h.push({0, 0});

   while(!h.empty()){
       auto [cost, node] = h.top();
       h.pop();

       if(used[node]) continue;

       used[node] = true;
       total_max += cost;
       cnt++;

       if(cnt == n){
           cout << total_max;
           return 0;
       }

       for(int i = 0; i < n; i++){

           if(!used[i] && beuty[i] < g[node][i]){
               beuty[i] = g[node][i];
               h.push({g[node][i], i});
           }
       }
   }
}
