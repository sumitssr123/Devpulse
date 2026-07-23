#include <iostream>
#include <string>
#include <vector>
#include "../include/httplib.h" 
#include <nlohmann/json.hpp> 

#include "user_model.hpp"
#include "auth.hpp"
#include "cache.hpp"
#include "recommender.hpp"
#include "api_service.hpp"
#include "database_manager.hpp" 
#include "../include/database.hpp" 

using json = nlohmann::json;

// --- AUTHENTICATION HELPER ---
bool handleAuthDatabaseAction(const std::string& username, const std::string& password, const std::string& action) {
    sqlite3* db;
    if (sqlite3_open("devpulse.db", &db) != SQLITE_OK) return false;
    
    // Safety check: Ensure password column exists without dropping data
    sqlite3_exec(db, "ALTER TABLE USERS ADD COLUMN password TEXT DEFAULT 'password123';", nullptr, nullptr, nullptr);

    bool success = false;
    if (action == "register") {
        std::string sql = "INSERT INTO USERS (username, password) VALUES ('" + username + "', '" + password + "');";
        success = (sqlite3_exec(db, sql.c_str(), nullptr, nullptr, nullptr) == SQLITE_OK);
    } else if (action == "login") {
        std::string sql = "SELECT id FROM USERS WHERE username = '" + username + "' AND password = '" + password + "';";
        sqlite3_stmt* stmt;
        if (sqlite3_prepare_v2(db, sql.c_str(), -1, &stmt, nullptr) == SQLITE_OK) {
            success = (sqlite3_step(stmt) == SQLITE_ROW);
        }
        sqlite3_finalize(stmt);
    } else if (action == "forgot") {
        std::string sql = "UPDATE USERS SET password = '" + password + "' WHERE username = '" + username + "';";
        success = (sqlite3_exec(db, sql.c_str(), nullptr, nullptr, nullptr) == SQLITE_OK);
    }
    
    sqlite3_close(db);
    return success;
}

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

    // 2. GLOBAL CORS CONFIGURATION
    svr.set_post_routing_handler([](const auto& req, auto& res) {
        res.set_header("Access-Control-Allow-Origin", "*");
        res.set_header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        res.set_header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    });
    
    svr.Options(".*", [](const auto& req, auto& res) {
        res.status = 200;
    });

    // 3. API ROUTE: Auth Handler
    svr.Post("/api/auth", [&](const httplib::Request& req, httplib::Response& res) {
        try {
            auto body = json::parse(req.body);
            std::string action = body.value("action", "login");
            std::string username = body.value("username", "");
            std::string password = body.value("password", "");

            if (handleAuthDatabaseAction(username, password, action)) {
                res.set_content(R"({"status": "success"})", "application/json");
            } else {
                res.status = 401;
                res.set_content(R"({"status": "error", "message": "Authentication failed"})", "application/json");
            }
        } catch (...) {
            res.status = 400;
            res.set_content(R"({"status": "error"})", "application/json");
        }
    });

    // 4. API ROUTE: Get User Dashboard Handles
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

    // 5. API ROUTE: Save specific platform handles
    svr.Post(R"(/api/user/(.*)/handles)", [&](const httplib::Request& req, httplib::Response& res) {
        std::string req_username = req.matches[1];
        
        try {
            auto body = json::parse(req.body);
            std::string cf = body.value("cf_handle", "");
            std::string lc = body.value("lc_handle", "");
            std::string ac = body.value("ac_handle", "");

            if (updateHandlesInDB(req_username, cf, lc, ac)) {
                res.set_content(R"({"status": "success"})", "application/json");
                std::cout << "[API] Updated handles for " << req_username << "\n";
            } else {
                res.status = 500;
                res.set_content(R"({"error": "Failed to update database"})", "application/json");
            }
        } catch (const std::exception&) { 
            res.status = 400;
            res.set_content(R"({"error": "Invalid JSON data"})", "application/json");
        }
    });

    // 6. API ROUTE: Live SYNC Route (ADVANCED ERROR HANDLING ADDED)
    svr.Post("/api/sync", [&](const httplib::Request& req, httplib::Response& res) {
        try {
            json req_body = json::parse(req.body);
            std::string username = req_body.value("username", "");

            if (username.empty()) {
                res.status = 400;
                json error_res = {{"status", "error"}, {"message", "Username is required"}};
                res.set_content(error_res.dump(), "application/json");
                return;
            }

            std::cout << "\n[API] Sync requested for user: " << username << "\n";

            UserData userStats = getUserDataFromDB(username);

            std::string cf_handle = !userStats.cf_handle.empty() ? userStats.cf_handle : username;
            std::string lc_handle = !userStats.lc_handle.empty() ? userStats.lc_handle : username;
            std::string ac_handle = !userStats.ac_handle.empty() ? userStats.ac_handle : username;

            // ADVANCED FIX: Initialized variables to prevent garbage values
            PlatformStats cf_stats = {0, 0, 0, 0};
            PlatformStats lc_stats = {0, 0, 0, 0};
            PlatformStats ac_stats = {0, 0, 0, 0};

            // ADVANCED FIX: Independent Try-Catch for each platform. 
            // If AtCoder fails, LeetCode and Codeforces will still sync perfectly!
            try { cf_stats = fetchCodeforcesData(cf_handle); } catch (...) { std::cerr << "[WARNING] CF Fetch failed.\n"; }
            try { lc_stats = fetchLeetcodeData(lc_handle); } catch (...) { std::cerr << "[WARNING] LC Fetch failed.\n"; }
            try { ac_stats = fetchAtcoderData(ac_handle); } catch (...) { std::cerr << "[WARNING] AC Fetch failed.\n"; }

            // ADVANCED FIX: Only Total Solved is summed. Ratings are kept completely independent!
            int total_solved = cf_stats.totalSolvedCount + lc_stats.totalSolvedCount + ac_stats.totalSolvedCount;
            int total_rating = 0; // We explicitly set this to 0 because summing ratings is illogical
            
            updateUserStatsInDB(username, total_solved, total_rating);
            saveProgressSnapshot(username, cf_stats.rating, cf_stats.totalSolvedCount, 
                                           lc_stats.rating, lc_stats.totalSolvedCount, 
                                           ac_stats.rating, ac_stats.totalSolvedCount);

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

    // 7. API ROUTE: Leaderboard
    svr.Get("/api/leaderboard", [&](const httplib::Request& req, httplib::Response& res) {
        json json_response = json::array();

        std::vector<LeaderboardEntry> topUsers = getLeaderboard();
        
        int rank = 1;
        for (const auto& u : topUsers) {
            json_response.push_back({
                {"rank", rank++},
                {"username", u.username},
                {"total_solved", u.total_solved},
                {"total_rating", u.total_rating} // Note: total_rating is now 0 as we stopped summing it
            });
        }

        res.set_content(json_response.dump(), "application/json");
    });

    std::cout << "[API] Starting DevPulse server on http://localhost:8080\n";
    std::cout << "[API] Press Ctrl+C to stop.\n";
    svr.listen("localhost", 8080);

    return 0;
}