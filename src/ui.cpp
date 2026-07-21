#include "../include/ui.hpp"
#include "../include/user_model.hpp"
#include <iostream>
#include <string>
#include <vector>
#include <algorithm>
#include <fstream>

// Helper function to draw an ASCII progress bar
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
    auto userIterator = globalUserDatabase.find(username);
    if (userIterator == globalUserDatabase.end()) return;

    const UserProfile& user = userIterator->second;
    const PlatformStats& cfStats = user.codeforcesStats;
    const PlatformStats& lcStats = user.leetcodeStats;
    const PlatformStats& acStats = user.atcoderStats;

    std::cout << "\n===========================================\n";
    std::cout << "             DEVPULSE DASHBOARD            \n";
    std::cout << "===========================================\n";
    std::cout << " User: " << user.username << " | Role: " << user.userRole << "\n";
    std::cout << "-------------------------------------------\n";
    
    std::cout << " [1] CODEFORCES (" << (user.codeforcesHandle.empty() ? "Not Set" : user.codeforcesHandle) << ")\n";
    std::cout << "     Rating:         " << cfStats.rating << "\n";
    std::cout << "     Total Solved:   " << cfStats.totalSolvedCount << "\n";
    std::cout << "-------------------------------------------\n";
    
    std::cout << " [2] LEETCODE (" << (user.leetcodeHandle.empty() ? "Not Set" : user.leetcodeHandle) << ")\n";
    std::cout << "     Contest Rating: " << lcStats.rating << "\n";
    std::cout << "     Total Solved:   " << lcStats.totalSolvedCount << "\n";
    std::cout << "-------------------------------------------\n";
    
    std::cout << " [3] ATCODER (" << (user.atcoderHandle.empty() ? "Not Set" : user.atcoderHandle) << ")\n";
    std::cout << "     Rating:         " << acStats.rating << "\n";
    std::cout << "     Total Solved:   " << acStats.totalSolvedCount << "\n";
    std::cout << "===========================================\n\n";
}

void displayHistory(const std::string& username) {
    auto userIterator = globalUserDatabase.find(username);
    if (userIterator == globalUserDatabase.end()) return;

    const UserProfile& user = userIterator->second;
    const std::vector<HistoricalSnapshot>& history = user.progressHistory;

    std::cout << "\n===========================================\n";
    std::cout << "             PROGRESS HISTORY              \n";
    std::cout << "===========================================\n";

    if (history.empty()) {
        std::cout << " No historical data available yet.\n";
    } else {
        for (size_t i = 0; i < history.size(); ++i) {
            std::cout << " Snapshot [" << i + 1 << "] | Timestamp: " << history[i].timestamp << "\n";
            std::cout << "   CF Rating: " << history[i].codeforcesRating 
                      << " | LC Solved: " << history[i].leetcodeSolvedCount 
                      << " | AC Rating: " << history[i].atcoderRating << "\n";
            std::cout << "-------------------------------------------\n";
        }
    }
    std::cout << "===========================================\n\n";
}

void displayAnalytics(const std::string& username) {
    auto userIterator = globalUserDatabase.find(username);
    if (userIterator == globalUserDatabase.end()) return;

    const UserProfile& user = userIterator->second;
    
    std::cout << "\n===========================================\n";
    std::cout << "           ADVANCED ANALYTICS              \n";
    std::cout << "===========================================\n";

    // --- GOAL TRACKING ---
    std::cout << " --- GOAL TRACKING (RATING PROGRESS) ---\n";
    
    std::cout << " Codeforces (" << user.codeforcesStats.rating << " / " << user.codeforcesTargetRating << ")";
    drawProgressBar(user.codeforcesStats.rating, user.codeforcesTargetRating);
    
    std::cout << " LeetCode   (" << user.leetcodeStats.rating << " / " << user.leetcodeTargetRating << ")";
    drawProgressBar(user.leetcodeStats.rating, user.leetcodeTargetRating);
    
    std::cout << " AtCoder    (" << user.atcoderStats.rating << " / " << user.atcoderTargetRating << ")";
    drawProgressBar(user.atcoderStats.rating, user.atcoderTargetRating);
    std::cout << "\n";

    // --- TOPIC MASTERY ---
    int totalGraph = user.codeforcesStats.graphSolvedCount + user.leetcodeStats.graphSolvedCount + user.atcoderStats.graphSolvedCount;
    int totalDP = user.codeforcesStats.dpSolvedCount + user.leetcodeStats.dpSolvedCount + user.atcoderStats.dpSolvedCount;

    std::cout << " --- TOPIC MASTERY ---\n";
    std::cout << " Graph Problems Solved: " << totalGraph << "\n";
    std::cout << " DP Problems Solved:    " << totalDP << "\n\n";

    // --- RATING GROWTH ---
    std::cout << " --- RATING GROWTH (Since First Login) ---\n";
    if (user.progressHistory.size() > 1) {
        const auto& firstSnapshot = user.progressHistory.front();
        const auto& latestSnapshot = user.progressHistory.back();

        int cfDelta = latestSnapshot.codeforcesRating - firstSnapshot.codeforcesRating;
        int acDelta = latestSnapshot.atcoderRating - firstSnapshot.atcoderRating;

        std::cout << " Codeforces: " << (cfDelta >= 0 ? "+" : "") << cfDelta << " points\n";
        std::cout << " AtCoder:    " << (acDelta >= 0 ? "+" : "") << acDelta << " points\n";
    } else {
        std::cout << " Not enough history to calculate growth yet.\n";
    }
    std::cout << "===========================================\n\n";
}

void displayLeaderboard() {
    std::cout << "\n===========================================\n";
    std::cout << "         DEVPULSE LEADERBOARD              \n";
    std::cout << "===========================================\n";

    if (globalUserDatabase.empty()) {
        std::cout << " No users registered in memory.\n";
        std::cout << "===========================================\n\n";
        return;
    }

    std::vector<UserProfile> rankList;
    for (const auto& pair : globalUserDatabase) {
        rankList.push_back(pair.second);
    }

    // Sort by combined total solved count
    std::sort(rankList.begin(), rankList.end(), [](const UserProfile& a, const UserProfile& b) {
        int totalA = a.codeforcesStats.totalSolvedCount + a.leetcodeStats.totalSolvedCount;
        int totalB = b.codeforcesStats.totalSolvedCount + b.leetcodeStats.totalSolvedCount;
        return totalA > totalB;
    });

    int rank = 1;
    for (const auto& user : rankList) {
        int totalSolved = user.codeforcesStats.totalSolvedCount + user.leetcodeStats.totalSolvedCount;
        std::cout << " " << rank++ << ". " << user.username 
                  << " | Total Solved: " << totalSolved 
                  << " | CF Rating: " << user.codeforcesStats.rating << "\n";
    }
    std::cout << "===========================================\n\n";
}

void configureHandles(const std::string& username) {
    auto userIterator = globalUserDatabase.find(username);
    if (userIterator == globalUserDatabase.end()) return;
    
    UserProfile& user = userIterator->second;
    
    std::cout << "\n--- PROFILE SETTINGS ---\n";
    std::cout << "Enter Codeforces handle (current: " << (user.codeforcesHandle.empty() ? "None" : user.codeforcesHandle) << "): ";
    std::cin >> user.codeforcesHandle;
    std::cout << "Enter LeetCode handle (current: " << (user.leetcodeHandle.empty() ? "None" : user.leetcodeHandle) << "): ";
    std::cin >> user.leetcodeHandle;
    std::cout << "Enter AtCoder handle (current: " << (user.atcoderHandle.empty() ? "None" : user.atcoderHandle) << "): ";
    std::cin >> user.atcoderHandle;
    
    std::cout << "[Settings] Handles updated successfully!\n";
}

void setTargetGoals(const std::string& username) {
    auto userIterator = globalUserDatabase.find(username);
    if (userIterator == globalUserDatabase.end()) return;
    
    UserProfile& user = userIterator->second;
    
    std::cout << "\n--- SET TARGET GOALS ---\n";
    std::cout << "Set Codeforces target rating (current: " << user.codeforcesTargetRating << "): ";
    std::cin >> user.codeforcesTargetRating;
    std::cout << "Set LeetCode target rating (current: " << user.leetcodeTargetRating << "): ";
    std::cin >> user.leetcodeTargetRating;
    std::cout << "Set AtCoder target rating (current: " << user.atcoderTargetRating << "): ";
    std::cin >> user.atcoderTargetRating;
    
    std::cout << "[Goals] Targets saved! Check your Analytics dashboard to see your progress.\n";
}

void exportProfileReport(const std::string& username) {
    auto userIterator = globalUserDatabase.find(username);
    if (userIterator == globalUserDatabase.end()) return;

    const UserProfile& user = userIterator->second;
    std::string filename = username + "_report.md";
    std::ofstream outFile(filename);

    if (!outFile.is_open()) {
        std::cout << "[Export Error] Could not create report file.\n";
        return;
    }

    int totalSolved = user.codeforcesStats.totalSolvedCount + 
                      user.leetcodeStats.totalSolvedCount + 
                      user.atcoderStats.totalSolvedCount;

    outFile << "# DevPulse Competitor Report\n\n";
    outFile << "**Username:** " << user.username << "\n";
    outFile << "**Total Problems Solved:** " << totalSolved << "\n\n";
    
    outFile << "## Current Standings\n";
    outFile << "- **Codeforces:** " << user.codeforcesStats.rating << " rating\n";
    outFile << "- **LeetCode:** " << user.leetcodeStats.rating << " rating\n";
    outFile << "- **AtCoder:** " << user.atcoderStats.rating << " rating\n\n";
    
    outFile << "## Goals\n";
    outFile << "- Codeforces Target: " << user.codeforcesTargetRating << "\n";
    outFile << "- LeetCode Target: " << user.leetcodeTargetRating << "\n";
    outFile << "- AtCoder Target: " << user.atcoderTargetRating << "\n\n";

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
    std::cout << "8. Get Smart Training Recommendations\n"; // NEW
    std::cout << "9. Export Profile Report (Markdown)\n"; // Shifted to 9
    std::cout << "10. Exit\n"; // Shifted to 10
    std::cout << "Select an option: ";
}