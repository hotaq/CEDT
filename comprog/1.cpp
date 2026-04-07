#include<iostream>

#include<map>
using namespace std;

int main(){
    int n;cin >>n;
    map<string,string> grade;
    for(int i =0;i<n;i++){
        string a,b;
        cin >> a >> b;
        grade[a] =b;
    }

    
    string z;
    while(cin >> z){
        if(z.find('+') != string::npos){
        //    cout << z.substr(0,z.find('+'));
        //    cout << endl;
        if(grade[z.substr(0,z.find('+'))] == "B+"){
            grade[z.substr(0,z.find('+'))] = "A";
        }else if(grade[z.substr(0,z.find('+'))] == "B"){
            grade[z.substr(0,z.find('+'))] = "B+";
        }else if(grade[z.substr(0,z.find('+'))] == "C+"){
            grade[z.substr(0,z.find('+'))] = "B";
        }else if(grade[z.substr(0,z.find('+'))] == "C"){
            grade[z.substr(0,z.find('+'))] = "C+";
        }
        else if(grade[z.substr(0,z.find('+'))] == "D+"){
            grade[z.substr(0,z.find('+'))] = "C";
        }else if(grade[z.substr(0,z.find('+'))] == "D"){
            grade[z.substr(0,z.find('+'))] = "D+";
        }
        else if(grade[z.substr(0,z.find('+'))] == "F"){
            grade[z.substr(0,z.find('+'))] = "D";
        }

        }
       
     

    }
    vector<pair<string,string>> sorted(grade.begin(),grade.end());
    sort(sorted.begin(),sorted.end(),[](const pair<string,string> &a, const pair<string,string> &b){
        if(a.second == "B+") return a.second < b.second;
        return a.second < b.second;
    });
    for(auto s:sorted){
        cout << s.first << " " << s.second << endl;
       
    }


   

}