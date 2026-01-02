#include <iostream>
#include <iterator>
#include <string>
#include <vector>
#include<algorithm>
#include <cmath>
using namespace std;

bool recur(vector<int> virus,int k){
    
    if(k==1){
        bool result = (virus.size() == 2 && virus[0] == 0 && virus[1] == 1);
        return result;

    }
    bool result = false;
    int mid = (virus.size()/2);
    vector<int> left(virus.begin(),virus.end()-mid);
    vector<int> right(virus.begin()+mid,virus.end());
    
    if(recur(left,k-1) && recur(right,k-1)){
        return true;
    }
    
   
    if(!result){
        vector<int> reversasasa(left.begin(),left.end());
        reverse(reversasasa.begin(),reversasasa.end());

        if(recur(reversasasa,k-1) && recur(right,k-1)){
            result = true;
        }
    }
    return result;
}


int main(){
    ios_base::sync_with_stdio(0);cin.tie(0);
    int n,k;
    cin >> n >> k;
    //vector<string> v(n);
    for(int i =0;i<n;i++){
        vector<int> z(pow(2,k));

        for(int j =0;j<pow(2,k);j++){
            int x;
            cin >> x;
            z[j] = x;
        }
        bool result = recur(z, k);

        if(result)
            cout << "yes" << endl;
        else
            cout << "no" << endl;
    }


}
