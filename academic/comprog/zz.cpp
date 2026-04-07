#include<iostream>
#include<map>
using namespace std;

int main(){
    string a;
    int b;
    double total =0.0;
    map<string,double> zz;
    map<string,double> zz1;
    map<string,int> zz_score;
    while(cin >> a){
        if(a=="END"){
            break;
        }
        // cin.ignore();
        cin >> b;
        zz[a] = b;
        zz_score[a]=b;
        total +=b;

    }
    int human =0;
    //tuple<string,int,double> final_zz;
    for(auto &s:zz){
        // cout << s.first << " " << s.second << endl;
        s.second/=(total/100);
        // cout << s.first << " " << floor(s.second) << endl;
       // cout << s.second - floor(s.second)  << endl;
        zz1[s.first] = s.second - floor(s.second);
        human+=floor(s.second);

    }
   

    vector<pair<string,double>> sorted(zz1.begin(), zz1.end());
    sort(sorted.begin(), sorted.end(),
         [](auto &a, auto &b){
             return a.second > b.second;
         });
    int idx=0;
    while(human!=100){
        zz[sorted[idx].first]++;
        human++;
        idx++;
    }
    vector<pair<string,double>> sorted1(zz.begin(), zz.end());
    sort(sorted1.begin(), sorted1.end(),
         [](auto &a, auto &b){
             return a.second > b.second;
         });
   for(auto &s : sorted1){
        if(floor(s.second)>0){
           cout << s.first << " "  << floor(s.second) << " "  << zz_score[s.first] << endl;
        }
    }    
}
    // while(human!=100){

    // }
