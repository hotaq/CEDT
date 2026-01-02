#include<iostream>
#include<string>

#include<algorithm>

using namespace std;

int n,k;
string text;
void gen(int pos, int left){
    if(pos==k){
        if(left==0){
            cout << text  << "\n";;
        }
        return;

    } 
    
    text[pos] = '0';
    gen(pos+1,left);
    if(left>0){
        text[pos] = '1';
        gen(pos+1,left-1);
    }

    
   
    

}


int main(){
    cin >> n >> k;
    text.assign(k, '0');

    gen(0,n);
    return 0;

}