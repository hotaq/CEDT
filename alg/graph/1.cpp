#include <algorithm>
#include <iostream>
#include <vector>

using namespace std;

int main(){
    int k;cin >> k;
    vector<int> v(k,0);

    for(int i =0;i<k;i++){
        for(int j=0;j<k;j++){
            int m;
            cin >> m;
            if(m==1){
                v[i]++;
            }
        }
    }

    int max_degree = *max_element(v.begin(),v.end());

    vector<int> count(max_degree+1,0);
    for(int i =0;i<k;i++){
        count[v[i]]++;
    }


    for(int i =0;i<max_degree+1;i++){
        cout << count[i];
        if(i < max_degree) cout << " ";
    }
    cout << endl;





}
