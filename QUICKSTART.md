# Quick Start Guide

## Prerequisites
- Node.js (v18 or higher)
- OpenAI API key

## Setup Steps

### 1. Install Dependencies
Already done! The project has been initialized with all necessary dependencies.

### 2. Configure OpenAI API Key

Edit the `.env` file and add your OpenAI API key:

```bash
OPENAI_API_KEY=sk-your-actual-openai-api-key-here
```

You can get an API key from: https://platform.openai.com/api-keys

### 3. Start the Server

```bash
npm run start:dev
```

The server will start on http://localhost:3000

### 4. Access the Web Interface

Open your browser and go to:
```
http://localhost:3000/index.html
```

## Testing the Application

### Option 1: Web Interface (Easiest)
1. Open http://localhost:3000/index.html
2. Click on example commands or type your own
3. Try the audio upload feature with voice commands
4. View all devices in the Devices tab

### Option 2: Command Line (Using curl)

Test the health endpoint:
```bash
curl http://localhost:3000/assistant/health
```

Send a text command:
```bash
curl -X POST http://localhost:3000/assistant/command/text \
  -H "Content-Type: application/json" \
  -d '{"message": "Turn on the living room light"}'
```

List all devices:
```bash
curl http://localhost:3000/assistant/devices
```

### Option 3: Test Script
Run the automated test script:
```bash
./test-commands.sh
```

## Sample Commands to Try

- "What devices are in the living room?"
- "Turn on the living room light"
- "Set the bedroom lamp to 50% brightness"
- "What is the temperature in the living room?"
- "Lock the front door"
- "Set the thermostat to 24 degrees"
- "Turn off all lights in the bedroom"
- "What's the humidity in the bathroom?"

## Project Structure

```
src/
├── models/device.model.ts              # Device and sensor type definitions
├── database/database.service.ts        # JSON file-based database
├── smarthome/smarthome.service.ts     # Device control logic
├── agent/agent.service.ts             # OpenAI agent with function calling
├── assistant/
│   ├── assistant.controller.ts        # API endpoints
│   └── assistant.module.ts            # Module configuration
├── app.module.ts                      # Main application module
└── main.ts                            # Application entry point

data/
└── smarthome.json                     # Device state database (auto-created)

public/
└── index.html                         # Web interface
```

## API Endpoints

- `GET /assistant/health` - Health check
- `GET /assistant/devices` - List all devices
- `GET /assistant/sensors` - List all sensors
- `GET /assistant/areas` - List all areas
- `POST /assistant/command/text` - Send text command
- `POST /assistant/command/audio` - Upload audio command

## Troubleshooting

### Server won't start
- Make sure port 3000 is not in use
- Check that all dependencies are installed: `npm install`

### "Invalid API key" error
- Verify your OPENAI_API_KEY in the `.env` file
- Make sure the key starts with `sk-`
- Restart the server after updating .env

### Commands not working
- Check the console for error messages
- Verify the OpenAI API key is valid
- Make sure you have internet connection for OpenAI API calls

## Features

✅ Natural language processing with GPT-4o
✅ Function calling for device control
✅ Audio transcription with Whisper API
✅ Text and audio command support
✅ Real-time device state management
✅ JSON-based persistent storage
✅ Web interface for easy testing
✅ Multiple device types (lights, thermostats, locks, fans, sensors)
✅ Area-based device organization

## Next Steps

- Add more devices to the database
- Implement authentication
- Add WebSocket support for real-time updates
- Create mobile app interface
- Add device automation and scenes
- Integrate with real smart home devices
