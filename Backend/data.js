const mongoose = require('mongoose');
module.exports.problems = [
  {
    problemName: "Longest Subarray With Given Sum",
    CreatedBy: new mongoose.Types.ObjectId("68553d7003abcf50e9943518"),
    problemDescription: `You are given an array and a target integer K. Your task is to find the length of the longest contiguous subarray whose sum equals K. Return 0 if no such subarray exists.`,
    Constraints: ["1 <= n <= 10^5", "-10^9 <= array[i], K <= 10^9"],
    TestCases: [
      { input: "5 15\n1 2 3 7 5", output: "4" },
      { input: "3 10\n3 4 7", output: "0" },
      { input: "6 0\n0 0 0 0 0 0", output: "6" },
      { input: "5 -3\n1 -1 -1 -1 -1", output: "4" },
      { input: "1 5\n5", output: "1" },
      { input: "1 3\n5", output: "0" },
      { input: "10 6\n1 2 3 -2 2 1 1 -1 2 3", output: "6" },
      { input: "8 7\n4 1 1 1 2 3 1 1", output: "4" },
      { input: "4 5\n5 5 5 5", output: "1" },
      { input: "6 1000000000\n0 0 0 0 0 1000000000", output: "1" },
      { input: "6 -1000000000\n-1000000000 0 0 0 0 0", output: "1" },
      { input: "7 10\n1 2 3 4 5 6 7", output: "4" },
      { input: "3 6\n-1 2 7", output: "0" },
      { input: "7 3\n1 -1 2 3 -2 2 1", output: "6" },
      { input: "5 9\n2 2 2 2 1", output: "5" }
    ],
    difficulty: "difficult",
    topics: ["prefix sum", "hashing"],
    hints: [
      "Use a HashMap to store prefix sum → index.",
      "If (currentSum - K) exists in map, a subarray exists."
    ]
  },
  {
    problemName: "Count Distinct Elements in Every Window",
    CreatedBy: new mongoose.Types.ObjectId("68553d7003abcf50e9943518"),
    problemDescription: `You are given an array of integers and a number K. For each sliding window of size K, count the number of distinct elements in the window.`,
    Constraints: ["1 <= n <= 10^5", "1 <= K <= n", "1 <= array[i] <= 10^9"],
    TestCases: [
      { input: "7 4\n1 2 1 3 4 2 3", output: "3 4 4 3" },
      { input: "5 2\n4 1 1 2 3", output: "2 1 2 2" },
      { input: "1 1\n100", output: "1" },
      { input: "4 2\n1 1 1 1", output: "1 1 1" },
      { input: "5 3\n1 2 3 4 5", output: "3 3 3" },
      { input: "6 6\n1 2 2 3 3 4", output: "4" },
      { input: "7 3\n1 2 1 3 4 2 3", output: "2 3 3 3 3" },
      { input: "10 5\n1 2 3 4 5 1 2 3 4 5", output: "5 5 5 5 5 5" },
      { input: "6 3\n1 1 2 2 3 3", output: "2 2 2 2" },
      { input: "3 1\n9 8 7", output: "1 1 1" },
      { input: "8 4\n1 2 2 1 3 4 2 3", output: "2 3 3 4 4" },
      { input: "6 2\n1 2 1 2 1 2", output: "2 2 2 2 2" },
      { input: "9 3\n5 5 5 5 5 5 5 5 5", output: "1 1 1 1 1 1 1" },
      { input: "5 5\n1 2 3 4 5", output: "5" },
      { input: "7 4\n4 5 4 5 6 4 5", output: "2 3 3 3" }
    ],
    difficulty: "medium",
    topics: ["sliding window", "hashing"],
    hints: [
      "Use a frequency map to keep track of counts.",
      "Add new element to map, remove old as window moves."
    ]
  },
  {
    problemName: "Valid Parentheses",
    CreatedBy: new mongoose.Types.ObjectId("68553d7003abcf50e9943518"),
    problemDescription: `Given a string containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid. An input string is valid if:
1. Open brackets must be closed by the same type of brackets.
2. Open brackets must be closed in the correct order.`,
    Constraints: ["1 <= length <= 10^5"],
    TestCases: [
      { input: "()", output: "true" },
      { input: "()[]{}", output: "true" },
      { input: "(]", output: "false" },
      { input: "([)]", output: "false" },
      { input: "{[]}", output: "true" },
      { input: "{", output: "false" },
      { input: "]", output: "false" },
      { input: "({{{[]}}})", output: "true" },
      { input: "(((((((((())))))))))", output: "true" },
      { input: "((((((((((", output: "false" },
      { input: "}}}}}}}}}}", output: "false" },
      { input: "{[()()]}", output: "true" },
      { input: "{[(()]}", output: "false" },
      { input: "", output: "true" },
      { input: "[", output: "false" }
    ],
    difficulty: "easy",
    topics: ["stack"],
    hints: [
      "Use a stack to track open brackets.",
      "When a closing bracket appears, it must match the top of the stack."
    ]
  },
  {
    problemName: "Binary Search",
    CreatedBy: new mongoose.Types.ObjectId("68553d7003abcf50e9943518"),
    problemDescription: `You are given a sorted array and a target value. Use binary search to determine whether the value exists in the array. If it exists, return its index (0-based). Otherwise, return -1.`,
    Constraints: ["1 <= n <= 10^5", "-10^9 <= array[i], target <= 10^9"],
    TestCases: [
      { input: "5 3\n1 2 3 4 5", output: "2" },
      { input: "5 6\n1 2 3 4 5", output: "-1" },
      { input: "1 100\n100", output: "0" },
      { input: "1 50\n100", output: "-1" },
      { input: "10 7\n1 2 3 4 5 6 7 8 9 10", output: "6" },
      { input: "6 -3\n-10 -5 -3 0 1 3", output: "2" },
      { input: "6 -6\n-10 -5 -3 0 1 3", output: "-1" },
      { input: "7 1\n-1 0 1 2 3 4 5", output: "2" },
      { input: "7 0\n-1 0 1 2 3 4 5", output: "1" },
      { input: "7 5\n-1 0 1 2 3 4 5", output: "6" },
      { input: "2 3\n1 3", output: "1" },
      { input: "2 2\n1 3", output: "-1" },
      { input: "5 1\n1 3 5 7 9", output: "0" },
      { input: "5 9\n1 3 5 7 9", output: "4" },
      { input: "5 0\n1 3 5 7 9", output: "-1" }
    ],
    difficulty: "easy",
    topics: ["binary search"],
    hints: [
      "Use two pointers: low and high.",
      "Mid = (low + high) // 2. Narrow search based on mid value."
    ]
  },
  {
    problemName: "Detect Cycle in Directed Graph",
    CreatedBy: new mongoose.Types.ObjectId("68553d7003abcf50e9943518"),
    problemDescription: `Given a directed graph with N nodes and M edges, detect if there is a cycle. Return "true" if a cycle exists, otherwise "false".`,
    Constraints: ["1 <= N <= 10^4", "1 <= M <= 2*10^4"],
    TestCases: [
      { input: "4 4\n0 1\n1 2\n2 3\n3 1", output: "true" },
      { input: "3 2\n0 1\n1 2", output: "false" },
      { input: "5 0", output: "false" },
      { input: "1 0", output: "false" },
      { input: "2 2\n0 1\n1 0", output: "true" },
      { input: "4 3\n0 1\n1 2\n2 0", output: "true" },
      { input: "6 6\n0 1\n1 2\n2 3\n3 4\n4 5\n5 3", output: "true" },
      { input: "4 3\n0 1\n1 2\n2 3", output: "false" },
      { input: "3 3\n0 1\n1 2\n2 0", output: "true" },
      { input: "7 6\n0 1\n1 2\n3 4\n4 5\n5 6\n6 3", output: "true" },
      { input: "4 4\n0 1\n1 2\n2 3\n3 0", output: "true" },
      { input: "2 0", output: "false" },
      { input: "3 1\n0 1", output: "false" },
      { input: "3 2\n1 0\n0 2", output: "false" },
      { input: "5 5\n0 1\n1 2\n2 3\n3 4\n4 0", output: "true" }
    ],
    difficulty: "difficult",
    topics: ["dfs", "graph", "topological sort"],
    hints: [
      "Use DFS with visited + recursion stack.",
      "If a node is visited and also in recursion stack → cycle."
    ]
  },
  {
    problemName: "Longest Palindromic Substring",
    CreatedBy: "68556435485d33329e7af603",
    problemDescription: "Given a string s, return the longest palindromic substring in s. A palindrome is a string that reads the same forward and backward.",
    Constraints: [
      "1 <= s.length <= 1000",
      "s consists of only printable ASCII characters."
    ],
    difficulty: "medium",
    topics: ["strings", "dynamic programming", "two pointers"],
    hints: [
      "Try expanding around each character center.",
      "Dynamic programming can be used to store palindrome validity.",
      "Avoid checking all substrings — optimize."
    ],
    TestCases: [
      { input: "s = 'babad'", output: "'bab'", isPublic: true },
      { input: "s = 'cbbd'", output: "'bb'", isPublic: true },
      { input: "s = 'a'", output: "'a'", isPublic: true },
      { input: "s = 'ac'", output: "'a'" },
      { input: "s = 'abcda'", output: "'a'" },
      { input: "s = 'racecar'", output: "'racecar'" },
      { input: "s = 'banana'", output: "'anana'" },
      { input: "s = 'forgeeksskeegfor'", output: "'geeksskeeg'" },
      { input: "s = 'abcdefg'", output: "'a'" },
      { input: "s = ''", output: "''" },
      { input: "s = 'abcba'", output: "'abcba'" },
      { input: "s = 'abacdfgdcaba'", output: "'aba'" }
    ]
  },
  {
    problemName: "Merge Intervals",
    CreatedBy: "68556457485d33329e7af608",
    problemDescription: "Given an array of intervals where intervals[i] = [start_i, end_i], merge all overlapping intervals and return an array of the non-overlapping intervals that cover all the intervals in the input.",
    Constraints: [
      "1 <= intervals.length <= 10^4",
      "intervals[i].length == 2",
      "0 <= start_i <= end_i <= 10^4"
    ],
    difficulty: "medium",
    topics: ["sorting", "greedy", "intervals"],
    hints: [
      "Sort the intervals by start time.",
      "Merge while iterating by comparing with the last merged interval.",
      "Edge case: intervals touching but not overlapping."
    ],
    TestCases: [
      { input: "intervals = [[1,3],[2,6],[8,10],[15,18]]", output: "[[1,6],[8,10],[15,18]]", isPublic: true },
      { input: "intervals = [[1,4],[4,5]]", output: "[[1,5]]", isPublic: true },
      { input: "intervals = [[1,4],[0,2],[3,5]]", output: "[[0,5]]", isPublic: true },
      { input: "intervals = [[1,2],[3,4]]", output: "[[1,2],[3,4]]" },
      { input: "intervals = [[5,10],[6,8]]", output: "[[5,10]]" },
      { input: "intervals = [[1,4],[0,1]]", output: "[[0,4]]" },
      { input: "intervals = [[1,4],[2,3]]", output: "[[1,4]]" },
      { input: "intervals = [[1,10],[2,6],[3,5],[7,9]]", output: "[[1,10]]" },
      { input: "intervals = [[1,4],[5,6]]", output: "[[1,4],[5,6]]" },
      { input: "intervals = [[1,4],[2,3],[6,8]]", output: "[[1,4],[6,8]]" },
      { input: "intervals = [[1,10000]]", output: "[[1,10000]]" },
      { input: "intervals = [[1,3],[2,4],[5,7],[6,8]]", output: "[[1,4],[5,8]]" }
    ]
  },
  {
    problemName: "Top K Frequent Elements",
    CreatedBy: "68553d7003abcf50e9943518",
    problemDescription: "Given an integer array nums and an integer k, return the k most frequent elements.",
    Constraints: [
      "1 <= nums.length <= 10^5",
      "-10^4 <= nums[i] <= 10^4",
      "k is in the range [1, the number of unique elements in nums]"
    ],
    difficulty: "medium",
    topics: ["heap", "hashmap", "frequency count"],
    hints: [
      "Use a HashMap to count frequencies.",
      "Use a Heap or Bucket Sort for efficiency.",
      "Watch for ties in frequency."
    ],
    TestCases: [
      { input: "nums = [1,1,1,2,2,3], k = 2", output: "[1,2]", isPublic: true },
      { input: "nums = [1], k = 1", output: "[1]", isPublic: true },
      { input: "nums = [4,1,-1,2,-1,2,3], k = 2", output: "[-1,2]", isPublic: true },
      { input: "nums = [5,2,5,3,5,3,1,1,3], k = 2", output: "[3,5]" },
      { input: "nums = [1,2,2,3,3], k = 1", output: "[2]" },
      { input: "nums = [3,0,1,0], k = 1", output: "[0]" },
      { input: "nums = [6,6,6,6,1,2,3], k = 1", output: "[6]" },
      { input: "nums = [1,1,1,1,2,2,3,3,3,3], k = 2", output: "[1,3]" },
      { input: "nums = [-1,-1], k = 1", output: "[-1]" },
      { input: "nums = [0], k = 1", output: "[0]" },
      { input: "nums = [1,2], k = 2", output: "[1,2]" },
      { input: "nums = [2,2,2,3,3], k = 2", output: "[2,3]" }
    ]
  },
  {
    problemName: "Kth Largest Element in an Array",
    CreatedBy: "68556435485d33329e7af603",
    problemDescription: "Find the kth largest element in an unsorted array. It is the kth largest element in sorted order, not the kth distinct element.",
    Constraints: [
      "1 <= k <= nums.length <= 10^4",
      "-10^4 <= nums[i] <= 10^4"
    ],
    difficulty: "medium",
    topics: ["heap", "sorting", "quickselect"],
    hints: [
      "Use a Min Heap of size k.",
      "QuickSelect algorithm gives better average performance.",
      "Don't sort the entire array."
    ],
    TestCases: [
      { input: "nums = [3,2,1,5,6,4], k = 2", output: "5", isPublic: true },
      { input: "nums = [3,2,3,1,2,4,5,5,6], k = 4", output: "4", isPublic: true },
      { input: "nums = [1], k = 1", output: "1", isPublic: true },
      { input: "nums = [7,10,4,3,20,15], k = 3", output: "10" },
      { input: "nums = [7,10,4,3,20,15], k = 4", output: "7" },
      { input: "nums = [99,100,101], k = 2", output: "100" },
      { input: "nums = [1,2], k = 2", output: "1" },
      { input: "nums = [4,2,7,1], k = 3", output: "2" },
      { input: "nums = [10,9,8,7,6,5], k = 1", output: "10" },
      { input: "nums = [1,1,1,1], k = 1", output: "1" },
      { input: "nums = [1,2,3,4,5], k = 5", output: "1" },
      { input: "nums = [5,5,5,5], k = 2", output: "5" }
    ]
    },
  {
    problemName: "Valid Anagram",
    CreatedBy: "68556457485d33329e7af608",
    problemDescription: "Given two strings s and t, return true if t is an anagram of s, and false otherwise.",
    Constraints: [
      "1 <= s.length, t.length <= 5 * 10^4",
      "s and t consist of lowercase English letters."
    ],
    difficulty: "easy",
    topics: ["strings", "hashmap"],
    hints: [
      "Sort both strings and compare.",
      "Or use a frequency counter for each letter.",
      "Make sure character counts match."
    ],
    TestCases: [
      {input: "s = 'anagram', t = 'nagaram'", output: "true", isPublic: true},
      {input: "s = 'rat', t = 'car'", output: "false", isPublic: true},
      {input: "s = 'a', t = 'a'", output: "true", isPublic: true},
      {input: "s = 'ab', t = 'ba'", output: "true"},
      {input: "s = 'aab', t = 'aba'", output: "true"},
      {input: "s = 'abc', t = 'acb'", output: "true"},
      {input: "s = 'abcd', t = 'abcde'", output: "false"},
      {input: "s = 'listen', t = 'silent'", output: "true"},
      {input: "s = 'aabbcc', t = 'bbaacc'", output: "true"},
      {input: "s = 'xxyyzz', t = 'zzyyxx'", output: "true"},
      {input: "s = 'aaabbb', t = 'ababab'", output: "true"},
      {input: "s = 'abcdef', t = 'fedcba'", output: "true"}
    ]
  },
  {
    problemName: "Climbing Stairs",
    CreatedBy: "68553d7003abcf50e9943518",
    problemDescription: "You are climbing a staircase. Each time you can either climb 1 or 2 steps. Given n, return the number of distinct ways to reach the top.",
    Constraints: ["1 <= n <= 45"],
    difficulty: "easy",
    topics: ["dynamic programming", "recursion"],
    hints: [
      "This is a Fibonacci sequence problem.",
      "Use DP to avoid repeated work.",
      "Use bottom-up or memoization."
    ],
    TestCases: [
      {input: "n = 2", output: "2", isPublic: true},
      {input: "n = 3", output: "3", isPublic: true},
      {input: "n = 1", output: "1", isPublic: true},
      {input: "n = 4", output: "5"},
      {input: "n = 5", output: "8"},
      {input: "n = 6", output: "13"},
      {input: "n = 7", output: "21"},
      {input: "n = 8", output: "34"},
      {input: "n = 9", output: "55"},
      {input: "n = 10", output: "89"},
      {input: "n = 20", output: "10946"},
      {input: "n = 30", output: "1346269"}
    ]
  },
  {
    problemName: "Minimum Path Sum",
    CreatedBy: "68556435485d33329e7af603",
    problemDescription: "Given a m x n grid filled with non-negative numbers, find a path from top left to bottom right that minimizes the sum of all numbers along its path.",
    Constraints: [
      "m == grid.length",
      "n == grid[i].length",
      "1 <= m, n <= 200",
      "0 <= grid[i][j] <= 100"
    ],
    difficulty: "medium",
    topics: ["dynamic programming", "matrix"],
    hints: [
      "Use DP to store minimum path to each cell.",
      "Only right and down moves allowed.",
      "Top-down and bottom-up both valid."
    ],
    TestCases: [
      {input: "grid = [[1,3,1],[1,5,1],[4,2,1]]", output: "7", isPublic: true},
      {input: "grid = [[1,2,3],[4,5,6]]", output: "12", isPublic: true},
      {input: "grid = [[1,2],[1,1]]", output: "3", isPublic: true},
      {input: "grid = [[1]]", output: "1"},
      {input: "grid = [[1,2,5],[3,2,1]]", output: "6"},
      {input: "grid = [[5,4,2,1],[3,2,1,0]]", output: "10"},
      {input: "grid = [[7,4,2],[3,6,1],[8,5,3]]", output: "19"},
      {input: "grid = [[9,9,9],[1,1,1],[9,9,9]]", output: "21"},
      {input: "grid = [[0,0,0],[0,0,0],[0,0,0]]", output: "0"},
      {input: "grid = [[10,10],[10,1]]", output: "21"},
      {input: "grid = [[1,3,1,1],[1,5,1,1],[4,2,1,1]]", output: "9"},
      {input: "grid = [[1,2,3,4,5]]", output: "15"}
    ]
  },
];

