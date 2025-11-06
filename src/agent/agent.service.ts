import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Agent, OpenAIConversationsSession, run, tool } from '@openai/agents';
import { z } from 'zod';
import OpenAI from 'openai';
import { SmartHomeService } from '../smarthome/smarthome.service';

@Injectable()
export class AgentService {
    private agent: Agent;
    private openai: OpenAI;
    private readonly systemPrompt = `You are a helpful smart home assistant. You can control devices like lights, thermostats, door locks, and fans. You can also read sensor values.
        
When users ask about devices, always use the available functions to get the latest information. Be conversational and friendly in your responses.

Device naming conventions:
- Lights: light-1, light-2, etc.
- Thermostats: thermostat-1, etc.
- Door locks: lock-1, etc.
- Fans: fan-1, etc.
- Sensors: temp-1, humid-1, motion-1, etc.

When users mention devices by name (like "living room light"), first list the devices to find the correct ID, then perform the action.

Remember previous context in the conversation to handle follow-up commands like "turn it off" or "what about the bedroom?".`;

    constructor(
        private readonly configService: ConfigService,
        private readonly smartHomeService: SmartHomeService,
    ) {
        const apiKey = this.configService.get<string>('OPENAI_API_KEY');

        // Keep OpenAI client for Whisper API
        this.openai = new OpenAI({ apiKey });

        // Initialize the agent with tools using the new SDK
        this.agent = new Agent({
            name: 'SmartHomeAssistant',
            instructions: this.systemPrompt,
            model: 'gpt-4o',
            tools: this.createTools(),
        });
    }

    /**
     * Create tools using the OpenAI Agents SDK tool() helper
     */
    private createTools() {
        return [
            // List all devices tool
            tool({
                name: 'list_devices',
                description: 'List all smart home devices in the entire home',
                parameters: z.object({}),
                execute: async () => {
                    const devices = await this.smartHomeService.getAllDevices();
                    return JSON.stringify(devices);
                },
            }),

            // List devices by area tool
            tool({
                name: 'list_devices_by_area',
                description: 'List devices in a specific area or room (e.g., Living Room, Bedroom, Kitchen)',
                parameters: z.object({
                    area: z.string().describe('The area/room name to filter devices by'),
                }),
                execute: async ({ area }) => {
                    const devices = await this.smartHomeService.getDevicesByArea(area);
                    return JSON.stringify(devices);
                },
            }),

            // List all sensors tool
            tool({
                name: 'list_sensors',
                description: 'List all sensors in the entire home',
                parameters: z.object({}),
                execute: async () => {
                    const sensors = await this.smartHomeService.getAllSensors();
                    return JSON.stringify(sensors);
                },
            }),

            // List sensors by area tool
            tool({
                name: 'list_sensors_by_area',
                description: 'List sensors in a specific area or room',
                parameters: z.object({
                    area: z.string().describe('The area/room name to filter sensors by'),
                }),
                execute: async ({ area }) => {
                    const sensors = await this.smartHomeService.getSensorsByArea(area);
                    return JSON.stringify(sensors);
                },
            }),

            // Get device status tool
            tool({
                name: 'get_device_status',
                description: 'Get the current status of a specific device',
                parameters: z.object({
                    device_id: z.string().describe('The ID of the device'),
                }),
                execute: async ({ device_id }) => {
                    const result = await this.smartHomeService.getDeviceStatus(device_id);
                    return JSON.stringify(result);
                },
            }),

            // Get sensor status tool
            tool({
                name: 'get_sensor_status',
                description: 'Get the current reading from a specific sensor',
                parameters: z.object({
                    sensor_id: z.string().describe('The ID of the sensor'),
                }),
                execute: async ({ sensor_id }) => {
                    const result = await this.smartHomeService.getSensorStatus(sensor_id);
                    return JSON.stringify(result);
                },
            }),

            // Turn on device tool
            tool({
                name: 'turn_on_device',
                description: 'Turn on a device (lights, fans, etc.)',
                parameters: z.object({
                    device_id: z.string().describe('The ID of the device to turn on'),
                }),
                execute: async ({ device_id }) => {
                    const result = await this.smartHomeService.turnOnDevice(device_id);
                    return JSON.stringify(result);
                },
            }),

            // Turn off device tool
            tool({
                name: 'turn_off_device',
                description: 'Turn off a device',
                parameters: z.object({
                    device_id: z.string().describe('The ID of the device to turn off'),
                }),
                execute: async ({ device_id }) => {
                    const result = await this.smartHomeService.turnOffDevice(device_id);
                    return JSON.stringify(result);
                },
            }),

            // Set brightness tool
            tool({
                name: 'set_brightness',
                description: 'Set the brightness of a light (0-100)',
                parameters: z.object({
                    device_id: z.string().describe('The ID of the light device'),
                    brightness: z.number().min(0).max(100).describe('Brightness level from 0 to 100'),
                }),
                execute: async ({ device_id, brightness }) => {
                    const result = await this.smartHomeService.setBrightness(device_id, brightness);
                    return JSON.stringify(result);
                },
            }),

            // Set temperature tool
            tool({
                name: 'set_temperature',
                description: 'Set the temperature on a thermostat',
                parameters: z.object({
                    device_id: z.string().describe('The ID of the thermostat'),
                    temperature: z.number().describe('Temperature in Celsius'),
                }),
                execute: async ({ device_id, temperature }) => {
                    const result = await this.smartHomeService.setTemperature(device_id, temperature);
                    return JSON.stringify(result);
                },
            }),

            // Lock door tool
            tool({
                name: 'lock_door',
                description: 'Lock a door',
                parameters: z.object({
                    device_id: z.string().describe('The ID of the door lock'),
                }),
                execute: async ({ device_id }) => {
                    const result = await this.smartHomeService.lockDoor(device_id);
                    return JSON.stringify(result);
                },
            }),

            // Unlock door tool
            tool({
                name: 'unlock_door',
                description: 'Unlock a door',
                parameters: z.object({
                    device_id: z.string().describe('The ID of the door lock'),
                }),
                execute: async ({ device_id }) => {
                    const result = await this.smartHomeService.unlockDoor(device_id);
                    return JSON.stringify(result);
                },
            }),

            // Set fan speed tool
            tool({
                name: 'set_fan_speed',
                description: 'Set the speed of a fan (0-100)',
                parameters: z.object({
                    device_id: z.string().describe('The ID of the fan'),
                    speed: z.number().min(0).max(100).describe('Speed level from 0 to 100'),
                }),
                execute: async ({ device_id, speed }) => {
                    const result = await this.smartHomeService.setFanSpeed(device_id, speed);
                    return JSON.stringify(result);
                },
            }),

            // List areas tool
            tool({
                name: 'list_areas',
                description: 'List all areas in the smart home',
                parameters: z.object({}),
                execute: async () => {
                    const areas = await this.smartHomeService.getAllAreas();
                    return JSON.stringify(areas);
                },
            }),
        ];
    }

    /**
     * Process a command using the OpenAI Agents SDK with OpenAIConversationsSession
     */
    async processCommand(userMessage: string, conversationId?: string): Promise<{ response: string; sessionId: string }> {
        try {
            // Create or reuse OpenAIConversationsSession
            const session = new OpenAIConversationsSession({
                conversationId: conversationId,
                apiKey: this.configService.get<string>('OPENAI_API_KEY'),
            });

            // Run the agent with the session
            const result = await run(this.agent, userMessage, {
                session,
            });

            // Get the session ID (conversation ID)
            const sessionId = await session.getSessionId();

            return {
                response: result.finalOutput || 'I apologize, I could not process your request.',
                sessionId: sessionId,
            };
        } catch (error) {
            console.error('Error processing command:', error);
            throw error;
        }
    }

    /**
     * Transcribe audio using Whisper API (keeping this separate as Agents SDK doesn't handle audio transcription)
     */
    async transcribeAudio(audioBuffer: Buffer): Promise<string> {
        const file = new File([new Uint8Array(audioBuffer)], 'audio.wav', { type: 'audio/wav' });

        const transcription = await this.openai.audio.transcriptions.create({
            file: file,
            model: 'whisper-1',
        });

        return transcription.text;
    }
}
