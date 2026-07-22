#include "../include/recommender.hpp"
#include "../include/user_model.hpp"
#include "../include/api_service.hpp"
#include "../include/database.hpp" // <-- DB Integration
#include <iostream>
#include <string>

void generateRecommendations(const std::string& username) {
    UserData user = getUserDataFromDB(username);
    PlatformStats cfStats = fetchCodeforcesData(user.cf_handle);
    PlatformStats lcStats = fetchLeetcodeData(user.lc_handle);
    PlatformStats acStats = fetchAtcoderData(user.ac_handle);
    
    // Placeholder until you add target ratings to SQLite schema
    int codeforcesTargetRating = 1600; 
    
    std::cout << "\n===========================================\n";
    std::cout << "        SMART TRAINING RECOMMENDER         \n";
    std::cout << "===========================================\n";

    // 1. Target Goal Analysis
    std::cout << " [ TARGET ANALYSIS ]\n";
    if (codeforcesTargetRating > 0) {
        int cfDeficit = codeforcesTargetRating - cfStats.rating;
        if (cfDeficit > 0) {
            std::cout << " - Codeforces: You need " << cfDeficit << " more points to reach your goal.\n";
            std::cout << "   Recommendation: Focus on Div2 B and C problems to build speed.\n";
        } else {
            std::cout << " - Codeforces: GOAL REACHED! Time to set a higher target.\n";
        }
    } else {
        std::cout << " - Codeforces: No target set. (Use Option 7 to set goals)\n";
    }

    // 2. Topic Mastery Analysis
    std::cout << "\n [ TOPIC MASTERY ]\n";
    int totalGraph = cfStats.graphSolvedCount + lcStats.graphSolvedCount + acStats.graphSolvedCount;
    int totalDP = cfStats.dpSolvedCount + lcStats.dpSolvedCount + acStats.dpSolvedCount;
    int totalSolved = cfStats.totalSolvedCount + lcStats.totalSolvedCount + acStats.totalSolvedCount;

    if (totalSolved == 0) {
        std::cout << " - Not enough data. Go solve some problems!\n";
    } else {
        if (totalDP < totalGraph) {
            std::cout << " - Weakness Detected: Dynamic Programming (DP).\n";
            std::cout << "   Action: You've solved more Graph problems (" << totalGraph << ") than DP (" << totalDP << ").\n";
            std::cout << "   Recommendation: Spend the next 3 days doing classical DP concepts (Knapsack, LCS).\n";
        } else if (totalGraph < totalDP) {
            std::cout << " - Weakness Detected: Graph Theory.\n";
            std::cout << "   Action: You've solved more DP problems (" << totalDP << ") than Graphs (" << totalGraph << ").\n";
            std::cout << "   Recommendation: Practice BFS/DFS on grids and basic Shortest Path algorithms.\n";
        } else {
            std::cout << " - Balanced Profile: Your Graph and DP skills are perfectly balanced!\n";
            std::cout << "   Recommendation: Start learning Advanced Data Structures (Segment Trees, Tries).\n";
        }
    }

    std::cout << "===========================================\n\n";
}