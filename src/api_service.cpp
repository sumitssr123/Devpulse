#include "../include/api_service.hpp"
#include "../include/user_model.hpp"
#include <iostream>
#include <string>
#include <stdexcept> 
#include <vector>
#include <algorithm> // for std::find
#include <cpr/cpr.h>
#include <nlohmann/json.hpp>

using json = nlohmann::json;

// --- CODEFORCES API SERVICE (Strict Mode & Top 10 ACs) ---
PlatformStats fetchCodeforcesData(const std::string& handle) {
    PlatformStats stats; // Automatically initializes to 0 and empty vector
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

    // 2. Fetch Solved Count & Top 10 Recent Problems
    cpr::Response r_status = cpr::Get(cpr::Url{"https://codeforces.com/api/user.status?handle=" + handle});
    if (r_status.status_code == 200) {
        try {
            json status_data = json::parse(r_status.text);
            if (status_data["status"] == "OK") {
                int solved = 0;
                for (const auto& sub : status_data["result"]) {
                    if (sub.contains("verdict") && sub["verdict"] == "OK") {
                        solved++;
                        // Store up to 10 unique recent problems
                        if (stats.recentProblems.size() < 10 && sub.contains("problem") && sub["problem"].contains("name")) {
                            std::string p_name = sub["problem"]["name"];
                            if (std::find(stats.recentProblems.begin(), stats.recentProblems.end(), p_name) == stats.recentProblems.end()) {
                                stats.recentProblems.push_back(p_name);
                            }
                        }
                    }
                }
                stats.totalSolvedCount = solved;
            }
        } catch (...) {
            std::cout << "[ERROR] JSON parse failed for CF user.status.\n";
        }
    }

    std::cout << "[SUCCESS] CF -> Rating: " << stats.rating << ", Solved: " << stats.totalSolvedCount << ", Recent stored: " << stats.recentProblems.size() << "\n";
    return stats;
}

// --- LEETCODE API SERVICE (GraphQL + Recent ACs) ---
PlatformStats fetchLeetcodeData(const std::string& handle) {
    PlatformStats stats;
    if (handle.empty() || handle == "None") {
        std::cout << "[SKIP] No LeetCode handle configured.\n";
        return stats;
    }

    std::cout << "[API Network] Connecting to LeetCode GraphQL for: " << handle << "...\n";
    json payload = {
        {"query", "query getUserProfile($username: String!) { matchedUser(username: $username) { submitStatsGlobal { acSubmissionNum { count } } } userContestRanking(username: $username) { rating } recentAcSubmissionList(limit: 10) { title } }"},
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

                // Extract Recent 10 LeetCode Problems
                if (data["data"].contains("recentAcSubmissionList")) {
                    for (const auto& item : data["data"]["recentAcSubmissionList"]) {
                        stats.recentProblems.push_back(item.value("title", ""));
                    }
                }

                std::cout << "[SUCCESS] LC -> Rating: " << stats.rating << ", Solved: " << stats.totalSolvedCount << ", Recent stored: " << stats.recentProblems.size() << "\n";
                return stats;
            }
        } catch (...) {
             std::cout << "[ERROR] JSON parse failed for LeetCode.\n";
        }
    }
    throw std::runtime_error("Invalid LeetCode Username or API Down.");
}

// --- ATCODER API SERVICE (Strict Mode + Kenkoooo API) ---
PlatformStats fetchAtcoderData(const std::string& handle) {
    PlatformStats stats;
    if (handle.empty() || handle == "None") {
        std::cout << "[SKIP] No AtCoder handle configured.\n";
        return stats;
    }

    std::cout << "[API Network] Connecting to AtCoder API for: " << handle << "...\n";
    
    // 1. Fetch Rating
    cpr::Response r_rating = cpr::Get(cpr::Url{"https://atcoder.jp/users/" + handle + "/history/json"});
    if (r_rating.status_code == 200) {
        try {
            json data = json::parse(r_rating.text);
            if (!data.empty()) {
                stats.rating = data.back().value("NewRating", 0);
            }
        } catch (...) {
            std::cout << "[ERROR] JSON parse failed for AtCoder Rating.\n";
        }
    }

    // 2. Fetch Recent Submissions via Kenkoooo
    cpr::Response r_subs = cpr::Get(cpr::Url{"https://kenkoooo.com/atcoder/atcoder-api/v3/user/submissions?user=" + handle});
    if (r_subs.status_code == 200) {
        try {
            json subs = json::parse(r_subs.text);
            int solved = 0;
            // Iterate backward to get the most recent submissions first
            for (auto it = subs.rbegin(); it != subs.rend(); ++it) {
                if (it->value("result", "") == "AC") {
                    solved++;
                    if (stats.recentProblems.size() < 10) {
                        std::string p_id = it->value("problem_id", "");
                        if (std::find(stats.recentProblems.begin(), stats.recentProblems.end(), p_id) == stats.recentProblems.end()) {
                            stats.recentProblems.push_back(p_id);
                        }
                    }
                }
            }
            stats.totalSolvedCount = solved; 
        } catch (...) {
            std::cout << "[ERROR] JSON parse failed for AtCoder Kenkoooo API.\n";
        }
    }

    std::cout << "[SUCCESS] AC -> Rating: " << stats.rating << ", Solved: " << stats.totalSolvedCount << ", Recent stored: " << stats.recentProblems.size() << "\n";
    return stats;
}