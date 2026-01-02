#include<iostream>
using namespace std;

int r, c;
string text;
int path[1001][1001];
bool used[1001][1001];

void dfs(int arr[][1001], int x, int y, int step){
    if(arr[x][y] == 1) return;

    if(x == r-1 && y == c-1){
        cout << text.substr(0, step) << '\n';
        return;
    }

    used[x][y] = true;

   
// A = right
if (y+1 < c && !used[x][y+1])  {
    text[step] = 'A';
    dfs(arr, x, y+1, step+1);
}

// B = down
if (x+1 < r && !used[x+1][y])  {
    text[step] = 'B';
    dfs(arr, x+1, y, step+1);
}

// C = up
if (x-1 >= 0 && !used[x-1][y])  {
    text[step] = 'C';
    dfs(arr, x-1, y, step+1);
}

    used[x][y] = false;
}

int main(){
    cin >> r >> c;
    text.resize(r * c);

    for(int i = 0; i < r; i++){
        for(int j = 0; j < c; j++){
            cin >> path[i][j];
        }
    }

    dfs(path, 0, 0, 0);
    cout << "DONE\n";
}
