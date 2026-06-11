#!/bin/bash

docker compose down
docker compose up --build
# docker compose up -d --build

echo "==============================="
echo "SSAMS-AU STARTED"
echo "Website → http://localhost"
echo "API     → http://localhost/api"
echo "==============================="