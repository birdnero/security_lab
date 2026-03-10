#include <bits/stdc++.h>

#include <cmath>
#include <functional>
#include <string>
#include <unordered_set>
#include <vector>
typedef long long ll;
typedef long double number;
typedef std::pair<ll, ll> pll;
#define pin push_back
using namespace std;

ll gcd_euclid(ll a, ll b) {
    a = llabs(a);
    b = llabs(b);
    while (b != 0) {
        ll r = a % b;
        a = b;
        b = r;
    }
    return a;
}

vector<ll> gen(ll X0, int n, ll m, ll a, ll c) {
    vector<ll> X{X0};
    for (int i = 0; i < n; i++) X.pin((a * X.back() + c) % m);
    return {X.begin() + 1, X.end()};
}

number Chizaru(int n, const function<vector<ll>(int)>& genFn) {
    ll t = 0, f = 0;
    auto X = genFn(2 * n);
    for (int i = 0; i < X.size(); i += 2)
        if (gcd_euclid(X[i], X[i + 1]) == 1 || (f++, 0)) t++;
    return sqrt((6.0 * (t + f)) / t);
}

pll test01amount(int n, const function<vector<ll>(int)>& genFn) {
    pll acc(0, 0);
    for (auto Xi : genFn(n)) {
        if (Xi == 0) {
            acc.first++;
        } else {
            while (Xi > 0) {
                if (Xi % 2 == 0)
                    acc.first++;
                else
                    acc.second++;
                Xi /= 2;
            }
        }
    }
    return acc;
}

void compare_with_builtin(ll X0, int n, const function<vector<ll>(int)>& genFn) {
    pll res = test01amount(n, genFn);

    auto estimate_view = [](pll& res) {
        return "0=" + to_string(res.first) + " 1=" + to_string(res.second) + " %=" + to_string(res.first / max(1e-6, (double)res.second)) + "\n";
    };
    cout << "zeros equlas ones test: " << estimate_view(res);

    srand(X0);
    auto builtinRandGen = [](int n) {
        vector<ll> vals(0);
        for (int i = 0; i < n; i++) vals.pin(rand());
        return vals;
    };
    pll builtinRes = test01amount(n, builtinRandGen);
    cout << "zeros equlas ones test (builtin rand): " << estimate_view(builtinRes);
}

int main() {
    ll X0 = 13, m = 67108865, a = 2197, c = 1597, acc = 0;
    int n;
    cout << "enter amount: ";
    cin >> n;

    vector<ll> X = gen(X0, n, m, a, c);
    unordered_set<ll> collector;

    cout << "Random numbers: ";
    ofstream out("random.txt");
    for (auto& Xi : X) cout << Xi << " compare with actual=", out << Xi << " ";
    cout << "\n", out.close();

    // statical pi eval
    auto genFn = [=](int n) { return gen(X0, n, m, a, c); };
    auto ChizaruPI = Chizaru(100000, genFn);
    cout << "Chizaru test: " << ChizaruPI << " in compare=" << abs(ChizaruPI - M_PI) << "\n";

    // test period
    ll prev = X0;
    while (1) {
        auto Xi = gen(prev, 1, m, a, c);
        if (collector.count(Xi.back()))
            break;
        else
            acc++, collector.insert(Xi.back());
        prev = Xi.back();
    }
    cout << "Sequence test: " << acc << "\n";

    compare_with_builtin(X0, n, genFn);

    return 0;
}
