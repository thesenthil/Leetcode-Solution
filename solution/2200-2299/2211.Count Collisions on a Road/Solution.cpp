
class Solution {
public:
    int minimumChanges(string s, int k) {
        int n = s.size();
        const int INF = 1e9;

        // cost[i][j] = minimum changes to make s[i...j]
        // a semi-palindrome
        vector<vector<int>> cost(n, vector<int>(n, INF));

        // Precompute semi-palindrome conversion costs
        for (int i = 0; i < n; i++) {
            for (int len = 2; i + len <= n; len++) {

                int j = i + len - 1;
                int best = INF;

                // d must be a proper divisor of len
                for (int d = 1; d < len; d++) {
                    if (len % d != 0)
                        continue;

                    int changes = 0;

                    // Compare characters in each group
                    for (int r = 0; r < d; r++) {
                        int left = i + r;
                        int right = i + len - d + r;

                        while (left < right) {
                            if (s[left] != s[right])
                                changes++;

                            left += d;
                            right -= d;
                        }
                    }

                    best = min(best, changes);
                }

                cost[i][j] = best;
            }
        }

        // DP
        // dp[p][i] = minimum changes to partition
        // first i characters into p substrings

        vector<vector<int>> dp(k + 1,
                               vector<int>(n + 1, INF));

        dp[0][0] = 0;

        for (int p = 1; p <= k; p++) {
            for (int i = 2 * p; i <= n; i++) {

                // Last substring starts at j
                for (int j = 2 * (p - 1); j <= i - 2; j++) {

                    if (dp[p - 1][j] == INF)
                        continue;

                    dp[p][i] = min(
                        dp[p][i],
                        dp[p - 1][j] + cost[j][i - 1]
                    );
                }
            }
        }

        return dp[k][n];
    }
};
