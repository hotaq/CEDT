#include <iostream>
#include <vector>


using namespace std;
int n;
vector<string> ans;
vector<char> tmp;
string s;
void permu(int idx,int a,int b,int c){
    if(idx == n){
       for(auto z:tmp){
           s += z;
       }
       ans.push_back(s);
       s= "";
       return;
    }

    if(a>0){
        tmp.push_back('A');
        permu(idx+1,a-1,b,c);
        tmp.pop_back();
    }

    if(b>0){
        tmp.push_back('B');
        permu(idx+1, a, b-1, c);
        tmp.pop_back();
    }

    if(c>0){
        tmp.push_back('C');
        permu(idx+1,a,b, c-1);
        tmp.pop_back();
    }

}

int main(){
    int i,j,k;
    cin >> n >> i >> j >> k;

    permu(0, i, j, k);

    cout << ans.size() << "\n";
    for(auto s:ans){
        cout << s << "\n";
    }
}
