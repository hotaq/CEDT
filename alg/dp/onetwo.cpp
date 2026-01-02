#include <iostream>
#include <vector>

using namespace std;

int n;

void permua(int idx, vector<int> z, vector<vector<int>> &v) {
    if (idx == n) {
        v.push_back(z);
        return;
    }

    z[idx] = 0;
    permua(idx + 1, z, v);

    bool ok = true;
    if (idx - 1 >= 0 && z[idx - 1] == 2) ok = false;
    if (idx - 2 >= 0 && z[idx - 2] == 2) ok = false;

    if (ok) {
        z[idx] = 1;
        permua(idx + 1, z, v);
    }

    ok = true;
    if (idx - 1 >= 0 && z[idx - 1] == 1) ok = false;
    if (idx - 2 >= 0 && z[idx - 2] == 1) ok = false;

    if (ok) {
        z[idx] = 2;
        permua(idx + 1, z, v);
    }
}

int main() {
    cin >> n;
    vector<int> z(n, 0);
    vector<vector<int>> v;
    long long cnt = 0, m = 100000007;

    permua(0, z, v);

    for (auto &row : v) {
       
        cnt++;
    }
    cout << cnt % m;
    return 0;
}

3 7 15 33


a[i] = (a[i-1]*2)%m + a[i-3]%m