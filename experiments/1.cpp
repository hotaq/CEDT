#include <iostream>
#include <climits>
using namespace std;

int main() {
    long long best = LLONG_MAX;
    int bestX = -1;

    for (int x = 0; x <= 200; x++) {
        long long z = 1LL*x*x*x - 8LL*x*x - 35LL*x + 150;
        if (z < best) {
            best = z;
            bestX = x;
        }
    }
    cout << bestX;

}