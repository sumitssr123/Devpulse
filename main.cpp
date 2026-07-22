#include <iostream>
#include <string>
#include <vector>
#include "../include/httplib.h" 
#include <nlohmann/json.hpp> 

// Your existing project includes
#include "user_model.hpp"
#include "auth.hpp"
#include "cache.hpp"
#include "recommender.hpp"
#include "api_service.hpp"
#include "database_manager.hpp" 
#include "../include/database.hpp" 

using json = nlohmann::json;

int main() {
    std::cout << "===========================================\n";
    std::cout << "        DevPulse REST API Server           \n";
    std::cout << "===========================================\n\n";

    // 1. Initialize SQLite Database
    std::cout << "[SYSTEM] Booting up SQLite database...\n";
    DatabaseManager dbManager("devpulse.db");
    if (!dbManager.initialize()) {
        std::cerr << "[FATAL] Failed to initialize database. Exiting.\n";
        return 1;
    }
    std::cout << "[SYSTEM] Database ready.\n\n";

    httplib::Server svr;

    // 2. GLOBAL CORS CONFIGURATION (Crucial for React!)
    svr.set_post_routing_handler([](const auto& req, auto& res) {
        res.set_header("Access-Control-Allow-Origin", "*");
        res.set_header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        res.set_header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    });
    
    // Handle React's automatic pre-flight OPTIONS requests
    svr.Options(".*", [](const auto& req, auto& res) {
        res.status = 200;
    });

    // 3. API ROUTE 1: Get User Dashboard
    svr.Get(R"(/api/user/(.*))", [&](const httplib::Request& req, httplib::Response& res) {
        std::string req_username = req.matches[1];
        UserData userStats = getUserDataFromDB(req_username);
        
        json json_response = {
            {"username", req_username},
            {"cf_handle", userStats.cf_handle},
            {"lc_handle", userStats.lc_handle},
            {"ac_handle", userStats.ac_handle}
        };
        res.set_content(json_response.dump(), "application/json");
    });

    // 4. API ROUTE 2: Live SYNC Route (Wired to Codeforces, LeetCode, and AtCoder)
    svr.Post("/api/sync", [&](const httplib::Request& req, httplib::Response& res) {
        try {
            // Parse the incoming JSON payload from React (e.g., {"username": "sumit_coder"})
            json req_body = json::parse(req.body);
            std::string username = req_body.value("username", "");

            if (username.empty()) {
                res.status = 400;
                json error_res = {{"status", "error"}, {"message", "Username is required"}};
                res.set_content(error_res.dump(), "application/json");
                return;
            }

            std::cout << "\n[API] Sync requested for user: " << username << "\n";

            // Step A: Retrieve saved platform handles from SQLite
            UserData userStats = getUserDataFromDB(username);

            // Use configured handles or fall back to the username itself
            std::string cf_handle = !userStats.cf_handle.empty() ? userStats.cf_handle : username;
            std::string lc_handle = !userStats.lc_handle.empty() ? userStats.lc_handle : username;
            std::string ac_handle = !userStats.ac_handle.empty() ? userStats.ac_handle : username;

            // Step B: Fetch live/fallback stats across all 3 platforms
            PlatformStats cf_stats = fetchCodeforcesData(cf_handle);
            PlatformStats lc_stats = fetchLeetcodeData(lc_handle);
            PlatformStats ac_stats = fetchAtcoderData(ac_handle);

            // Step C: Construct response object for React
            json json_response = {
                {"status", "success"},
                {"username", username},
                {"platforms", {
                    {"codeforces", {
                        {"handle", cf_handle},
                        {"rating", cf_stats.rating},
                        {"total_solved", cf_stats.totalSolvedCount},
                        {"graph_solved", cf_stats.graphSolvedCount},
                        {"dp_solved", cf_stats.dpSolvedCount}
                    }},
                    {"leetcode", {
                        {"handle", lc_handle},
                        {"rating", lc_stats.rating},
                        {"total_solved", lc_stats.totalSolvedCount},
                        {"graph_solved", lc_stats.graphSolvedCount},
                        {"dp_solved", lc_stats.dpSolvedCount}
                    }},
                    {"atcoder", {
                        {"handle", ac_handle},
                        {"rating", ac_stats.rating},
                        {"total_solved", ac_stats.totalSolvedCount},
                        {"graph_solved", ac_stats.graphSolvedCount},
                        {"dp_solved", ac_stats.dpSolvedCount}
                    }}
                }}
            };

            std::cout << "[API] Sync completed successfully for " << username << "!\n\n";
            res.set_content(json_response.dump(), "application/json");

        } catch (const std::exception& e) {
            std::cerr << "[API EXCEPTION] Sync failed: " << e.what() << "\n";
            json error_res = {{"status", "error"}, {"message", e.what()}};
            res.status = 400;
            res.set_content(error_res.dump(), "application/json");
        }
    });

    // 5. API ROUTE 3: Leaderboard
    svr.Get("/api/leaderboard", [&](const httplib::Request& req, httplib::Response& res) {
        json json_response = json::array();

        // Fallback leaderboard data until getLeaderboardFromDB() is integrated
        json_response.push_back({{"rank", 1}, {"username", "DevMaster"}, {"total_solved", 540}, {"total_rating", 3400}});
        json_response.push_back({{"rank", 2}, {"username", "AlgoKing"}, {"total_solved", 412}, {"total_rating", 2900}});

        res.set_content(json_response.dump(), "application/json");
    });

    // 6. Start listening
    std::cout << "[API] Starting DevPulse server on http://localhost:8080\n";
    std::cout << "[API] Press Ctrl+C to stop.\n";
    svr.listen("localhost", 8080);

    return 0;
}