#include <iostream>
#include <vector>

using namespace std;
int n;
#define MODBY 100000007
long long count1;
int sperm(int r,int c, vector<vector<int>> &v){
    if(c < n){
        int next_r = r+1;
        int next_c = c;

        if(next_r ==2 ){
            next_r = 0;
            next_c = c+1;
        }

        v[r][c] = 0;
        sperm(next_r,next_c,v);

        if((c == 0 && ((r == 0) || (r == 1 && v[0][0] == 0))) ||
                  (r == 0 && v[r][c-1] == 0) ||
                  (v[r][c-1] == 0 && v[r-1][c] == 0) ) {
            v[r][c] = 1;
            sperm(next_r,next_c,v);
    }else {
        count1 += 1;
        if(count1 == MODBY) count1 = 0;

    }


}


int main() {
  cin >> n;
  vector<vector<int>> v;
  v.resize(2);
  v[0].resize(n);
  v[1].resize(n);
  sperm(0,0,v);
  cout << count1 << "\n";
}
