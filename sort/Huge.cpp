#include <iostream>
#include <iterator>
#include <utility>
#include <vector>
#include <set>
using namespace std;

void bubbleSort(vector<int>& arr) {
    int n = arr.size();
    bool swapped;

    for (int i = 0; i < n - 1; i++) {
        swapped = false;
        for (int j = 0; j < n - i - 1; j++) {
            if (arr[j] > arr[j + 1]) {
                swap(arr[j], arr[j + 1]);
                swapped = true;
            }
        }

        // If no two elements were swapped, then break
        if (!swapped)
            break;
    }
}



int main(){
    std::ios_base::sync_with_stdio(false); std::cin.tie(0);
    int n,q;
    vector<int> v;
    //set<int> new_v;
    vector<int> check;
    cin >>n >> q;
    for(int i=0;i<n;i++){
        int a,b;
        cin >> a >> b;
        while(b--){
            v.push_back(a);
        }
    }
    for(int i =0;i<q;i++){
        int a;cin>>a;
        check.push_back(a);
    }
    bubbleSort(v);

    for(auto s:v){
        cout << s << " ";
    }
    cout << "\n";


    for(int i =0;i<q;i++){
        cout << v[check[i]-1] << "\n";
    }
}
