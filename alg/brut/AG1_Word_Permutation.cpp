#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

vector<string> ans;
string text;
string a;

void dfs(int idx, int n, vector<bool>& check) {
    if (idx == n) {
        ans.push_back(text);
        return;
    }

    for (int i = 0; i < n; i++) {
        if (check[i]) continue;


        if (i > 0 && a[i] == a[i - 1] && !check[i - 1]) continue;

        check[i] = true;
        text.push_back(a[i]);

        dfs(idx + 1, n, check);

        text.pop_back();
        check[i] = false;
    }
}

int main() {
    cin >> a;
    sort(a.begin(), a.end());
    vector<bool> check(a.size(), false);

    dfs(0, a.size(), check);

    cout << ans.size() << "\n";
    for (auto& s : ans) cout << s << "\n";
}
