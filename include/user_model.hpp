#ifndef USER_MODEL_HPP
#define USER_MODEL_HPP

#include <iostream>
#include <string>
#include <vector>
#include <unordered_map>

struct PlatformStats {
    int rating = 0;
    int totalSolvedCount = 0;
    int graphSolvedCount = 0;
    int dpSolvedCount = 0;
    long long lastSyncedTimestamp = 0; 
    std::vector<std::string> recentProblems; // <--- NEW: To store top 10 recent ACs
};

struct HistoricalSnapshot {
    long long timestamp = 0;
    int codeforcesRating = 0;
    int leetcodeSolvedCount = 0;
    int atcoderRating = 0;
};

struct UserProfile {
    std::string username;
    std::string passwordHash;
    std::string userRole; 
    
    std::string codeforcesHandle;
    std::string leetcodeHandle;
    std::string atcoderHandle;
    
    // Target Ratings for Goal Tracking
    int codeforcesTargetRating = 0;
    int leetcodeTargetRating = 0;
    int atcoderTargetRating = 0;
    
    PlatformStats codeforcesStats;
    PlatformStats leetcodeStats;
    PlatformStats atcoderStats;
    
    std::vector<HistoricalSnapshot> progressHistory; 
};

extern std::unordered_map<std::string, UserProfile> globalUserDatabase;

#endif // USER_MODEL_HPP