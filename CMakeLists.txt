# 1. Override strict policies for older downloaded libraries (Fixes your error)
set(CMAKE_POLICY_VERSION_MINIMUM 3.5)

cmake_minimum_required(VERSION 3.14)
project(DevPulse VERSION 1.0)

# 2. Fix the timestamp warning (CMP0135)
if(POLICY CMP0135)
    cmake_policy(SET CMP0135 NEW)
endif()

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED True)

# Enable automatic library downloading
include(FetchContent)

# 3. Download JSON parser
FetchContent_Declare(json URL https://github.com/nlohmann/json/releases/download/v3.11.2/json.tar.xz)
FetchContent_MakeAvailable(json)

# 4. Download CPR (C++ wrapper for libcurl)
FetchContent_Declare(cpr GIT_REPOSITORY https://github.com/libcpr/cpr.git GIT_TAG 1.10.5)
FetchContent_MakeAvailable(cpr)

include_directories(include)

# Grab all .cpp files in the src directory
file(GLOB SOURCES "src/*.cpp")

# 5. Add executable - explicitly including main.cpp and the SQLite .c file!
add_executable(devpulse main.cpp ${SOURCES} src/sqlite3.c)

# 6. Link the downloaded libraries to your app
target_link_libraries(devpulse PRIVATE nlohmann_json::nlohmann_json cpr::cpr)