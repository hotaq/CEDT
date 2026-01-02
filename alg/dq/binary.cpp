#include<iostream>
#include<vector>
#
using namespace std;

int recur(vector<int> v,int k){
    int left = 0;
    int right = v.size()-1;
    int result = -1;
    while(left<=right){
        int mid = left + (right-left)/2;
        if(v[mid] <= k){
            result = v[mid];
            left = mid+1;
        }
        else{
            right = mid-1;
        }
    }
    return left-1;
}


int main(){
    int n,m;
    cin >> n >> m;
    vector<int> v(n);
    vector<int> z(m);
    int mid = v.size()/2;
    sort(v.begin(),v.end());
    for(int i =0;i<n;i++){
        cin >> v[i];
    }

    for(int i =0;i<m;i++){
        cin >> z[i];
    }


    for(int i =0;i<z.size();i++){
        cout << recur(v,z[i]) << '\n';
    }


}
