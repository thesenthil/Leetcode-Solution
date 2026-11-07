class Solution {
public:
    using ll = long long;

    class MedianWindow {
        multiset<int> left, right;
        ll leftSum = 0, rightSum = 0;

        void rebalance() {
            int target = (left.size() + right.size() + 1) / 2;

            while (left.size() > target) {
                int val = *left.rbegin();
                left.erase(prev(left.end()));
                leftSum -= val;

                right.insert(val);
                rightSum += val;
            }

            while (left.size() < target) {
                int val = *right.begin();
                right.erase(right.begin());
                rightSum -= val;

                left.insert(val);
                leftSum += val;
            }
        }

    public:
        void add(int val) {
            if (left.empty() || val <= *left.rbegin()) {
                left.insert(val);
                leftSum += val;
            } else {
                right.insert(val);
                rightSum += val;
            }

            rebalance();
        }

        void remove(int val) {
            auto it = left.find(val);

            if (it != left.end()) {
                left.erase(it);
                leftSum -= val;
            } else {
                it = right.find(val);
                right.erase(it);
                rightSum -= val;
            }

            rebalance();
        }

        ll getCost() {
            ll median = *left.rbegin();

            return median * (ll)left.size() - leftSum
                 + rightSum - median * (ll)right.size();
        }
    };

    long long minOperations(vector<int>& nums, int x, int k) {
        int n = nums.size();
        int m = n - x + 1;

        vector<ll> cost(m);
        MedianWindow window;

        for (int i = 0; i < x; i++) {
            window.add(nums[i]);
        }

        cost[0] = window.getCost();

        for (int i = x; i < n; i++) {
            window.remove(nums[i - x]);
            window.add(nums[i]);
            cost[i - x + 1] = window.getCost();
        }

        const ll INF = LLONG_MAX / 4;

        vector<ll> prev(n + 1, 0), curr(n + 1, INF);

        for (int j = 1; j <= k; j++) {
            fill(curr.begin(), curr.end(), INF);

            for (int i = 1; i <= n; i++) {
                // Skip the current element.
                curr[i] = curr[i - 1];

                // Select a subarray of length x ending at i - 1.
                if (i >= x && prev[i - x] != INF) {
                    curr[i] = min(
                        curr[i],
                        prev[i - x] + cost[i - x]
                    );
                }
            }

            prev.swap(curr);
        }

        return prev[n];
    }
};