#include<iostream>
#include <vector>

#include <map>
using namespace std;

vector<string> result;
string current;
map<char,int> track;
int cnt=0;
int n;
void permu(){
    if(current.length() ==n){
        result.push_back(current);
        cnt++;

    }

    for(auto &s:track){
        char plus = s.first;
        int &count = s.second;

        if(count>0){
            count--;
            current.push_back(plus);
            permu();
            current.pop_back();
            count++;

        }

    }
}

int main(){
    string text;
    cin >> text;
    n = text.length();
    for(auto s:text){
        track[s]++;
    }

    permu();
    cout << cnt << "\n";
    for(auto text:result){
        cout << text << "\n";

    }


}
