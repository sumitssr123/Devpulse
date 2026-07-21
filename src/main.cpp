#include <iostream>
#include <string>
#include <unordered_map>
#include "user_model.hpp"
#include "auth.hpp"
#include "cache.hpp"
#include "ui.hpp"
#include "storage.hpp"
#include "recommender.hpp"
#include "api_service.hpp" // FIX: Added missing header for fetchUserStats

std::unordered_map<std::string, UserProfile> globalUserDatabase;

int main() {
    std::cout << "===========================================\n";
    std::cout << "          Welcome to DevPulse CLI          \n";
    std::cout << "===========================================\n\n";

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
            
            UserProfile dummyUser;
            dummyUser.username = activeUsername;
            globalUserDatabase[activeUsername] = dummyUser;
            loadUserDataFromFile(activeUsername);

            if (loginUser(activeUsername, currentPassword)) {
                break; 
            }
        } 
        else if (authChoice == 2) {
            std::cout << "Choose a Username: ";
            std::cin >> activeUsername;
            std::cout << "Choose a Password: ";
            std::cin >> currentPassword;
            
            if (registerUser(activeUsername, currentPassword)) {
                UserProfile dummyUser;
                dummyUser.username = activeUsername;
                globalUserDatabase[activeUsername] = dummyUser;
                loadUserDataFromFile(activeUsername);
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
            displayDashboard(activeUsername);
        } else if (userChoice == 2) {
            displayHistory(activeUsername);
        } else if (userChoice == 3) {
            displayAnalytics(activeUsername);
        } else if (userChoice == 4) {
            displayLeaderboard(); 
        } else if (userChoice == 5) {
            fetchUserStats(activeUsername);
        } else if (userChoice == 6) {
            configureHandles(activeUsername);
        } else if (userChoice == 7) {
            setTargetGoals(activeUsername);
        } else if (userChoice == 8) {
            generateRecommendations(activeUsername);
        } else if (userChoice == 9) {
            exportProfileReport(activeUsername);
        } else if (userChoice == 10) {
            saveUserDataToFile(activeUsername);
            std::cout << "Session saved. Exiting DevPulse. Goodbye!\n";
            break;
        } else {
            std::cout << "Invalid option. Please try again.\n";
        }
    }

    return 0;
}