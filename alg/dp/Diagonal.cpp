#include <iostream>
#include <vector>

using namespace std;


int main(){
    int n;
    cin >> n;
    vector<vector<int>> v(2*n);
    for(int i =0;i<n;i++){
        for(int j=0;j<n;j++){
            int x;
            cin >> x;
            v[i-j+n].push_back(x);
            //v[i+j+n-1].push_back(x);

        }
    }
    int max2 =0 ;
    for(int i =0;i<(2*n-1);i++){
        int sum=0,max1=0;
        for(auto x:v[i]){
            sum+=x;
            if(sum > max1){
                max1=sum;
            }
            if(sum<0){
                sum=0;
            }
        }
        if(max1>max2){
            max2=max1;
        }
    }

    
    cout << max2;
}
