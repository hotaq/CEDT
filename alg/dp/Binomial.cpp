#include <iostream>
#include <vector>


using namespace std;

int binomial(int n,int k ){
    if(n == k || k==0){
        return 1;
    }
    return binomial(n-1,k-1) +  binomial(n-1,k);


}


int main(){

    int n,k;cin>> n >> k;
    //vector<int> dp(1000001,-1);
    cout <<  binomial(n,k);

}
