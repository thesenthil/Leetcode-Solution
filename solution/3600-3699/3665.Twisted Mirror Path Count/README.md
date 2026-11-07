 class Solution {
public:
    static constexpr int MOD = 1'000'000'007;
    static constexpr int INVALID = -1;

    int m, n;
    vector<vector<int>> &grid;

    // memo[i][j][dir]:
    // Resolved destination when entering (i, j) in direction dir.
    // dir = 0: moving right
    // dir = 1: moving down
    vector<vector<array<int, 2>>> memo;

    Solution() : grid(*new vector<vector<int>>()) {}

    int resolve(int i, int j, int dir) {
        // Out of bounds => invalid path
        if (i >= m || j >= n)
            return INVALID;

        // Reached an empty cell
        if (grid[i][j] == 0)
            return i * n + j;

        // Already resolved this mirror state
        if (memo[i][j][dir] != -2)
            return memo[i][j][dir];

        int ni, nj, ndir;

        if (dir == 0) {
            // Entered mirror moving right => reflect down
            ni = i + 1;
            nj = j;
            ndir = 1;
        } else {
            // Entered mirror moving down => reflect right
            ni = i;
            nj = j + 1;
            ndir = 0;
        }

        return memo[i][j][dir] = resolve(ni, nj, ndir);
    }

    int uniquePaths(vector<vector<int>>& input) {
        grid = input;
        m = grid.size();
        n = grid[0].size();

        memo.assign(m, vector<array<int, 2>>(n));
        for (auto &row : memo)
            for (auto &cell : row)
                cell = {-2, -2};

        vector<vector<int>> dp(m, vector<int>(n, 0));
        dp[0][0] = 1;

        for (int i = 0; i < m; i++) {
            for (int j = 0; j < n; j++) {
                if (grid[i][j] == 1 || dp[i][j] == 0)
                    continue;

                // Try moving right
                int dest = resolve(i, j + 1, 0);
                if (dest != INVALID) {
                    int r = dest / n;
                    int c = dest % n;
                    dp[r][c] = (dp[r][c] + dp[i][j]) % MOD;
                }

                // Try moving down
                dest = resolve(i + 1, j, 1);
                if (dest != INVALID) {
                    int r = dest / n;
                    int c = dest % n;
                    dp[r][c] = (dp[r][c] + dp[i][j]) % MOD;
                }
            }
        }

        return dp[m - 1][n - 1];
    }
};