#include "iostream"
#include "string"
#include "unordered_map"
#include "../include/user_model.hpp"
#include "../include/auth.hpp"

// Allocate memory for the global map declared in user_model.hpp
std::unordered_map<std::string, UserProfile> globalUserDatabase;

int main() {
    std::cout << "===========================================\n";
    std::cout << "       DevPulse Security Module Test       \n";
    std::cout << "===========================================\n\n";

    // 1. Register a new user
    registerUser("sumit_coder", "mySecretPass123!");

    // 2. Attempt registering the exact same username again (Should Fail)
    registerUser("sumit_coder", "differentPassword");

    // 3. Attempt login with an incorrect password (Should Fail)
    loginUser("sumit_coder", "wrongPass");

    // 4. Attempt login with the correct password (Should Succeed)
    loginUser("sumit_coder", "mySecretPass123!");

    return 0;
}