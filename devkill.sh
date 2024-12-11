#!/bin/bash

PID_GO=$(lsof -t -i :4000)
PID_WEBPACK=$(lsof -t -i :35729)

if [ -n "$PID_GO" ]; then
    echo "Killing process with PID: $PID_GO"
    kill -9 $PID_GO
else
    echo "No process is listening on port 4000"
fi

if [ -n "$PID_WEBPACK" ]; then
    echo "Killing process with PID: $PID_WEBPACK"
    kill -9 $PID_WEBPACK
else
    echo "No process is listening on port 35729"
fi
