#include<iostream>
#include<deque>

using namespace std;

int main(){
    int n,q;cin >> n >> q;
    deque<long long> arr;
    for(int i =0;i<n;i++){
        long long x;
        cin >> x;
        arr.emplace_back(x);

    }
    for(int i =0;i<q;i++){
        int x,y;
        cin >> x;
        if(x == 1){
            cin >> y;
            arr.emplace_back(y);
        }else if(x == 2){
            arr.pop_front();
        }else if(x == 3){
            arr.pop_back();
        }else if(x== 4){
            cin >> y;
            for(long long &s:arr){
                if(s<0){
                    s-=y;
                }else {
                    s+=y;   
                }
                

            }
        }else if(x == 5){
            cin >> y;
            auto itr = arr.begin();
            while(itr!=arr.end()){
                if(*itr < y){
                    itr = arr.erase(itr);
                }else {
                    itr++;
                }
            }

        }else if(x == 6){
            cin >> y;
            long long sum=0;
            int num_to_remove = min((int)y, (int)arr.size());
            for (int i = 0; i < num_to_remove; ++i) {
                sum += arr.back(); // อ่านค่าตัวสุดท้าย
                arr.pop_back();    // ลบตัวสุดท้ายออก
            }
            
            arr.push_front(sum);
            }
            
    }
    cout << arr.size() << " ";
    long long sum=0;
    for(auto s:arr){
        sum+=s;
    }
    cout << sum << " ";
}