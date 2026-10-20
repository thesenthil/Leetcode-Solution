class Solution {
public:
    int sortableIntegers(vector<int>& nums) {
        int n = nums.size();
        vector<int> sorted = nums;
        sort(sorted.begin(), sorted.end());

        int ans = 0;

        for (int k = 1; k <= n; k++) {
            if (n % k != 0) continue;

            bool valid = true;

            for (int start = 0; start < n && valid; start += k) {
                int descents = 0;

                for (int j = 0; j < k; j++) {
                    int cur = nums[start + j];
                    int nxt = nums[start + (j + 1) % k];

                    if (cur > nxt) descents++;
                }

                if (descents > 1) {
                    valid = false;
                    break;
                }

                vector<int> block(nums.begin() + start,
                                  nums.begin() + start + k);

                vector<int> target(sorted.begin() + start,
                                   sorted.begin() + start + k);

                sort(block.begin(), block.end());
                sort(target.begin(), target.end());

                if (block != target) {
                    valid = false;
                }
            }

            if (valid) ans += k;
        }

        return ans;
    }
};