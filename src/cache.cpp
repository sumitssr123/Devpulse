#include "../include/cache.hpp"
#include "../include/user_model.hpp"
#include "../include/api_service.hpp" 
#include <iostream>
#include <string>
#include <chrono>

bool isCacheValid(long long lastSyncedTimestamp, int ttlSeconds) {
    auto now = std::chrono::system_clock::now();
    auto duration = now.time_since_epoch();
    
    long long currentTimeSeconds = std::chrono::duration_cast<std::chrono::seconds>(duration).count();
    long long dataAgeSeconds = currentTimeSeconds - lastSyncedTimestamp;
    
    return dataAgeSeconds < ttlSeconds;
}

void fetchUserStats(const std::string& username) {
    auto userIterator = globalUserDatabase.find(username);
    if (userIterator == globalUserDatabase.end()) return;

    int timeToLiveLimit = 60; 
    long long storedTimestamp = userIterator->second.codeforcesStats.lastSyncedTimestamp;

    if (storedTimestamp > 0 && isCacheValid(storedTimestamp, timeToLiveLimit)) {
        std::cout << "[Cache Hit] Returning lightning-fast cached data for all platforms.\n";
        return;
    }

    std::cout << "[Cache Miss] Data stale or missing. Requesting API Service for all platforms...\n";
    
    // Fallback to username if handle is not set in settings
    std::string cfHandle = userIterator->second.codeforcesHandle.empty() ? username : userIterator->second.codeforcesHandle;
    std::string lcHandle = userIterator->second.leetcodeHandle.empty() ? username : userIterator->second.leetcodeHandle;
    std::string acHandle = userIterator->second.atcoderHandle.empty() ? username : userIterator->second.atcoderHandle;
    
    PlatformStats cfStats = fetchCodeforcesData(cfHandle);
    PlatformStats lcStats = fetchLeetcodeData(lcHandle);
    PlatformStats acStats = fetchAtcoderData(acHandle);
    
    auto now = std::chrono::system_clock::now();
    auto duration = now.time_since_epoch();
    long long fetchTimeSeconds = std::chrono::duration_cast<std::chrono::seconds>(duration).count();
    
    cfStats.lastSyncedTimestamp = fetchTimeSeconds;
    lcStats.lastSyncedTimestamp = fetchTimeSeconds;
    acStats.lastSyncedTimestamp = fetchTimeSeconds;
    
    userIterator->second.codeforcesStats = cfStats;
    userIterator->second.leetcodeStats = lcStats;
    userIterator->second.atcoderStats = acStats;

    HistoricalSnapshot newSnapshot;
    newSnapshot.timestamp = fetchTimeSeconds;
    newSnapshot.codeforcesRating = cfStats.rating;
    newSnapshot.leetcodeSolvedCount = lcStats.totalSolvedCount;
    newSnapshot.atcoderRating = acStats.rating;
    
    userIterator->second.progressHistory.push_back(newSnapshot);
    
    std::cout << "[Cache Update] Fresh stats saved to RAM. History snapshot recorded.\n";
}