# System Architecture

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                            CLIENT LAYER                              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌──────────────────┐              ┌──────────────────┐            │
│  │   Web Browser    │              │   cURL / API     │            │
│  │  (index.html)    │              │     Clients      │            │
│  └────────┬─────────┘              └────────┬─────────┘            │
│           │                                  │                       │
│           └──────────────┬───────────────────┘                       │
│                          │                                           │
└──────────────────────────┼───────────────────────────────────────────┘
                           │ HTTP/HTTPS
                           ▼
┌─────────────────────────────────────────────────────────────────────┐
│                          API GATEWAY LAYER                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│                     ┌──────────────────────┐                        │
│                     │   NestJS Server      │                        │
│                     │   (main.ts)          │                        │
│                     │   Port: 3000         │                        │
│                     └──────────┬───────────┘                        │
│                                │                                     │
└────────────────────────────────┼─────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        CONTROLLER LAYER                              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│                  ┌─────────────────────────┐                        │
│                  │  AssistantController    │                        │
│                  │  (/assistant/*)         │                        │
│                  └────────────┬────────────┘                        │
│                               │                                      │
│     ┌────────────┬────────────┼────────────┬──────────┐            │
│     │            │            │            │          │            │
│     ▼            ▼            ▼            ▼          ▼            │
│  /health   /devices    /command/text  /command/  /sensors         │
│                                        audio                        │
└─────────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         SERVICE LAYER                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌──────────────────┐         ┌──────────────────────┐             │
│  │  AgentService    │◄────────│  SmartHomeService    │             │
│  │                  │         │                      │             │
│  │  - processCmd()  │         │  - getAllDevices()   │             │
│  │  - transcribe()  │         │  - getDeviceById()   │             │
│  │  - executeFunc() │         │  - updateDevice()    │             │
│  └────────┬─────────┘         │  - getSensors()      │             │
│           │                   │  - turnOn/Off()      │             │
│           │                   │  - setBrightness()   │             │
│           │                   │  - setTemperature()  │             │
│           │                   └──────────┬───────────┘             │
│           │                              │                          │
└───────────┼──────────────────────────────┼──────────────────────────┘
            │                              │
            │                              ▼
            │                   ┌──────────────────────┐
            │                   │  DatabaseService     │
            │                   │                      │
            │                   │  - loadData()        │
            │                   │  - saveData()        │
            │                   │  - getAllDevices()   │
            │                   │  - updateDevice()    │
            │                   └──────────┬───────────┘
            │                              │
            ▼                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      EXTERNAL SERVICES LAYER                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌──────────────────────────┐       ┌──────────────────────┐       │
│  │   OpenAI API             │       │   File System        │       │
│  │                          │       │                      │       │
│  │  ┌──────────────────┐   │       │  ┌─────────────────┐ │       │
│  │  │   GPT-4o         │   │       │  │ smarthome.json  │ │       │
│  │  │   (Function      │   │       │  │                 │ │       │
│  │  │    Calling)      │   │       │  │ - devices[]     │ │       │
│  │  └──────────────────┘   │       │  │ - sensors[]     │ │       │
│  │                          │       │  │ - areas[]       │ │       │
│  │  ┌──────────────────┐   │       │  └─────────────────┘ │       │
│  │  │   Whisper API    │   │       │                      │       │
│  │  │   (Audio →Text)  │   │       └──────────────────────┘       │
│  │  └──────────────────┘   │                                       │
│  │                          │                                       │
│  └──────────────────────────┘                                       │
│                                                                       │
└───────────────────────────────────────────────────────────────────────┘
```

## Data Flow

### Text Command Flow
```
1. User Input (Web/API)
   ↓
2. AssistantController.handleTextCommand()
   ↓
3. AgentService.processCommand()
   ↓
4. OpenAI GPT-4o (with function calling)
   ↓
5. AgentService.executeFunctionCall()
   ↓
6. SmartHomeService.<appropriate method>
   ↓
7. DatabaseService.updateDeviceState()
   ↓
8. Save to smarthome.json
   ↓
9. Return response through chain
   ↓
10. Display result to user
```

### Audio Command Flow
```
1. User uploads audio file
   ↓
2. AssistantController.handleAudioCommand()
   ↓
3. AgentService.transcribeAudio()
   ↓
4. OpenAI Whisper API
   ↓
5. Get transcribed text
   ↓
6. AgentService.processCommand() [same as text flow]
   ↓
7. ... (continues as text command flow)
```

## Function Calling Mechanism

```
┌─────────────────────────────────────────────────────────────┐
│                     User Command                             │
│              "Turn on the living room light"                 │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                  GPT-4o Processes                            │
│         1. Understands intent                                │
│         2. Identifies required function                      │
│         3. Extracts parameters                               │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│             Function Call Decision                           │
│                                                              │
│   Function: "list_devices"                                  │
│   Args: { area: "living room" }                             │
│                                                              │
│   Then: "turn_on_device"                                    │
│   Args: { device_id: "light-1" }                            │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│           Execute Functions Locally                          │
│                                                              │
│   1. list_devices({area: "living room"})                    │
│      → Returns: [light-1, thermostat-1, lock-1]             │
│                                                              │
│   2. turn_on_device({device_id: "light-1"})                 │
│      → Updates device state to power: "on"                  │
│      → Saves to database                                    │
│      → Returns updated device                               │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              GPT-4o Generates Response                       │
│                                                              │
│   "I've turned on the living room ceiling light for you."   │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                 Return to User                               │
└─────────────────────────────────────────────────────────────┘
```

## Module Dependencies

```
┌──────────────────────────────────────────────────────┐
│                    AppModule                         │
│  ┌──────────────────────────────────────────────┐   │
│  │          AssistantModule                     │   │
│  │  ┌───────────────────────────────────────┐  │   │
│  │  │  Controllers:                         │  │   │
│  │  │    - AssistantController             │  │   │
│  │  │                                       │  │   │
│  │  │  Providers:                           │  │   │
│  │  │    - AgentService ──────────┐        │  │   │
│  │  │    - SmartHomeService       │        │  │   │
│  │  │    - DatabaseService        │        │  │   │
│  │  │                             │        │  │   │
│  │  │  Imports:                   │        │  │   │
│  │  │    - ConfigModule ◄─────────┘        │  │   │
│  │  │      (OPENAI_API_KEY)                │  │   │
│  │  └───────────────────────────────────────┘  │   │
│  └──────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────┘
```

## Component Responsibilities

### Controllers
- **AssistantController**: Handle HTTP requests, validate input, coordinate responses

### Services
- **AgentService**: Integrate with OpenAI API, manage function calling
- **SmartHomeService**: Business logic for device control
- **DatabaseService**: Persist and retrieve device data

### Models
- **device.model.ts**: TypeScript interfaces and enums for type safety

## State Management

```
┌──────────────────────────────────────────────────┐
│           Device State Lifecycle                 │
├──────────────────────────────────────────────────┤
│                                                  │
│  1. Initialize (on server start)                 │
│     - Load from smarthome.json                   │
│     - Or create with sample data                 │
│                                                  │
│  2. Query (GET requests)                         │
│     - Read from memory (fast)                    │
│                                                  │
│  3. Update (via commands)                        │
│     - Update in-memory state                     │
│     - Persist to smarthome.json                  │
│                                                  │
│  4. Response                                     │
│     - Return updated state to user               │
│                                                  │
└──────────────────────────────────────────────────┘
```

## Security Considerations

```
┌────────────────────────────────────┐
│     Environment Variables          │
│  (Never committed to git)          │
│                                    │
│  - OPENAI_API_KEY                  │
│  - PORT (optional)                 │
└────────────────────────────────────┘

┌────────────────────────────────────┐
│         CORS Enabled               │
│  (Allow frontend integration)      │
└────────────────────────────────────┘

┌────────────────────────────────────┐
│     Input Validation               │
│  (BadRequestException for errors)  │
└────────────────────────────────────┘
```

## Scalability Considerations

### Current Implementation
- Single JSON file database
- In-memory state
- Synchronous file I/O

### Future Enhancements
- Replace with PostgreSQL/MongoDB
- Add caching layer (Redis)
- WebSocket for real-time updates
- Horizontal scaling with load balancer
- Message queue for async operations
