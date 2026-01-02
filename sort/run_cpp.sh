#!/bin/zsh

# Check if file argument is provided
if [ $# -eq 0 ]; then
    echo "Usage: $0 <cpp_file> [additional arguments for the program]"
    exit 1
fi

# Get the C++ file name
CPP_FILE="$1"
shift  # Remove first argument, remaining args are for the compiled program

# Check if file exists
if [ ! -f "$CPP_FILE" ]; then
    echo "Error: File '$CPP_FILE' not found"
    exit 1
fi

# Get the base name without extension
BASE_NAME="${CPP_FILE:r}"

# Compile the C++ file
echo "Compiling $CPP_FILE..."
g++ -std=c++17 -Wall -o "$BASE_NAME" "$CPP_FILE"

# Check if compilation was successful
if [ $? -eq 0 ]; then
    echo "Compilation successful!"
    echo "Running $BASE_NAME..."
    echo "-------------------"
    ./"$BASE_NAME" "$@"
else
    echo "Compilation failed!"
    exit 1
fi
