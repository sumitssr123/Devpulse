#ifndef AUTH_HPP
#define AUTH_HPP

#include "string"

// Converts a plain text password into a secure hash string
std::string hashPassword(const std::string& password);

// Registers a new user. Returns true if successful, false if username exists.
bool registerUser(const std::string& username, const std::string& password);

// Verifies login credentials. Returns true if password is correct.
bool loginUser(const std::string& username, const std::string& password);

#endif // AUTH_HPP