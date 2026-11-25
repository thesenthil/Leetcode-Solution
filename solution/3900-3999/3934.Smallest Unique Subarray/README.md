class Solution {
public:
    int n;
    long long base = 19;
    long long mod = 1e9 + 7;

    vector<long long> power;

    bool check(vector<int>& nums, int len) {
        unordered_map<long long, int> mp;

        long long hash = 0;

        // Calculate hash of first window
        for (int i = 0; i < len; i++) {
            hash = (hash * base + nums[i]) % mod;
        }

        mp[hash]++;

        // Calculate hashes of remaining windows
        for (int i = len; i < n; i++) {

            hash = (hash - power[len - 1] * nums[i - len] % mod + mod) % mod;

            hash = (hash * base + nums[i]) % mod;

            mp[hash]++;
        }

        // Check if any subarray occurs exactly once
        for (auto& it : mp) {
            if (it.second == 1) {
                return true;
            }
        }

        return false;
    }

    int smallestUniqueSubarray(vector<int>& nums) {
        n = nums.size();

        power.resize(n + 1);
        power[0] = 1;

        for (int i = 1; i <= n; i++) {
            power[i] = (power[i - 1] * base) % mod;
        }

        int low = 1;
        int high = n;
        int ans = n;

        while (low <= high) {

            int mid = low + (high - low) / 2;

            if (check(nums, mid)) {
                ans = mid;
                high = mid - 1;
            }
            else {
                low = mid + 1;
            }
        }

        return ans;
    }
};
