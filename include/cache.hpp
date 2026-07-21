#ifndef CACHE_HPP
#define CACHE_HPP

#include "string"

// Checks if the timestamp is still within the valid time window
bool isCacheValid(long long lastSyncedTimestamp, int ttlSeconds);

// Simulates fetching stats and updates the cache
void fetchUserStats(const std::string& username);

#endif // CACHE_HPP