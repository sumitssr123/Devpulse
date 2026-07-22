#pragma once
#include <string>

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

// Function declarations
bool updateHandlesInDB(const std::string& username, const std::string& cf_handle, const std::string& lc_handle, const std::string& ac_handle);
bool saveProgressSnapshot(const std::string& username, int cf_rating, int cf_solved, int lc_rating, int lc_solved, int ac_rating, int ac_solved);
UserData getUserDataFromDB(const std::string& username);

// New DB Goal tracking functions
bool updateTargetGoals(const std::string& username, int cf, int lc, int ac);
TargetGoals getTargetGoals(const std::string& username);