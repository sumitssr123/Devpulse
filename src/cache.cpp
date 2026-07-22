#include "../include/cache.hpp"
#include "../include/user_model.hpp"
#include "../include/api_service.hpp" 
#include "../include/database.hpp" // <-- DB Integration
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
    std::cout << "[Cache] Requesting API Service for all platforms...\n";
    
    // 1. Fetch handles from Database
    UserData userStats = getUserDataFromDB(username);

    // 2. Fallback to username if handle is not set
    std::string cfHandle = userStats.cf_handle.empty() ? username : userStats.cf_handle;
    std::string lcHandle = userStats.lc_handle.empty() ? username : userStats.lc_handle;
    std::string acHandle = userStats.ac_handle.empty() ? username : userStats.ac_handle;
    
    // 3. Fetch live data
    PlatformStats cfStats = fetchCodeforcesData(cfHandle);
    PlatformStats lcStats = fetchLeetcodeData(lcHandle);
    PlatformStats acStats = fetchAtcoderData(acHandle);
    
    // 4. Save directly to DB History
    saveProgressSnapshot(
        username, 
        cfStats.rating, cfStats.totalSolvedCount, 
        lcStats.rating, lcStats.totalSolvedCount, 
        acStats.rating, acStats.totalSolvedCount
    );
    
    std::cout << "[Cache Update] Fresh stats saved to Database. History snapshot recorded.\n";
}