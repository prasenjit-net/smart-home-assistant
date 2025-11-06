#!/bin/bash

# Smart Home Assistant Test Script
# This script demonstrates various commands you can send to the assistant

BASE_URL="http://localhost:3000"

echo "🏠 Smart Home Assistant - Test Commands"
echo "========================================"
echo ""

# Check if server is running
echo "1. Health Check"
curl -s "$BASE_URL/assistant/health" | json_pp
echo ""
echo ""

# List all devices
echo "2. List All Devices"
curl -s "$BASE_URL/assistant/devices" | json_pp
echo ""
echo ""

# Send a text command - List devices
echo "3. Text Command: What devices are in the living room?"
curl -s -X POST "$BASE_URL/assistant/command/text" \
  -H "Content-Type: application/json" \
  -d '{"message": "What devices are in the living room?"}' | json_pp
echo ""
echo ""

# Send a text command - Turn on light
echo "4. Text Command: Turn on the living room light"
curl -s -X POST "$BASE_URL/assistant/command/text" \
  -H "Content-Type: application/json" \
  -d '{"message": "Turn on the living room light"}' | json_pp
echo ""
echo ""

# Send a text command - Check status
echo "5. Text Command: What is the status of light-1?"
curl -s -X POST "$BASE_URL/assistant/command/text" \
  -H "Content-Type: application/json" \
  -d '{"message": "What is the status of light-1?"}' | json_pp
echo ""
echo ""

# Send a text command - Set brightness
echo "6. Text Command: Set the living room light to 75% brightness"
curl -s -X POST "$BASE_URL/assistant/command/text" \
  -H "Content-Type: application/json" \
  -d '{"message": "Set the living room light to 75% brightness"}' | json_pp
echo ""
echo ""

# Send a text command - Check temperature
echo "7. Text Command: What is the temperature in the living room?"
curl -s -X POST "$BASE_URL/assistant/command/text" \
  -H "Content-Type: application/json" \
  -d '{"message": "What is the temperature in the living room?"}' | json_pp
echo ""
echo ""

# Send a text command - Set thermostat
echo "8. Text Command: Set the thermostat to 24 degrees"
curl -s -X POST "$BASE_URL/assistant/command/text" \
  -H "Content-Type: application/json" \
  -d '{"message": "Set the thermostat to 24 degrees"}' | json_pp
echo ""
echo ""

echo "✅ Test commands completed!"
echo ""
echo "To test audio commands, use:"
echo "curl -X POST $BASE_URL/assistant/command/audio -F \"audio=@your-audio-file.wav\""
