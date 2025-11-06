# Home Assistant Integration Plan

## Overview
Integrate the Smart Home Assistant with your Home Assistant instance at `https://ha.prasenjit.net` to use real device data and control actual smart home devices instead of the mock JSON database.

## Architecture Changes

### Current Architecture
```
User → NestJS API → AgentService → SmartHomeService → JSON Database
                                                    ↓
                                              Device State
```

### New Architecture
```
User → NestJS API → AgentService → HomeAssistantService → Home Assistant REST API
                                                         ↓
                                                   Real Devices
```

## Home Assistant REST API Overview

### Base URL
- **Endpoint**: `https://ha.prasenjit.net/api/`
- **Authentication**: Bearer Token (Long-Lived Access Token)
- **Content-Type**: `application/json`

### Key Endpoints

1. **GET /api/states** - Get all entity states
2. **GET /api/states/<entity_id>** - Get specific entity state
3. **POST /api/services/<domain>/<service>** - Call a service
4. **GET /api/services** - List all available services
5. **GET /api/config** - Get Home Assistant configuration
6. **POST /api/states/<entity_id>** - Update entity state (not recommended for most use cases)

### Authentication Header
```
Authorization: Bearer YOUR_LONG_LIVED_ACCESS_TOKEN
```

## Implementation Plan

### Phase 1: Setup & Configuration ✅ Next Steps

#### 1.1 Environment Configuration
- [ ] Add Home Assistant URL to `.env`:
  ```env
  HOME_ASSISTANT_URL=https://ha.prasenjit.net
  HOME_ASSISTANT_TOKEN=your_long_lived_access_token_here
  ```
- [ ] Update `.env.example` with new variables

#### 1.2 Install HTTP Client
- [ ] Install axios for HTTP requests:
  ```bash
  npm install axios
  npm install --save-dev @types/axios
  ```

### Phase 2: Create Home Assistant Service

#### 2.1 Create `src/homeassistant/homeassistant.service.ts`
Features:
- Connection management with Home Assistant API
- Entity state retrieval
- Service calling (turn on/off, set brightness, etc.)
- Error handling and retry logic
- Entity mapping (HA entities → our device model)

Key Methods:
```typescript
class HomeAssistantService {
  // Connection
  async testConnection(): Promise<boolean>
  async getConfig(): Promise<HAConfig>
  
  // Entity Management
  async getAllStates(): Promise<HAEntity[]>
  async getEntityState(entityId: string): Promise<HAEntity>
  async getEntitiesByDomain(domain: string): Promise<HAEntity[]>
  
  // Service Calls
  async callService(domain: string, service: string, data: any): Promise<any>
  async turnOn(entityId: string, params?: any): Promise<any>
  async turnOff(entityId: string): Promise<any>
  async setBrightness(entityId: string, brightness: number): Promise<any>
  async setTemperature(entityId: string, temperature: number): Promise<any>
  async lockDoor(entityId: string): Promise<any>
  async unlockDoor(entityId: string): Promise<any>
  
  // Helper Methods
  async getDevicesByArea(areaName: string): Promise<HAEntity[]>
  async getSensorsByArea(areaName: string): Promise<HAEntity[]>
}
```

#### 2.2 Create Type Definitions
Create `src/homeassistant/homeassistant.types.ts`:
```typescript
interface HAEntity {
  entity_id: string;
  state: string;
  attributes: {
    friendly_name: string;
    area_id?: string;
    device_class?: string;
    unit_of_measurement?: string;
    brightness?: number;
    temperature?: number;
    // ... other attributes
  };
  last_changed: string;
  last_updated: string;
}

interface HAServiceCall {
  domain: string;
  service: string;
  service_data?: any;
  target?: {
    entity_id?: string | string[];
    device_id?: string | string[];
    area_id?: string | string[];
  };
}
```

### Phase 3: Update Existing Services

#### 3.1 Modify SmartHomeService
- [ ] Add HomeAssistantService as dependency
- [ ] Create adapter methods that convert HA entities to our device model
- [ ] Map HA entity domains to our device types:
  - `light.*` → Light devices
  - `switch.*` → Switch devices
  - `climate.*` → Thermostat devices
  - `lock.*` → Door locks
  - `fan.*` → Fan devices
  - `sensor.*` → Sensors
  - `binary_sensor.*` → Motion/door sensors

#### 3.2 Update Device Model Mapping
Create `src/homeassistant/entity-mapper.service.ts`:
- Convert HA entities to Device/Sensor models
- Handle area mapping (HA area_id → friendly area names)
- Transform state values (brightness 0-255 → 0-100)

### Phase 4: Update Agent Service

#### 4.1 Update Tool Implementations
Update all 14 tools to use HomeAssistantService:
- `list_devices` → Get all HA entities by domain
- `list_devices_by_area` → Filter by area_id
- `turn_on_device` → Call `homeassistant.turn_on` service
- `turn_off_device` → Call `homeassistant.turn_off` service
- `set_brightness` → Call `light.turn_on` with brightness
- `set_temperature` → Call `climate.set_temperature`
- etc.

### Phase 5: Testing & Validation

#### 5.1 Connection Testing
- [ ] Create endpoint: `GET /assistant/ha/test` - Test HA connection
- [ ] Create endpoint: `GET /assistant/ha/status` - Get HA status & version
- [ ] Create endpoint: `GET /assistant/ha/entities` - List all entities (debug)

#### 5.2 Integration Testing
- [ ] Test fetching real device states
- [ ] Test controlling lights (on/off, brightness)
- [ ] Test thermostats
- [ ] Test locks
- [ ] Test sensor readings
- [ ] Test area-based filtering

### Phase 6: Migration Strategy

#### 6.1 Feature Flag Approach
Add configuration to switch between JSON DB and Home Assistant:
```typescript
// .env
USE_HOME_ASSISTANT=true  # or false for testing with JSON DB
```

#### 6.2 Dual Mode Support (Optional)
- Keep JSON database service for demo/testing
- Allow switching between real HA and mock data
- Useful for development without HA connection

### Phase 7: Enhanced Features

#### 7.1 WebSocket Integration (Future)
- Real-time state updates using HA WebSocket API
- Push notifications when device states change
- Better performance than polling

#### 7.2 Scene & Automation Support
- Add tools to activate scenes
- Trigger automations
- Get script status

#### 7.3 Advanced Entity Types
- Media players (TV, music)
- Cameras
- Covers (blinds, garage doors)
- Vacuum cleaners

## API Endpoint Examples

### Get All States
```bash
curl -X GET https://ha.prasenjit.net/api/states \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

### Turn On Light
```bash
curl -X POST https://ha.prasenjit.net/api/services/light/turn_on \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"entity_id": "light.living_room"}'
```

### Set Light Brightness
```bash
curl -X POST https://ha.prasenjit.net/api/services/light/turn_on \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"entity_id": "light.living_room", "brightness": 128}'
```

### Set Thermostat Temperature
```bash
curl -X POST https://ha.prasenjit.net/api/services/climate/set_temperature \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"entity_id": "climate.living_room", "temperature": 22}'
```

### Lock Door
```bash
curl -X POST https://ha.prasenjit.net/api/services/lock/lock \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"entity_id": "lock.front_door"}'
```

## Domain to Service Mapping

| Device Type | HA Domain | Common Services |
|-------------|-----------|----------------|
| Lights | `light` | turn_on, turn_off, toggle |
| Switches | `switch` | turn_on, turn_off, toggle |
| Thermostats | `climate` | set_temperature, set_hvac_mode |
| Locks | `lock` | lock, unlock |
| Fans | `fan` | turn_on, turn_off, set_percentage |
| Covers | `cover` | open_cover, close_cover, set_cover_position |
| Media Players | `media_player` | turn_on, turn_off, media_play, media_pause |
| Sensors | `sensor` | N/A (read-only) |
| Binary Sensors | `binary_sensor` | N/A (read-only) |

## Error Handling

### Connection Errors
- Retry with exponential backoff
- Fall back to cached state if available
- Return user-friendly error messages

### Authentication Errors
- Validate token on startup
- Provide clear setup instructions
- Log token expiration warnings

### Entity Not Found
- Suggest similar entity names
- List available entities in the area

## Security Considerations

1. **Token Storage**: Store HA token in `.env`, never in code
2. **HTTPS**: Always use HTTPS for HA connection
3. **Token Scope**: Use long-lived access token with appropriate permissions
4. **Rate Limiting**: Implement request throttling to avoid overwhelming HA
5. **Validation**: Validate all entity IDs before making API calls

## Performance Optimizations

1. **Caching**: Cache entity states for 5-10 seconds
2. **Batch Requests**: Group multiple state queries
3. **Connection Pooling**: Reuse HTTP connections
4. **Lazy Loading**: Only fetch entities when needed
5. **WebSocket**: Use WebSocket for real-time updates (future)

## Documentation Updates

- [ ] Update README.md with HA setup instructions
- [ ] Add HA token generation guide
- [ ] Update API examples with real entity names
- [ ] Document entity ID conventions
- [ ] Add troubleshooting section for HA connection issues

## Timeline Estimate

- **Phase 1 (Setup)**: 1 hour
- **Phase 2 (HA Service)**: 3-4 hours
- **Phase 3 (Update Services)**: 2-3 hours
- **Phase 4 (Update Agent)**: 2 hours
- **Phase 5 (Testing)**: 2-3 hours
- **Phase 6 (Migration)**: 1 hour
- **Total**: ~12-15 hours

## Next Immediate Steps

1. Get your Home Assistant long-lived access token:
   - Go to https://ha.prasenjit.net/profile
   - Scroll to "Long-Lived Access Tokens"
   - Click "Create Token"
   - Copy the token and add to `.env`

2. Test connection:
   ```bash
   curl -X GET https://ha.prasenjit.net/api/ \
     -H "Authorization: Bearer YOUR_TOKEN"
   ```

3. List your entities:
   ```bash
   curl -X GET https://ha.prasenjit.net/api/states \
     -H "Authorization: Bearer YOUR_TOKEN"
   ```

4. Start implementation with Phase 1!

## Questions to Consider

1. Do you want to keep the JSON database as a fallback/demo mode?
2. Should we map HA areas to our area names, or use HA's area structure?
3. Do you want real-time updates via WebSocket or polling is sufficient?
4. Which entity types are most important for your initial integration?
5. Do you want to support HA scenes and automations?
