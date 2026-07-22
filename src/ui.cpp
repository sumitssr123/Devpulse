#include "../include/ui.hpp"
#include "../include/user_model.hpp"
#include "../include/api_service.hpp"
#include "../include/database.hpp" 
#include <iostream>
#include <string>
#include <vector>
#include <algorithm>
#include <fstream>
#include <iomanip> // <-- Added for std::setw to format the leaderboard table

void drawProgressBar(int current, int target) {
    if (target <= 0) {
        std::cout << " [ Target not set ]\n";
        return;
    }
    
    int barWidth = 20;
    double progress = static_cast<double>(current) / target;
    if (progress > 1.0) progress = 1.0; 
    if (progress < 0.0) progress = 0.0;
    
    int completedWidth = static_cast<int>(barWidth * progress);
    
    std::cout << " [";
    for (int i = 0; i < barWidth; ++i) {
        if (i < completedWidth) std::cout << "=";
        else if (i == completedWidth) std::cout << ">";
        else std::cout << " ";
    }
    std::cout << "] " << static_cast<int>(progress * 100.0) << "%\n";
}

void displayDashboard(const std::string& username) {
    UserData user = getUserDataFromDB(username);
    PlatformStats cfStats = fetchCodeforcesData(user.cf_handle);
    PlatformStats lcStats = fetchLeetcodeData(user.lc_handle);
    PlatformStats acStats = fetchAtcoderData(user.ac_handle);

    saveProgressSnapshot(username, cfStats.rating, cfStats.totalSolvedCount, 
                         lcStats.rating, lcStats.totalSolvedCount, 
                         acStats.rating, acStats.totalSolvedCount);

    std::cout << "\n===========================================\n";
    std::cout << "            DEVPULSE DASHBOARD             \n";
    std::cout << "===========================================\n";
    std::cout << " User: " << username << " | Role: Competitor\n";
    std::cout << "-------------------------------------------\n";
    
    std::cout << " [1] CODEFORCES (" << (user.cf_handle.empty() ? "Not Set" : user.cf_handle) << ")\n";
    std::cout << "     Rating:         " << cfStats.rating << "\n";
    std::cout << "     Total Solved:   " << cfStats.totalSolvedCount << "\n";
    std::cout << "-------------------------------------------\n";
    
    std::cout << " [2] LEETCODE (" << (user.lc_handle.empty() ? "Not Set" : user.lc_handle) << ")\n";
    std::cout << "     Contest Rating: " << lcStats.rating << "\n";
    std::cout << "     Total Solved:   " << lcStats.totalSolvedCount << "\n";
    std::cout << "-------------------------------------------\n";
    
    std::cout << " [3] ATCODER (" << (user.ac_handle.empty() ? "Not Set" : user.ac_handle) << ")\n";
    std::cout << "     Rating:         " << acStats.rating << "\n";
    std::cout << "     Total Solved:   " << acStats.totalSolvedCount << "\n";
    std::cout << "===========================================\n\n";
}

void displayHistory(const std::string& username) {
    std::cout << "\n===========================================\n";
    std::cout << "            PROGRESS HISTORY               \n";
    std::cout << "===========================================\n";
    
    std::vector<HistorySnapshot> history = getHistorySnapshots(username);
    
    if (history.empty()) {
        std::cout << " [INFO] No history found yet.\n";
        std::cout << " View your Dashboard (Option 1) to generate your first snapshot!\n";
    } else {
        for (const auto& snap : history) {
            std::cout << " [" << snap.timestamp << "]\n";
            std::cout << "   CF: " << snap.cf_rating << " rating | " << snap.cf_solved << " solved\n";
            std::cout << "   LC: " << snap.lc_rating << " rating | " << snap.lc_solved << " solved\n";
            std::cout << "   AC: " << snap.ac_rating << " rating | " << snap.ac_solved << " solved\n";
            std::cout << " ------------------------------------------\n";
        }
    }
    std::cout << "===========================================\n\n";
}

void displayAnalytics(const std::string& username) {
    UserData user = getUserDataFromDB(username);
    PlatformStats cfStats = fetchCodeforcesData(user.cf_handle);
    PlatformStats lcStats = fetchLeetcodeData(user.lc_handle);
    PlatformStats acStats = fetchAtcoderData(user.ac_handle);
    
    TargetGoals goals = getTargetGoals(username);
    int codeforcesTargetRating = goals.cf_target;
    int leetcodeTargetRating = goals.lc_target;
    int atcoderTargetRating = goals.ac_target;

    std::cout << "\n===========================================\n";
    std::cout << "            ADVANCED ANALYTICS             \n";
    std::cout << "===========================================\n";

    std::cout << " --- GOAL TRACKING (RATING PROGRESS) ---\n";
    
    std::cout << " Codeforces (" << cfStats.rating << " / " << codeforcesTargetRating << ")";
    drawProgressBar(cfStats.rating, codeforcesTargetRating);
    
    std::cout << " LeetCode   (" << lcStats.rating << " / " << leetcodeTargetRating << ")";
    drawProgressBar(lcStats.rating, leetcodeTargetRating);
    
    std::cout << " AtCoder    (" << acStats.rating << " / " << atcoderTargetRating << ")";
    drawProgressBar(acStats.rating, atcoderTargetRating);
    std::cout << "\n";

    int totalGraph = cfStats.graphSolvedCount + lcStats.graphSolvedCount + acStats.graphSolvedCount;
    int totalDP = cfStats.dpSolvedCount + lcStats.dpSolvedCount + acStats.dpSolvedCount;

    std::cout << " --- TOPIC MASTERY ---\n";
    std::cout << " Graph Problems Solved: " << totalGraph << "\n";
    std::cout << " DP Problems Solved:    " << totalDP << "\n\n";
    std::cout << "===========================================\n\n";
}

// --- UPDATED LEADERBOARD UI ---
void displayLeaderboard() {
    std::cout << "\n======================================================\n";
    std::cout << "                DEVPULSE LEADERBOARD                  \n";
    std::cout << "======================================================\n";
    
    std::vector<LeaderboardEntry> board = getLeaderboard();
    
    if (board.empty()) {
        std::cout << " [INFO] No data available for leaderboard yet.\n";
        std::cout << " (Users need to view their Dashboard to log data!)\n";
    } else {
        std::cout << std::left << " " << std::setw(5) << "Rank" 
                  << "| " << std::setw(15) << "Username" 
                  << "| " << std::setw(15) << "Total Solved" 
                  << "| " << "Total Rating\n";
        std::cout << " -----------------------------------------------------\n";
        
        int rank = 1;
        for (const auto& entry : board) {
            std::cout << " #" << std::left << std::setw(4) << rank++ 
                      << "| " << std::setw(15) << entry.username 
                      << "| " << std::setw(15) << entry.total_solved 
                      << "| " << entry.total_rating << "\n";
        }
    }
    std::cout << "======================================================\n\n";
}

void configureHandles(const std::string& username) {
    std::string cf_input, lc_input, ac_input;
    
    std::cout << "\n--- PROFILE SETTINGS ---\n";
    std::cout << "Enter Codeforces handle: ";
    std::cin >> cf_input;
    std::cout << "Enter LeetCode handle: ";
    std::cin >> lc_input;
    std::cout << "Enter AtCoder handle: ";
    std::cin >> ac_input;
    
    if (updateHandlesInDB(username, cf_input, lc_input, ac_input)) {
        std::cout << "[Settings] Handles safely updated in Database!\n";
    }
}

void setTargetGoals(const std::string& username) {
    int cf, lc, ac;
    std::cout << "\n--- SET TARGET GOALS ---\n";
    std::cout << "Codeforces Target Rating: ";
    std::cin >> cf;
    std::cout << "LeetCode Target Rating: ";
    std::cin >> lc;
    std::cout << "AtCoder Target Rating: ";
    std::cin >> ac;

    if (updateTargetGoals(username, cf, lc, ac)) {
        std::cout << "[SUCCESS] Target goals saved to database successfully!\n";
    } else {
        std::cout << "[ERROR] Failed to update goals in the database.\n";
    }
}

void exportProfileReport(const std::string& username) {
    UserData user = getUserDataFromDB(username);
    PlatformStats cfStats = fetchCodeforcesData(user.cf_handle);
    PlatformStats lcStats = fetchLeetcodeData(user.lc_handle);
    PlatformStats acStats = fetchAtcoderData(user.ac_handle);
    
    std::string filename = username + "_report.md";
    std::ofstream outFile(filename);

    if (!outFile.is_open()) {
        std::cout << "[Export Error] Could not create report file.\n";
        return;
    }

    int totalSolved = cfStats.totalSolvedCount + lcStats.totalSolvedCount + acStats.totalSolvedCount;

    outFile << "# DevPulse Competitor Report\n\n";
    outFile << "**Username:** " << username << "\n";
    outFile << "**Total Problems Solved:** " << totalSolved << "\n\n";
    
    outFile << "## Current Standings\n";
    outFile << "- **Codeforces:** " << cfStats.rating << " rating\n";
    outFile << "- **LeetCode:** " << lcStats.rating << " rating\n";
    outFile << "- **AtCoder:** " << acStats.rating << " rating\n\n";
    
    outFile << "> Generated automatically by DevPulse CLI.\n";

    outFile.close();
    std::cout << "[Export Success] Profile successfully exported to " << filename << "\n";
}

void showMenu() {
    std::cout << "\n--- MAIN MENU ---\n";
    std::cout << "1. View Dashboard\n";
    std::cout << "2. View Progress History\n";
    std::cout << "3. View Analytics & Goals\n"; 
    std::cout << "4. View Leaderboard\n"; 
    std::cout << "5. Refresh All Platform Data\n";
    std::cout << "6. Profile Settings (Set Handles)\n";
    std::cout << "7. Set Target Goals\n"; 
    std::cout << "8. Get Smart Training Recommendations\n";
    std::cout << "9. Export Profile Report (Markdown)\n";
    std::cout << "10. Exit\n";
    std::cout << "Select an option: ";
}