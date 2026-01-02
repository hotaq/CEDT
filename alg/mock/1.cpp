#include<iostream>
#include<map>
#include<set>
using namespace std;

int main(){
    ios_base::sync_with_stdio(0); cin.tie(0);
    map<string,set<string>> events;
    map<string,set<string>> temp;
    int n;
    cin >> n;
    for(int i =1;i<=n;i++){
        string x;
        cin >> x;
        if(x == "ADDEVENT"){
            string a;
            cin >> a;
            events[a];
        }else if(x == "REGISTER"){
            temp = events;
            string name,ev;
            cin >> name >> ev;
            events[name].insert(ev);
        }else if(x == "SHOW"){

            string name;
            cin >> name;
            for(auto s:events[name]){
                cout << s << " ";
            }
            cout << '\n';
        }else if(x == "CANCEL"){
            temp = events;
            string name,ev;
            cin >> name >> ev;
            if(!events[name].count(ev)) continue;
            events[name].erase(ev);

        }else if(x=="UNDO"){
            events = temp;

        }
        
    }
    
}
