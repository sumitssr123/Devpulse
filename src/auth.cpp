#include "../include/auth.hpp"
#include "sqlite3.h"
#include <iostream>

bool registerUser(const std::string& username, const std::string& password) {
    sqlite3* db;
    // Open the database
    if (sqlite3_open("devpulse.db", &db) != SQLITE_OK) {
        std::cerr << "[ERROR] Could not open database.\n";
        return false;
    }

    // Create the SQL query to insert the new user
    std::string sql = "INSERT INTO USERS (username, password) VALUES ('" + username + "', '" + password + "');";
    char* errMsg = nullptr;
    
    // Execute the query
    int rc = sqlite3_exec(db, sql.c_str(), nullptr, nullptr, &errMsg);

    if (rc != SQLITE_OK) {
        std::cerr << "[ERROR] Username might already exist or DB error: " << errMsg << "\n";
        sqlite3_free(errMsg);
        sqlite3_close(db);
        return false;
    }

    sqlite3_close(db);
    return true;
}

bool loginUser(const std::string& username, const std::string& password) {
    sqlite3* db;
    if (sqlite3_open("devpulse.db", &db) != SQLITE_OK) return false;

    // Create the SQL query to find the user
    std::string sql = "SELECT 1 FROM USERS WHERE username = '" + username + "' AND password = '" + password + "';";
    sqlite3_stmt* stmt;
    
    // Prepare the query safely
    int rc = sqlite3_prepare_v2(db, sql.c_str(), -1, &stmt, nullptr);

    bool success = false;
    if (rc == SQLITE_OK) {
        // If sqlite3_step returns a row, the user exists!
        if (sqlite3_step(stmt) == SQLITE_ROW) {
            success = true; 
        }
    }
    
    sqlite3_finalize(stmt);
    sqlite3_close(db);
    
    if (!success) {
        std::cerr << "[ERROR] Invalid username or password.\n";
    }
    return success;
}