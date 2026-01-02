#include<iostream>
#include<string>
#include<vector>
using namespace std;


vector<string> save;
string text;
int n,k;


bool check(string &as){
    int count = 0;
    for(char c:as){
        if(c=='1'){
            count+=1;
            if(count>=k){
                return true;
            }
        }else {
            count = 0;
        }
    }
    return false;
}


void permu(int pos){
    if(pos == n){
        save.push_back(text);
        return;
    }
    text[pos] = '0';
    permu(pos+1);
    text[pos] = '1';
    permu(pos+1);
}


int main(){
    cin >> n >> k;
    text.assign(n,'0');
    permu(0);
    for(auto &s:save){
        if(check(s)) cout << s << "\n";

    }

   
}