
class Solution {
public:
    long long countNonDecreasingSubarrays(vector<int>& nums, int k) {
        int n = nums.size();
        const int LOG = 18;

        vector<int> nxt(n, n);
        stack<int> st;

        // Step 1: Next Greater Element
        for (int i = n - 1; i >= 0; i--) {
            while (!st.empty() && nums[st.top()] <= nums[i]) {
                st.pop();
            }

            if (!st.empty()) {
                nxt[i] = st.top();
            }

            st.push(i);
        }

        // Step 2: Binary lifting tables
        vector<vector<int>> up(LOG, vector<int>(n, n));
        vector<vector<long long>> sum(
            LOG, vector<long long>(n, 0)
        );

        for (int i = 0; i < n; i++) {
            up[0][i] = nxt[i];
            sum[0][i] = 1LL * (nxt[i] - i) * nums[i];
        }

        for (int j = 1; j < LOG; j++) {
            for (int i = 0; i < n; i++) {
                int mid = up[j - 1][i];

                if (mid < n) {
                    up[j][i] = up[j - 1][mid];
                    sum[j][i] =
                        sum[j - 1][i] + sum[j - 1][mid];
                } else {
                    up[j][i] = n;
                    sum[j][i] = sum[j - 1][i];
                }
            }
        }

        // Prefix sum of original array
        vector<long long> pref(n + 1, 0);

        for (int i = 0; i < n; i++) {
            pref[i + 1] = pref[i] + nums[i];
        }

        // Step 3: Calculate cost of [l, r]
        auto getCost = [&](int l, int r) -> long long {
            int cur = l;
            long long mxSum = 0;

            for (int j = LOG - 1; j >= 0; j--) {
                if (up[j][cur] <= r) {
                    mxSum += sum[j][cur];
                    cur = up[j][cur];
                }
            }

            mxSum += 1LL * (r - cur + 1) * nums[cur];

            long long originalSum = pref[r + 1] - pref[l];

            return mxSum - originalSum;
        };

        // Step 4: Binary search for each right endpoint
        long long ans = 0;

        for (int r = 0; r < n; r++) {
            int low = 0, high = r;
            int best = r + 1;

            while (low <= high) {
                int mid = low + (high - low) / 2;

                if (getCost(mid, r) <= k) {
                    best = mid;
                    high = mid - 1;
                } else {
                    low = mid + 1;
                }
            }

            ans += r - best + 1;
        }

        return ans;
    }
};
