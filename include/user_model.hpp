#ifndef USER_MODEL_HPP
#define USER_MODEL_HPP

#include "iostream"
#include "string"
#include "vector"
#include "unordered_map"

// Live statistics per platform
struct PlatformStats {
    int rating;
    int totalSolvedCount;
    int graphSolvedCount;
    int dpSolvedCount;
    long long lastSyncedTimestamp; // Epoch seconds for cache TTL validation
};

// Historical snapshot for tracking progress over time
struct HistoricalSnapshot {
    long long timestamp;
    int codeforcesRating;
    int leetcodeSolvedCount;
    int atcoderRating;
};

// Main user profile structure
struct UserProfile {
    std::string username;
    std::string passwordHash;
    std::string userRole; // "user" or "admin" (AuthZ)
    
    // Linked handles
    std::string codeforcesHandle;
    std::string leetcodeHandle;
    std::string atcoderHandle;
    
    // Stats & Progress
    PlatformStats codeforcesStats;
    PlatformStats leetcodeStats;
    PlatformStats atcoderStats;
    std::vector<HistoricalSnapshot> progressHistory;
};

// Global memory map for O(1) user profile lookups
extern std::unordered_map<std::string, UserProfile> globalUserDatabase;

#endif // USER_MODEL_HPP