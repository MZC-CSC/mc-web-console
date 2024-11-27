#!/bin/bash
trap 'cleanup' SIGINT

pids=()

cleanup() {
    echo "Terminating processes..."
    for pid in "${pids[@]}"; do
        echo "Killing process $pid"
        kill -9 "$pid" 2>/dev/null
    done
    exit 0
}

# Check if 'air' is installed
if ! command -v air &> /dev/null; then
    echo "'air' not found. Installing..."
    go install github.com/cosmtrek/air@v1.40.0
    export PATH=$(go env GOPATH)/bin:$PATH
    echo "Verifying 'air' installation..."
    if ! command -v air &> /dev/null; then
        echo "Failed to install 'air'. Exiting."
        exit 1
    fi
fi

echo "Starting npm run dev in ./front..."
(
    cd ./front || exit
    npm run dev
) &
pids+=($!) 

echo "Starting air in ./api..."
(
    cd ./api || exit
    air
) &
pids+=($!) 

wait
