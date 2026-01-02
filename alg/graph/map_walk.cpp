#include <iostream>
#include <vector>

using namespace std;

int r, c;
int arr[1001][1001];
bool used[1001][1001];
string text = "";

void dfs(int x, int y) {

    if (arr[x][y] == 1) return;

    if (x == r - 1 && y == c - 1) {
        cout << text << "\n";
        return;
    }

    used[x][y] = true;

    if (y + 1 < c && !used[x][y + 1]) {
        text.push_back('A');
        dfs(x, y + 1);
        text.pop_back();
    }

    if (x + 1 < r && !used[x + 1][y]) {
        text.push_back('B');
        dfs(x + 1, y);
        text.pop_back();
    }

    if (x - 1 >= 0 && !used[x - 1][y]) {
        text.push_back('C');
        dfs(x - 1, y);
        text.pop_back();
    }

    used[x][y] = false;
}

int main() {
    cin >> r >> c;

    for (int i = 0; i < r; i++) {
        for (int j = 0; j < c; j++) {
            cin >> arr[i][j];
        }
    }

    dfs(0, 0);
    cout << "DONE";
}
