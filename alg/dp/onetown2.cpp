#include <iostream>

using namespace std;


long long arr[1000000001];


int main(){
    int n;
   
   // long long cnt=0;
    long long m = 100000007;
    cin >> n;
    //arr[0] = 1;
    arr[1] = 3;
    arr[2] = 7;
    arr[3] = 15;
    for(int i =4;i<=n;i++){
        long long l = ((arr[l-1]&m) * (2%m))%m;
        arr[i] = ((l%m) + arr[i-3]%m)%m;

    }
    cout << arr[n];

}
