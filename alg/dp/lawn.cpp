#include <iostream>
#include <vector>

using namespace std;


int main(){
    ios_base::sync_with_stdio(false);cin.tie(NULL);
    int n,m,k;
    
    cin >> n >> m >> k;
    vector<int> v(n);
    vector<int> grass(n);
    for(int i =0;i<n;i++){
      cin >> v[i];
      grass[i] = v[i];
      v[i] += k;
      
      //grass[i] += grass[i];
    }
    for(int i =1;i<v.size();i++){
        v[i] += v[i-1];
        grass[i] += grass[i-1];
    } 
    

   
   
   
    for(int i =0;i<m;i++){
        long long a,b;
        cin >> a  >> b;
        if(a!=0){
            b+=v[a-1];
        }
        
        
        auto idx = lower_bound(v.begin(),v.end(),b);
        int z = idx-v.begin();
        if(v[z] != b){
            z--;
        }
        if(z<0){
            cout << 0 << '\n';
            continue;
            
        }

        cout << grass[z]-grass[a-1] << " " << "\n";



        
       // cout << z << " ";




        
        //cout << *idx << " ";
        

         
       
    }
    

    



    
    cout << "\n";
   

}
