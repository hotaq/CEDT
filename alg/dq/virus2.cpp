#include <iostream>
#include <iterator>
#include <string>
#include <vector>
#include<algorithm>
#include <cmath>
using namespace std;

int count_one(vector<int> v){
    int cnt = 0;
    for(int i =0;i<v.size();i++){
        if(v[i] ==1){
            cnt++;
        }
    }
    return cnt;
}

bool recur(vector<int> virus,int k){
    
    if(k==1){
        bool result = (virus.size() == 2 && ((virus[0] == 0 && virus[1] == 1) || (virus[0] == 1 && virus[1] == 1) || (virus[0] == 1 && virus[1] == 0) || (virus[0] == 0 && virus[1] == 0)));
        return result;

    }

    
    bool result = false;
    int mid = (virus.size()/2);
    vector<int> left(virus.begin(),virus.end()-mid);
    vector<int> right(virus.begin()+mid,virus.end());
    int check = count_one(left) - count_one(right);
    if(check < 0){
        check = -check;
    }
    
    if(recur(left,k-1) && recur(right,k-1) && check <=1){
        result =  true;
        //cout << check;
        //cout << count_one(left);
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
        //cout << count_one(z);
        if(result)
            cout << "yes" << endl;
        else
            cout << "no" << endl;
    }


}
