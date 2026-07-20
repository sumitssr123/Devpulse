#include "../include/auth.hpp"
#include "../include/user_model.hpp"
#include "iostream"
#include "string"
#include "functional"
#include "sstream"
#include "iomanip"

std::string hashPassword(const std::string& password) {
    // Standard C++ hash function template
    std::hash<std::string> hasher;
    size_t hashVal = hasher(password);
    
    // Convert numeric hash into a 16-character hexadecimal string
    std::stringstream ss;
    ss << std::hex << std::setfill('0') << std::setw(16) << hashVal;
    return ss.str();
}

bool registerUser(const std::string& username, const std::string& password) {
    // O(1) Check: Is the username already in our hash map?
    if (globalUserDatabase.find(username) != globalUserDatabase.end()) {
        std::cout << "[Auth Error] Username '" << username << "' is already taken.\n";
        return false; 
    }

    UserProfile newUser;
    newUser.username = username;
    newUser.passwordHash = hashPassword(password);
    newUser.userRole = "user";

    globalUserDatabase[username] = newUser;
    std::cout << "[Auth Success] User '" << username << "' registered successfully.\n";
    return true;
}

bool loginUser(const std::string& username, const std::string& password) {
    // O(1) Lookup: Locate user in global map
    auto it = globalUserDatabase.find(username);
    
    if (it == globalUserDatabase.end()) {
        std::cout << "[Auth Error] User '" << username << "' not found.\n";
        return false;
    }

    std::string enteredHash = hashPassword(password);
    if (it->second.passwordHash == enteredHash) {
        std::cout << "[Auth Success] Login granted for '" << username << "'.\n";
        return true;
    } else {
        std::cout << "[Auth Error] Incorrect password for '" << username << "'.\n";
        return false;
    }
}