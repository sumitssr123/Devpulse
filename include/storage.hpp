#ifndef STORAGE_HPP
#define STORAGE_HPP

#include <string>

void saveUserDataToFile(const std::string& username);
void loadUserDataFromFile(const std::string& username);

#endif