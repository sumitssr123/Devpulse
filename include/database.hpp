#pragma once
#include <string>
#include <vector>

// Structure to hold fetched user data
struct UserData {
    std::string cf_handle;
    std::string lc_handle;
    std::string ac_handle;
};

// Structure to hold target goals
struct TargetGoals {
    int cf_target = 1600;
    int lc_target = 300;
    int ac_target = 1000;
};

// Structure to hold history snapshots
struct HistorySnapshot {
    std::string timestamp;
    int cf_rating = 0;
    int cf_solved = 0;
    int lc_rating = 0;
    int lc_solved = 0;
    int ac_rating = 0;
    int ac_solved = 0;
};

// Structure to hold leaderboard rankings
struct LeaderboardEntry {
    std::string username;
    int total_rating = 0;
    int total_solved = 0;
};

// Function declarations
bool updateHandlesInDB(const std::string& username, const std::string& cf_handle, const std::string& lc_handle, const std::string& ac_handle);
bool saveProgressSnapshot(const std::string& username, int cf_rating, int cf_solved, int lc_rating, int lc_solved, int ac_rating, int ac_solved);
UserData getUserDataFromDB(const std::string& username);

// DB Goal tracking functions
bool updateTargetGoals(const std::string& username, int cf, int lc, int ac);
TargetGoals getTargetGoals(const std::string& username);

// DB History & Leaderboard functions
std::vector<HistorySnapshot> getHistorySnapshots(const std::string& username);
std::vector<LeaderboardEntry> getLeaderboard();

// ---> NEW: Added the missing declaration here! <---
bool updateUserStatsInDB(const std::string& username, int total_solved, int total_rating);