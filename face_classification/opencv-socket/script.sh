#!/bin/bash
mprof run --python python3 "server.py" & sleep 4; ./client;
