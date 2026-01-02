#include <ios>
#include <iostream>
#include <vector>

using namespace std;

void recursive(vector<vector<int>> &v,int a,int b,int top,int bottom,int left,int right){
    if(a ==0){
        v[top][left] = b;
        return;
    }

    int midrow = (top+bottom)/2;
    int midcol = (left+right)/2;

    recursive(v,a-1,b,top,midrow,left,midcol);

    recursive(v,a-1,b-1,top,midrow,midcol,right);

    recursive(v,a-1,b+1,midrow,bottom,left,midcol);

    recursive(v,a-1,b,midrow,bottom,midcol,right);

}


int main(){
    int a,b;
    cin >> a >> b;
    int size = 1 << a;
    vector<vector<int>> matrix(size,vector<int>(size));
    recursive(matrix,a,b,0,size,0,size);
    for(int i =0;i<matrix.size();i++){
        for(int j=0;j<matrix.size();j++){
            cout << matrix[i][j] << " ";
        }
        cout << "\n";
    }

}
