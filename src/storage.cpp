#include "../include/storage.hpp"
#include "../include/user_model.hpp"
#include <iostream>
#include <fstream>

void saveUserDataToFile(const std::string& username) {
    auto userIterator = globalUserDatabase.find(username);
    if (userIterator == globalUserDatabase.end()) return;

    std::ofstream outFile(username + "_data.txt");
    if (!outFile.is_open()) return;

    const UserProfile& user = userIterator->second;
    
    outFile << user.username << "\n";
    outFile << user.passwordHash << "\n";
    outFile << user.userRole << "\n";
    
    outFile << (user.codeforcesHandle.empty() ? "None" : user.codeforcesHandle) << "\n";
    outFile << (user.leetcodeHandle.empty() ? "None" : user.leetcodeHandle) << "\n";
    outFile << (user.atcoderHandle.empty() ? "None" : user.atcoderHandle) << "\n";
    
    // Save Targets
    outFile << user.codeforcesTargetRating << " " << user.leetcodeTargetRating << " " << user.atcoderTargetRating << "\n";
    
    outFile << user.codeforcesStats.rating << " " << user.codeforcesStats.totalSolvedCount << "\n";
    outFile << user.leetcodeStats.rating << " " << user.leetcodeStats.totalSolvedCount << "\n";
    outFile << user.atcoderStats.rating << " " << user.atcoderStats.totalSolvedCount << "\n";
    
    outFile << user.progressHistory.size() << "\n";
    for (const auto& snapshot : user.progressHistory) {
        outFile << snapshot.timestamp << " " << snapshot.codeforcesRating << " " 
                << snapshot.leetcodeSolvedCount << " " << snapshot.atcoderRating << "\n";
    }
    
    outFile.close();
    std::cout << "[Storage] Data successfully saved.\n";
}

void loadUserDataFromFile(const std::string& username) {
    std::ifstream inFile(username + "_data.txt");
    if (!inFile.is_open()) return;

    auto userIterator = globalUserDatabase.find(username);
    if (userIterator == globalUserDatabase.end()) return;

    UserProfile& user = userIterator->second;
    std::string tempName;
    
    inFile >> tempName;
    inFile >> user.passwordHash;
    inFile >> user.userRole;
    
    inFile >> user.codeforcesHandle;
    if (user.codeforcesHandle == "None") user.codeforcesHandle = "";
    inFile >> user.leetcodeHandle;
    if (user.leetcodeHandle == "None") user.leetcodeHandle = "";
    inFile >> user.atcoderHandle;
    if (user.atcoderHandle == "None") user.atcoderHandle = "";

    // Load Targets
    inFile >> user.codeforcesTargetRating >> user.leetcodeTargetRating >> user.atcoderTargetRating;

    inFile >> user.codeforcesStats.rating >> user.codeforcesStats.totalSolvedCount;
    inFile >> user.leetcodeStats.rating >> user.leetcodeStats.totalSolvedCount;
    inFile >> user.atcoderStats.rating >> user.atcoderStats.totalSolvedCount;

    size_t historySize;
    if (inFile >> historySize) {
        user.progressHistory.clear();
        for (size_t i = 0; i < historySize; ++i) {
            HistoricalSnapshot snapshot;
            inFile >> snapshot.timestamp >> snapshot.codeforcesRating >> snapshot.leetcodeSolvedCount >> snapshot.atcoderRating;
            user.progressHistory.push_back(snapshot);
        }
    }
    inFile.close();
}