#include<iostream>
#include<vector>
#include<algorithm>
using namespace std;

int main(){
    std::ios_base::sync_with_stdio(false); std::cin.tie(0); 
    int n,m,k;
    cin >> n >> m >>k;
    vector<int> v(n);
    vector<int> w(m);
    for(int i =0;i<n;i++) cin >> v[i];
    for(int i =0;i<m;i++) cin >> w[i];
    sort(v.begin(),v.end());
    for(auto it = w.begin(); it != w.end(); it++){
        int check = *it;
        int up = check+k, low = check - k;
        cout << upper_bound(v.begin(),v.end(),up) - lower_bound(v.begin(),v.end(),low) << " ";
    }

}

