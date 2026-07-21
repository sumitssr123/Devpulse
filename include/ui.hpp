#ifndef UI_HPP
#define UI_HPP

#include <string>

void displayDashboard(const std::string& username);
void displayHistory(const std::string& username);
void displayAnalytics(const std::string& username);
void displayLeaderboard(); 
void configureHandles(const std::string& username);
void setTargetGoals(const std::string& username); 
void exportProfileReport(const std::string& username); 
void showMenu();

#endif