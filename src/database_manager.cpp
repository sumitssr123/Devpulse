#include "../include/database_manager.hpp"
#include <iostream>

DatabaseManager::DatabaseManager(const std::string& dbName) : db_name(dbName), db(nullptr) {}

DatabaseManager::~DatabaseManager() {
    if (db) {
        sqlite3_close(db);
        std::cout << "[DB] Database connection closed safely.\n";
    }
}

bool DatabaseManager::initialize() {
    int exitCode = sqlite3_open(db_name.c_str(), &db);
    if (exitCode != SQLITE_OK) {
        std::cerr << "[DB ERROR] Error opening database: " << sqlite3_errmsg(db) << "\n";
        return false;
    }
    std::cout << "[DB] Successfully connected to SQLite database.\n";

    // UPDATED: Fixed HISTORY_SNAPSHOTS schema to match the data saveProgressSnapshot is sending
    std::string sql = R"(
        CREATE TABLE IF NOT EXISTS USERS (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            cf_handle TEXT DEFAULT 'None',
            lc_handle TEXT DEFAULT 'None',
            ac_handle TEXT DEFAULT 'None',
            cf_target INTEGER DEFAULT 1600,
            lc_target INTEGER DEFAULT 300,
            ac_target INTEGER DEFAULT 1000
        );

        CREATE TABLE IF NOT EXISTS HISTORY_SNAPSHOTS (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL,
            timestamp TEXT NOT NULL,
            cf_rating INTEGER DEFAULT 0,
            cf_solved INTEGER DEFAULT 0,
            lc_rating INTEGER DEFAULT 0,
            lc_solved INTEGER DEFAULT 0,
            ac_rating INTEGER DEFAULT 0,
            ac_solved INTEGER DEFAULT 0,
            FOREIGN KEY(username) REFERENCES USERS(username)
        );
    )";

    char* errorMessage = nullptr;
    exitCode = sqlite3_exec(db, sql.c_str(), nullptr, nullptr, &errorMessage);
    
    if (exitCode != SQLITE_OK) {
        std::cerr << "[DB ERROR] Failed to create tables: " << errorMessage << "\n";
        sqlite3_free(errorMessage);
        return false;
    }

    std::cout << "[DB] Tables verified/created successfully.\n";
    return true;
}