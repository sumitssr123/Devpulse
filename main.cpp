#include <iostream>
#include <string>
// #include <unordered_map> <-- [CLEANUP] Removed!
#include "user_model.hpp"
#include "auth.hpp"
#include "cache.hpp"
#include "ui.hpp"
// #include "storage.hpp"  <-- We are removing this! No more flat-files.
#include "recommender.hpp"
#include "api_service.hpp"
#include "database_manager.hpp" // <-- Include your new SQLite manager
#include "../include/database.hpp" // <-- Your new DB functions

int main() {
    std::cout << "===========================================\n";
    std::cout << "          Welcome to DevPulse CLI          \n";
    std::cout << "===========================================\n\n";

    // 1. Initialize SQLite Database
    std::cout << "[SYSTEM] Booting up SQLite database...\n";
    DatabaseManager dbManager("devpulse.db");
    if (!dbManager.initialize()) {
        std::cerr << "[FATAL] Failed to initialize database. Exiting.\n";
        return 1;
    }
    std::cout << "[SYSTEM] Database ready.\n\n";

    std::string activeUsername;
    std::string currentPassword;
    int authChoice;

    while (true) {
        std::cout << "1. Login\n";
        std::cout << "2. Register\n";
        std::cout << "3. Exit System\n";
        std::cout << "Select option: ";
        std::cin >> authChoice;

        if (authChoice == 1) {
            std::cout << "Username: ";
            std::cin >> activeUsername;
            std::cout << "Password: ";
            std::cin >> currentPassword;
            
            // Login now strictly relies on SQLite (auth.cpp)
            if (loginUser(activeUsername, currentPassword)) {
                // [CLEANUP] globalUserDatabase code deleted from here!
                break; 
            }
        } 
        else if (authChoice == 2) {
            std::cout << "Choose a Username: ";
            std::cin >> activeUsername;
            std::cout << "Choose a Password: ";
            std::cin >> currentPassword;
            
            // Register now strictly relies on SQLite (auth.cpp)
            if (registerUser(activeUsername, currentPassword)) {
                // [CLEANUP] globalUserDatabase code deleted from here!
                break;
            }
        } 
        else if (authChoice == 3) {
            std::cout << "Shutting down DevPulse...\n";
            return 0;
        } 
        else {
            std::cout << "Invalid input. Please try again.\n";
        }
    }

    std::cout << "\nPreparing environment for " << activeUsername << "...\n";
    fetchUserStats(activeUsername);

    int userChoice; 
    while (true) {
        showMenu();
        std::cin >> userChoice;

        if (userChoice == 1) {
            // [NEW] DASHBOARD INTEGRATION
            UserData userStats = getUserDataFromDB(activeUsername);
            
            std::cout << "===========================================\n";
            std::cout << "             DEVPULSE DASHBOARD            \n";
            std::cout << "===========================================\n";
            std::cout << " User: " << activeUsername << " \n";
            std::cout << "-------------------------------------------\n";
            std::cout << " [1] CODEFORCES (" << userStats.cf_handle << ")\n";
            std::cout << " [2] LEETCODE (" << userStats.lc_handle << ")\n";
            std::cout << " [3] ATCODER (" << userStats.ac_handle << ")\n";
            std::cout << "===========================================\n";
            
        } else if (userChoice == 2) {
            displayHistory(activeUsername);
        } else if (userChoice == 3) {
            displayAnalytics(activeUsername);
        } else if (userChoice == 4) {
            displayLeaderboard(); 
        }  else if (userChoice == 5) {
            // 1. Get handles from the database first
            UserData userStats = getUserDataFromDB(activeUsername);

            // 2. Fetch live data using those handles
            PlatformStats cfStats = fetchCodeforcesData(userStats.cf_handle);
            PlatformStats lcStats = fetchLeetcodeData(userStats.lc_handle);
            PlatformStats acStats = fetchAtcoderData(userStats.ac_handle);
            
            // 3. Save the REAL live data to the SQLite database
            saveProgressSnapshot(
                activeUsername, 
                cfStats.rating, cfStats.totalSolvedCount, 
                lcStats.rating, lcStats.totalSolvedCount, 
                acStats.rating, acStats.totalSolvedCount
            );
            
            std::cout << "[Cache Update] Fresh stats saved to Database. History snapshot recorded.\n";

        } else if (userChoice == 6) {
            // [NEW] PROFILE SETTINGS INTEGRATION
            std::string cf_input, lc_input, ac_input;
            std::cout << "Enter Codeforces handle: ";
            std::cin >> cf_input;
            std::cout << "Enter LeetCode handle: ";
            std::cin >> lc_input;
            std::cout << "Enter AtCoder handle: ";
            std::cin >> ac_input;

            if (updateHandlesInDB(activeUsername, cf_input, lc_input, ac_input)) {
                std::cout << "[Settings] Handles securely saved to SQLite Database!\n";
            }

        } else if (userChoice == 7) {
            setTargetGoals(activeUsername);
        } else if (userChoice == 8) {
            generateRecommendations(activeUsername);
        } else if (userChoice == 9) {
            exportProfileReport(activeUsername);
        } else if (userChoice == 10) {
            // [CLEANUP] saveUserDataToFile() removed completely.
            std::cout << "Session saved securely to SQLite. Exiting DevPulse. Goodbye!\n";
            break;
        } else {
            std::cout << "Invalid option. Please try again.\n";
        }
    }

    return 0;
}