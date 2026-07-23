#include "../include/api_service.hpp"
#include "../include/user_model.hpp"
#include <iostream>
#include <string>
#include <stdexcept> 
#include <cpr/cpr.h>
#include <nlohmann/json.hpp>

using json = nlohmann::json;

// --- CODEFORCES API SERVICE (Strict Mode & Solved Count Fix) ---
PlatformStats fetchCodeforcesData(const std::string& handle) {
    PlatformStats stats = {0, 0, 0, 0};
    if (handle.empty() || handle == "None") {
        std::cout << "[SKIP] No Codeforces handle configured.\n";
        return stats;
    }

    std::cout << "[API Network] Connecting to Codeforces API for: " << handle << "...\n";
    
    // 1. Fetch Rating
    cpr::Response r_info = cpr::Get(cpr::Url{"https://codeforces.com/api/user.info?handles=" + handle});
    if (r_info.status_code == 200) {
        try {
            json data = json::parse(r_info.text);
            if (data["status"] == "OK") {
                stats.rating = data["result"][0].value("rating", 0);
            }
        } catch (...) {
            std::cout << "[ERROR] JSON parse failed for CF user.info.\n";
        }
    }

    // 2. Fetch Solved Count (Iterating through user status)
    std::cout << "[API Network] Fetching CF submissions to count solved problems...\n";
    cpr::Response r_status = cpr::Get(cpr::Url{"https://codeforces.com/api/user.status?handle=" + handle});
    if (r_status.status_code == 200) {
        try {
            json status_data = json::parse(r_status.text);
            if (status_data["status"] == "OK") {
                int solved = 0;
                // Count every submission that has an "OK" verdict
                for (const auto& submission : status_data["result"]) {
                    if (submission.contains("verdict") && submission["verdict"] == "OK") {
                        solved++;
                    }
                }
                stats.totalSolvedCount = solved;
            }
        } catch (...) {
            std::cout << "[ERROR] JSON parse failed for CF user.status.\n";
        }
    }

    std::cout << "[SUCCESS] Codeforces rating fetched: " << stats.rating << ", Solved: " << stats.totalSolvedCount << "\n";
    return stats;
}

// --- LEETCODE API SERVICE (Strict Mode) ---
PlatformStats fetchLeetcodeData(const std::string& handle) {
    PlatformStats stats = {0, 0, 0, 0};
    if (handle.empty() || handle == "None") {
        std::cout << "[SKIP] No LeetCode handle configured.\n";
        return stats;
    }

    std::cout << "[API Network] Connecting to LeetCode GraphQL for: " << handle << "...\n";
    json payload = {
        {"query", "query getUserProfile($username: String!) { matchedUser(username: $username) { submitStatsGlobal { acSubmissionNum { count } } } userContestRanking(username: $username) { rating } }"},
        {"variables", {{"username", handle}}}
    };
    
    cpr::Response r = cpr::Post(
        cpr::Url{"https://leetcode.com/graphql"},
        cpr::Header{{"Content-Type", "application/json"}},
        cpr::Body{payload.dump()}
    );

    if (r.status_code == 200) {
        try {
            json data = json::parse(r.text);
            if (data.contains("data") && !data["data"]["matchedUser"].is_null()) {
                auto submissions = data["data"]["matchedUser"]["submitStatsGlobal"]["acSubmissionNum"];
                stats.totalSolvedCount = submissions[0].value("count", 0); 
                
                if (!data["data"]["userContestRanking"].is_null()) {
                    stats.rating = static_cast<int>(data["data"]["userContestRanking"].value("rating", 0.0));
                }
                std::cout << "[SUCCESS] LeetCode data fetched: " << stats.rating << " rating, " << stats.totalSolvedCount << " solved.\n";
                return stats;
            }
        } catch (...) {
             std::cout << "[ERROR] JSON parse failed for LeetCode.\n";
        }
    }
    throw std::runtime_error("Invalid LeetCode Username or API Down.");
}

// --- ATCODER API SERVICE (Strict Mode) ---
PlatformStats fetchAtcoderData(const std::string& handle) {
    PlatformStats stats = {0, 0, 0, 0};
    if (handle.empty() || handle == "None") {
        std::cout << "[SKIP] No AtCoder handle configured.\n";
        return stats;
    }

    std::cout << "[API Network] Connecting to AtCoder API for: " << handle << "...\n";
    cpr::Response r = cpr::Get(cpr::Url{"https://atcoder.jp/users/" + handle + "/history/json"});

    if (r.status_code == 200) {
        try {
            json data = json::parse(r.text);
            if (!data.empty()) {
                stats.rating = data.back().value("NewRating", 0);
                stats.totalSolvedCount = data.size(); // Approximate based on contests
                std::cout << "[SUCCESS] AtCoder rating fetched: " << stats.rating << "\n";
                return stats;
            }
        } catch (...) {
            std::cout << "[ERROR] JSON parse failed for AtCoder.\n";
        }
    }
    throw std::runtime_error("Invalid AtCoder ID or API Down.");
}