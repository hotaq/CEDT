#include <iostream>
#include <vector>


using namespace std;
int r,c;



int main(){
    cin >> r >> c;
    vector<vector<int>> g(r,vector<int>(c));
    for(int i =0;i<r;i++){
        for(int j=0;j<c;j++){
            cin >> g[i][j];
        }
    }

}
