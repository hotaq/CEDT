#include <iostream>
#include <vector>

using namespace std;




int fibo(int n, vector<int> &dp){
    if(n==1 || n==0) return n;
    
    if(n>2) {
        if(dp[n] > 0){
            return dp[n];
        }
    }
    int v =  fibo(n-1,dp) + fibo(n-2,dp);
    dp[n] = v;
    return v;
    

}

int main(){
    int n;
    vector<int> dp(100000001,-1);
    cin >> n;
    cout << fibo(n,dp);
}
