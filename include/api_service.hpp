#ifndef API_SERVICE_HPP
#define API_SERVICE_HPP

#include <string>
#include "user_model.hpp"

PlatformStats fetchCodeforcesData(const std::string& handle);
PlatformStats fetchLeetcodeData(const std::string& handle);
PlatformStats fetchAtcoderData(const std::string& handle);

// Correctly declared so main.cpp, ui.cpp, etc. can call it
void fetchUserStats(const std::string& username);

#endif // API_SERVICE_HPP