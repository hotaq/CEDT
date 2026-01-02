#include <iostream>
#include <vector>

using namespace std;

int main(){
    int n,k;
    cin >> n >> k;
    vector<int> v(k);
    long long arr[n+1];
    for(int i =0;i<k;i++){
        int x;
        cin >>x;
        v.push_back(x);
    }
    sort(v.begin(),v.end());
    arr[0] = 1;
    for(int i=0;i<n;i++){
        long long sum=k;
        for(auto s:v){
            if(i<s){
                break;
            }
           sum = (sum%1000003 - arr[i-s]%1000003)%1000003;

        }
        arr[i] = sum;

    }
    cout << arr[n];
}
