# Smart Home Assistant with ChatGPT Agent API

A demo smart home assistant built with NestJS that uses OpenAI's ChatGPT Agent API with function calling to control smart home devices through text or audio commands.

## Features

- 🏠 **Smart Home Control**: Manage lights, thermostats, door locks, fans, and sensors
- 🤖 **AI-Powered Agent**: Uses OpenAI's GPT-4o with function calling for natural language understanding
- 💬 **Text Commands**: Send text-based commands via REST API
- 🎤 **Audio Commands**: Upload audio files that are transcribed using Whisper API
- 📊 **Device State Management**: Track device states, areas, and sensor readings
- 💾 **JSON Database**: Simple file-based storage for device inventory

## Project Structure

```
src/
├── models/           # TypeScript interfaces for devices, sensors, and states
├── database/         # JSON-based database service
├── smarthome/        # Smart home device management service
├── agent/           # OpenAI agent service with function calling
├── assistant/       # API controllers and module
└── main.ts          # Application entry point
```

## Installation

1. Clone the repository and install dependencies:

```bash
npm install
```

2. Set up your OpenAI API key:

Edit the `.env` file and add your OpenAI API key:

```
OPENAI_API_KEY=sk-your-actual-api-key-here
```

## Running the Application

```bash
# Development mode
npm run start

# Watch mode (auto-reload)
npm run start:dev

# Production mode
npm run start:prod
```

The server will start on `http://localhost:3000`

## API Endpoints

### Health Check
```bash
GET /assistant/health
```

### List All Devices
```bash
GET /assistant/devices
```

### List All Sensors
```bash
GET /assistant/sensors
```

### List All Areas
```bash
GET /assistant/areas
```

### Send Text Command
```bash
POST /assistant/command/text
Content-Type: application/json

{
  "message": "Turn on the living room light"
}
```

### Send Audio Command
```bash
POST /assistant/command/audio
Content-Type: multipart/form-data

audio: <audio file (WAV, MP3, etc.)>
```

## Example Commands

### Text Commands

```bash
# Query device status
curl -X POST http://localhost:3000/assistant/command/text \
  -H "Content-Type: application/json" \
  -d '{"message": "What devices are in the living room?"}'

# Turn on a light
curl -X POST http://localhost:3000/assistant/command/text \
  -H "Content-Type: application/json" \
  -d '{"message": "Turn on the living room light"}'

# Set brightness
curl -X POST http://localhost:3000/assistant/command/text \
  -H "Content-Type: application/json" \
  -d '{"message": "Set the bedroom lamp to 50% brightness"}'

# Check temperature
curl -X POST http://localhost:3000/assistant/command/text \
  -H "Content-Type: application/json" \
  -d '{"message": "What is the temperature in the living room?"}'

# Lock door
curl -X POST http://localhost:3000/assistant/command/text \
  -H "Content-Type: application/json" \
  -d '{"message": "Lock the front door"}'

# Set thermostat
curl -X POST http://localhost:3000/assistant/command/text \
  -H "Content-Type: application/json" \
  -d '{"message": "Set the thermostat to 24 degrees"}'
```

### Audio Commands

```bash
# Upload an audio file
curl -X POST http://localhost:3000/assistant/command/audio \
  -F "audio=@./recording.wav"
```

## Sample Smart Home Setup

The application initializes with the following sample devices:

### Devices
- **Living Room Ceiling Light** (light-1)
- **Bedroom Table Lamp** (light-2)
- **Main Thermostat** (thermostat-1)
- **Front Door Lock** (lock-1)
- **Bedroom Ceiling Fan** (fan-1)

### Sensors
- **Living Room Temperature Sensor** (temp-1)
- **Bathroom Humidity Sensor** (humid-1)
- **Garage Motion Sensor** (motion-1)

### Areas
- Living Room
- Bedroom
- Kitchen
- Bathroom
- Garage

## Device Control Functions

The AI agent has access to the following functions:

1. **list_devices** - List all devices or filter by area
2. **list_sensors** - List all sensors or filter by area
3. **get_device_status** - Get current status of a device
4. **get_sensor_status** - Get current sensor reading
5. **turn_on_device** - Turn on a device
6. **turn_off_device** - Turn off a device
7. **set_brightness** - Set light brightness (0-100)
8. **set_temperature** - Set thermostat temperature
9. **lock_door** - Lock a door
10. **unlock_door** - Unlock a door
11. **set_fan_speed** - Set fan speed (0-100)
12. **list_areas** - List all areas in the home

## Database

Device states are persisted in `data/smarthome.json`. This file is automatically created on first run with sample data.

## Technologies Used

- **NestJS** - Progressive Node.js framework
- **OpenAI API** - GPT-4o for natural language processing and function calling
- **Whisper API** - Audio transcription
- **TypeScript** - Type-safe development
- **Multer** - File upload handling

## Development

```bash
# Run in development mode with auto-reload
npm run start:dev

# Run tests
npm run test

# Build for production
npm run build
```

## License

MIT

  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
