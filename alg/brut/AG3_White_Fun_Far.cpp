#include <algorithm>
#include <iostream>
#include <map>
#include <string>
#include <vector>

using namespace std;

map<char, vector<char>> allow_after;
vector<bool> vis(4, false);
vector<string> ans;
string text;
string main_text = "CEDT";
int n;

bool follow(char prev, char next) {
    for (char c : allow_after[prev])
        if (c == next) return true;
    return false;
}

void permu(int idx) {
    if (idx == n) {
        ans.push_back(text);
        return;
    }

    for (int i = 0; i < 4; i++) {

        

        vis[i] = true;
        text.push_back(main_text[i]);

        permu(idx + 1);

        text.pop_back();
        vis[i] = false;
    }
}

int main(){
    cin >> n;

    allow_after['C'] = {'E', 'T'};
    allow_after['E'] = {'D'};
    allow_after['D'] = {'C'};
    allow_after['T'] = {'C', 'E'};

    permu(0);

    cout << ans.size() << "\n";
    for(auto s:ans){
        cout << s << "\n";
    }

}
