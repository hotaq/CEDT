#include <bits/stdc++.h>
using namespace std;

int n, m;
vector<vector<int>> need; 
vector<int> v;
vector<bool> used;

void permu(int step) {
    if (step == n) {
        for (auto &x : v) cout << x << " ";
        cout << "\n";
        return;
    }

    for (int i = 0; i < n; i++) {
        if (used[i]) continue;

        bool ok = true;
        for (int p : need[i]) {
            if (!used[p]) { ok = false; break; }
        }
        if (!ok) continue;

        used[i] = true;
        v[step] = i;
        permu(step + 1);
        used[i] = false;
    }
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    cin >> n >> m;
    need.assign(n, {});
    used.assign(n, false);
    v.resize(n);

    for (int i = 0; i < m; i++) {
        int a, b;
        cin >> a >> b;
        need[b].push_back(a);
    }

    permu(0);
    return 0;
}
