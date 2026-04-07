#include<iostream>

using namespace std;

int main(){
    int n;
    cin >> n;
    int arr[n][n];
    for(int i =0;i<n;i++){
        for(int j=0;j<n;j++){
           int a;
           cin >> a;
           arr[i][j] = a;
        }
    }
    int br=0,bc=0;
    int totalA=0;
    int totalB=0;
    int colid=0;
    int cmd;cin >> cmd;
    for(int i =0;i<n*n;i++){
       int ar = i/n;    
       int ac;
       if(ar%2==0){
            ac = i % n;
       }else {
            ac = n-1 - (i%n);
       }
       int valueA = arr[ar][ac];
       int valueB = arr[br][bc];

       if(i%2==0){
        totalA-=valueA;
       }else {
        totalA+=valueA;
       }

       bool colis = (ar==br && ac==bc);
       if(!colis){
        if(valueB%2==0){
            totalB+=valueB;

        }else {
            totalB-=valueB;
        }
       }else {
        colid++;
       }
       int nr,nc;
       if(valueB%2==0){
            nr = ((br+valueB)%n + n)%n;
            nc = ((bc + valueB + 1) % n + n) % n ;
       }else {
            nr = ((br+valueB)%n + n)%n;
            nc = ((bc - valueB - 1) % n + n) % n ;
       }

       br = nr;
       bc= nc;
       
    }
    if(cmd==2){
        cout << colid;
    }
    
}