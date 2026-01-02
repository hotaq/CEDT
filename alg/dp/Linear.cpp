#include <iostream>
#include <vector>


using namespace std;



int main(){
    int k,m;cin >> k >> m;
    vector<int> c(100001);
    vector<int> a(100001);
    vector<int> ans(m+1);
    for(int i =0;i<k;i++) cin >> c[i];
    for(int i =0;i<k;i++) cin >> a[i];
    for(int i =0;i<k && i <= m;i++){
        ans[i] = a[i]%32717;
    }

    for(int i =k;i<=m;i++){
        long long sum =0 ;
        for(int j=1;j<=k;j++){
            sum += (ans[i-j] * c[j-1])%32717;

        }
        ans[i] = sum;


    }
    cout << ans[m] %32717;

}
