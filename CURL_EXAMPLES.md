# Sample cURL Commands for Testing

## Health Check
curl http://localhost:3000/assistant/health

## List All Devices
curl http://localhost:3000/assistant/devices

## List All Sensors
curl http://localhost:3000/assistant/sensors

## List All Areas
curl http://localhost:3000/assistant/areas

## Text Commands

# Query devices in an area
curl -X POST http://localhost:3000/assistant/command/text \
  -H "Content-Type: application/json" \
  -d '{"message": "What devices are in the living room?"}'

# Turn on a light
curl -X POST http://localhost:3000/assistant/command/text \
  -H "Content-Type: application/json" \
  -d '{"message": "Turn on the living room light"}'

# Turn off a light
curl -X POST http://localhost:3000/assistant/command/text \
  -H "Content-Type: application/json" \
  -d '{"message": "Turn off the living room light"}'

# Set light brightness
curl -X POST http://localhost:3000/assistant/command/text \
  -H "Content-Type: application/json" \
  -d '{"message": "Set the bedroom lamp to 75% brightness"}'

# Check device status
curl -X POST http://localhost:3000/assistant/command/text \
  -H "Content-Type: application/json" \
  -d '{"message": "What is the status of light-1?"}'

# Check temperature
curl -X POST http://localhost:3000/assistant/command/text \
  -H "Content-Type: application/json" \
  -d '{"message": "What is the temperature in the living room?"}'

# Set thermostat
curl -X POST http://localhost:3000/assistant/command/text \
  -H "Content-Type: application/json" \
  -d '{"message": "Set the thermostat to 24 degrees"}'

# Lock door
curl -X POST http://localhost:3000/assistant/command/text \
  -H "Content-Type: application/json" \
  -d '{"message": "Lock the front door"}'

# Unlock door
curl -X POST http://localhost:3000/assistant/command/text \
  -H "Content-Type: application/json" \
  -d '{"message": "Unlock the front door"}'

# Check door status
curl -X POST http://localhost:3000/assistant/command/text \
  -H "Content-Type: application/json" \
  -d '{"message": "Is the front door locked?"}'

# Turn on fan
curl -X POST http://localhost:3000/assistant/command/text \
  -H "Content-Type: application/json" \
  -d '{"message": "Turn on the bedroom fan"}'

# Set fan speed
curl -X POST http://localhost:3000/assistant/command/text \
  -H "Content-Type: application/json" \
  -d '{"message": "Set the bedroom fan to 60% speed"}'

# List all devices
curl -X POST http://localhost:3000/assistant/command/text \
  -H "Content-Type: application/json" \
  -d '{"message": "Show me all devices"}'

# List devices in multiple areas
curl -X POST http://localhost:3000/assistant/command/text \
  -H "Content-Type: application/json" \
  -d '{"message": "What devices are in the bedroom?"}'

# Check humidity
curl -X POST http://localhost:3000/assistant/command/text \
  -H "Content-Type: application/json" \
  -d '{"message": "What is the humidity in the bathroom?"}'

# Check motion sensor
curl -X POST http://localhost:3000/assistant/command/text \
  -H "Content-Type: application/json" \
  -d '{"message": "Is there motion in the garage?"}'

# Complex command
curl -X POST http://localhost:3000/assistant/command/text \
  -H "Content-Type: application/json" \
  -d '{"message": "Turn on all lights in the living room and set them to 50% brightness"}'

## Audio Command (requires an audio file)
curl -X POST http://localhost:3000/assistant/command/audio \
  -F "audio=@/path/to/your/audio/file.wav"

# Example with a recording
# Record audio first: rec recording.wav
# Then upload it:
curl -X POST http://localhost:3000/assistant/command/audio \
  -F "audio=@recording.wav"
