#include<iostream>
#include <vector>

#include <map>
using namespace std;



int main(){
    int n;
    cin >> n;
    long long dp[10001];
    dp[0] = 3;
    dp[1] = 4;
    dp[2] = 6;
    dp[3] = 9;

    for(long long i =4;i<=n;i++){
        dp[i] = (dp[i-1] + dp[i-3])%100000007;
    }
    cout << dp[n];



}
