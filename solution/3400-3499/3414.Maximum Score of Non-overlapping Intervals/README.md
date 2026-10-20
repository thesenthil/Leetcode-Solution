class Solution {
public:
    using ll = long long;

    struct Node {
        ll score;
        vector<int> indices;
    };

    vector<vector<int>> intervals;
    vector<int> starts;
    vector<vector<Node>> dp;

    bool better(const Node& a, const Node& b) {
        if (a.score != b.score)
            return a.score > b.score;

        return a.indices < b.indices;
    }

    int findNext(int r) {
        int l = 0;
        int h = starts.size();

        while (l < h) {
            int mid = l + (h - l) / 2;

            if (starts[mid] > r)
                h = mid;
            else
                l = mid + 1;
        }

        return l;
    }

    Node solve(int i, int k) {

        if (i >= intervals.size() || k == 0)
            return {0, {}};

        if (dp[i][k].score != -1)
            return dp[i][k];

        // Don't take current interval
        Node skip = solve(i + 1, k);

        // Take current interval
        int next = findNext(intervals[i][1]);

        Node take = solve(next, k - 1);

        take.score += intervals[i][2];
        take.indices.push_back(intervals[i][3]);

        sort(take.indices.begin(), take.indices.end());

        if (better(take, skip))
            dp[i][k] = take;
        else
            dp[i][k] = skip;

        return dp[i][k];
    }

    vector<int> maximumWeight(vector<vector<int>>& arr) {

        int n = arr.size();

        intervals.clear();

        for (int i = 0; i < n; i++) {
            intervals.push_back({
                arr[i][0],
                arr[i][1],
                arr[i][2],
                i
            });
        }

        sort(intervals.begin(), intervals.end());

        starts.resize(n);

        for (int i = 0; i < n; i++) {
            starts[i] = intervals[i][0];
        }

        dp.assign(n, vector<Node>(5, {-1, {}}));

        Node ans = solve(0, 4);

        return ans.indices;
    }
};