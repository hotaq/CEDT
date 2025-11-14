#include<iostream>

#include<queue>
using namespace std;

int  main(){
    int n,a,cnt;cin >> n >> a;

    queue<int> save;
    vector<int> v;
    save.push(a);
    while(!save.empty()){
        int heade = save.front(); save.pop();
        v.push_back(heade);
        if(heade*2+1 < n) save.push(heade*2+1);
        if(heade*2+2 < n) save.push(heade*2+2);

    }
    cout << v.size() << " " << endl;
    for(auto s:v){
        cout << s << " ";
    }


}

