#include "../include/database.hpp"
#include "sqlite3.h"
#include <iostream>

bool updateHandlesInDB(const std::string& username, const std::string& cf_handle, const std::string& lc_handle, const std::string& ac_handle) {
    sqlite3* db;
    if (sqlite3_open("devpulse.db", &db) != SQLITE_OK) return false;

    std::string sql = "UPDATE USERS SET cf_handle = '" + cf_handle + 
                      "', lc_handle = '" + lc_handle + 
                      "', ac_handle = '" + ac_handle + 
                      "' WHERE username = '" + username + "';";
    
    char* errMsg = nullptr;
    int rc = sqlite3_exec(db, sql.c_str(), nullptr, nullptr, &errMsg);

    if (rc != SQLITE_OK) {
        std::cerr << "[ERROR] Failed to update handles: " << errMsg << "\n";
        sqlite3_free(errMsg);
        sqlite3_close(db);
        return false;
    }

    sqlite3_close(db);
    return true;
}

bool saveProgressSnapshot(const std::string& username, int cf_rating, int cf_solved, int lc_rating, int lc_solved, int ac_rating, int ac_solved) {
    sqlite3* db;
    if (sqlite3_open("devpulse.db", &db) != SQLITE_OK) return false;

    std::string sql = "INSERT INTO HISTORY_SNAPSHOTS (username, timestamp, cf_rating, cf_solved, lc_rating, lc_solved, ac_rating, ac_solved) "
                      "VALUES ('" + username + "', datetime('now', 'localtime'), " + 
                      std::to_string(cf_rating) + ", " + std::to_string(cf_solved) + ", " + 
                      std::to_string(lc_rating) + ", " + std::to_string(lc_solved) + ", " + 
                      std::to_string(ac_rating) + ", " + std::to_string(ac_solved) + ");";

    char* errMsg = nullptr;
    int rc = sqlite3_exec(db, sql.c_str(), nullptr, nullptr, &errMsg);

    if (rc != SQLITE_OK) {
        std::cerr << "[ERROR] Could not save history snapshot: " << errMsg << "\n";
        sqlite3_free(errMsg);
    }
    
    sqlite3_close(db);
    return (rc == SQLITE_OK);
}

UserData getUserDataFromDB(const std::string& username) {
    UserData data;
    sqlite3* db;
    if (sqlite3_open("devpulse.db", &db) != SQLITE_OK) return data;

    std::string sql = "SELECT cf_handle, lc_handle, ac_handle FROM USERS WHERE username = '" + username + "';";
    sqlite3_stmt* stmt;

    if (sqlite3_prepare_v2(db, sql.c_str(), -1, &stmt, nullptr) == SQLITE_OK) {
        if (sqlite3_step(stmt) == SQLITE_ROW) {
            if (sqlite3_column_text(stmt, 0)) data.cf_handle = reinterpret_cast<const char*>(sqlite3_column_text(stmt, 0));
            if (sqlite3_column_text(stmt, 1)) data.lc_handle = reinterpret_cast<const char*>(sqlite3_column_text(stmt, 1));
            if (sqlite3_column_text(stmt, 2)) data.ac_handle = reinterpret_cast<const char*>(sqlite3_column_text(stmt, 2));
        }
    }

    sqlite3_finalize(stmt);
    sqlite3_close(db);
    return data;
}

bool updateTargetGoals(const std::string& username, int cf, int lc, int ac) {
    sqlite3* db;
    if (sqlite3_open("devpulse.db", &db) != SQLITE_OK) return false;

    std::string sql = "UPDATE USERS SET cf_target = " + std::to_string(cf) + 
                      ", lc_target = " + std::to_string(lc) + 
                      ", ac_target = " + std::to_string(ac) + 
                      " WHERE username = '" + username + "';";
    
    char* errMsg = nullptr;
    int rc = sqlite3_exec(db, sql.c_str(), nullptr, nullptr, &errMsg);

    if (rc != SQLITE_OK) {
        std::cerr << "[ERROR] Failed to update target goals: " << errMsg << "\n";
        sqlite3_free(errMsg);
        sqlite3_close(db);
        return false;
    }

    sqlite3_close(db);
    return true;
}

TargetGoals getTargetGoals(const std::string& username) {
    TargetGoals goals;
    sqlite3* db;
    if (sqlite3_open("devpulse.db", &db) != SQLITE_OK) return goals;

    std::string sql = "SELECT cf_target, lc_target, ac_target FROM USERS WHERE username = '" + username + "';";
    sqlite3_stmt* stmt;

    if (sqlite3_prepare_v2(db, sql.c_str(), -1, &stmt, nullptr) == SQLITE_OK) {
        if (sqlite3_step(stmt) == SQLITE_ROW) {
            goals.cf_target = sqlite3_column_int(stmt, 0);
            goals.lc_target = sqlite3_column_int(stmt, 1);
            goals.ac_target = sqlite3_column_int(stmt, 2);
        }
    }

    sqlite3_finalize(stmt);
    sqlite3_close(db);
    return goals;
}

std::vector<HistorySnapshot> getHistorySnapshots(const std::string& username) {
    std::vector<HistorySnapshot> history;
    sqlite3* db;
    if (sqlite3_open("devpulse.db", &db) != SQLITE_OK) return history;

    std::string sql = "SELECT timestamp, cf_rating, cf_solved, lc_rating, lc_solved, ac_rating, ac_solved "
                      "FROM HISTORY_SNAPSHOTS WHERE username = '" + username + "' ORDER BY timestamp DESC LIMIT 10;";
    
    sqlite3_stmt* stmt;
    if (sqlite3_prepare_v2(db, sql.c_str(), -1, &stmt, nullptr) == SQLITE_OK) {
        while (sqlite3_step(stmt) == SQLITE_ROW) {
            HistorySnapshot snap;
            if (sqlite3_column_text(stmt, 0)) snap.timestamp = reinterpret_cast<const char*>(sqlite3_column_text(stmt, 0));
            snap.cf_rating = sqlite3_column_int(stmt, 1);
            snap.cf_solved = sqlite3_column_int(stmt, 2);
            snap.lc_rating = sqlite3_column_int(stmt, 3);
            snap.lc_solved = sqlite3_column_int(stmt, 4);
            snap.ac_rating = sqlite3_column_int(stmt, 5);
            snap.ac_solved = sqlite3_column_int(stmt, 6);
            history.push_back(snap);
        }
    }

    sqlite3_finalize(stmt);
    sqlite3_close(db);
    return history;
}

// --- NEW LEADERBOARD QUERY ---
std::vector<LeaderboardEntry> getLeaderboard() {
    std::vector<LeaderboardEntry> board;
    sqlite3* db;
    if (sqlite3_open("devpulse.db", &db) != SQLITE_OK) return board;

    // Subquery: Get the highest 'id' (most recent snapshot) for each user.
    // Main query: Calculate total stats from those most recent snapshots and sort them.
    std::string sql = R"(
        SELECT username, 
               (cf_rating + lc_rating + ac_rating) AS total_rating, 
               (cf_solved + lc_solved + ac_solved) AS total_solved
        FROM HISTORY_SNAPSHOTS 
        WHERE id IN (SELECT MAX(id) FROM HISTORY_SNAPSHOTS GROUP BY username)
        ORDER BY total_solved DESC;
    )";
    
    sqlite3_stmt* stmt;
    if (sqlite3_prepare_v2(db, sql.c_str(), -1, &stmt, nullptr) == SQLITE_OK) {
        while (sqlite3_step(stmt) == SQLITE_ROW) {
            LeaderboardEntry entry;
            if (sqlite3_column_text(stmt, 0)) entry.username = reinterpret_cast<const char*>(sqlite3_column_text(stmt, 0));
            entry.total_rating = sqlite3_column_int(stmt, 1);
            entry.total_solved = sqlite3_column_int(stmt, 2);
            board.push_back(entry);
        }
    }

    sqlite3_finalize(stmt);
    sqlite3_close(db);
    return board;
}