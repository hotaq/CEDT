#include<iostream>
#include <vector>
#include<map>
using namespace std;
int main(){
    ios_base::sync_with_stdio(false); cin.tie(0);
    int n,m; cin >> n >>m;
    map<long long ,long long> parents;
    for(int i =0;i<n;i++){
        long long f,s;
        cin >> f >> s;
        parents[s] = f;

    }
  
  

    for(int i =0;i<m;i++){
       long long a,b;
       cin >> a >> b;
       if(a==b){
            cout << "NO\n";
            continue;

       }
       if(parents.find(b) == parents.end() || parents.find(a) == parents.end()){
            cout << "NO\n";
            continue;
       
       }

       if(parents.find(parents[b]) == parents.end() || parents.find(parents[a]) == parents.end()){
            cout << "NO\n";
            continue;

       }

       long long grandpaA = parents[parents[a]];
       long long grandpaB = parents[parents[b]];
       if(grandpaA == grandpaB){
        cout << "YES\n";


       
        }else {
            cout << "NO\n";
        }
}
}