#pragma once
#include <string>
#include "sqlite3.h"

class DatabaseManager {
private:
    sqlite3* db;
    std::string db_name;

public:
    DatabaseManager(const std::string& dbName);
    ~DatabaseManager();
    bool initialize();
};