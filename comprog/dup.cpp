#include<iostream>
#include<map>
using namespace std;

int main(){
    int n;
    vector<int> num;
    while(cin >> n){
        num.push_back(n);
    }
   int start = 0;
   int max_range =1;
   vector<tuple<int,int,int>> range;
   for(int i =1;i<num.size();i++){
        if(num[i]!=num[i-1]){
            if(i-start >=max_range){
                max_range = i-start;
                
            }
            start = i;

        }
   }
    for(int i =1;i<num.size();i++){
        if(num[i]!=num[i-1]){
            if(i-start == max_range){
                range.push_back({num[i-1],start,i});
                
            }
            start = i;

        }
   }
   sort(range.begin(),range.end());
   for(auto s:range){
    cout << get<0>(s) << " --> x[ ";
    cout << get<1>(s) << " : ";
     cout << get<2>(s) << " ] ";
     cout << endl;

   }
    
    
}
