import {
    Controller,
    Post,
    Body,
    Get,
    UseInterceptors,
    UploadedFile,
    BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AgentService } from '../agent/agent.service';
import { SmartHomeService } from '../smarthome/smarthome.service';
import { HomeAssistantService } from '../homeassistant/homeassistant.service';

@Controller('assistant')
export class AssistantController {
    constructor(
        private readonly agentService: AgentService,
        private readonly smartHomeService: SmartHomeService,
        private readonly homeAssistantService: HomeAssistantService,
    ) { }

    @Post('command/text')
    async handleTextCommand(@Body() body: { message: string; sessionId?: string }) {
        if (!body.message) {
            throw new BadRequestException('Message is required');
        }

        const result = await this.agentService.processCommand(body.message, body.sessionId);
        return {
            success: true,
            message: body.message,
            response: result.response,
            sessionId: result.sessionId,
        };
    }

    @Post('command/audio')
    @UseInterceptors(FileInterceptor('audio'))
    async handleAudioCommand(
        @UploadedFile() file: Express.Multer.File,
        @Body() body: { sessionId?: string },
    ) {
        if (!file) {
            throw new BadRequestException('Audio file is required');
        }

        // Transcribe audio to text
        const transcribedText = await this.agentService.transcribeAudio(file.buffer);

        // Process the command with session
        const result = await this.agentService.processCommand(transcribedText, body.sessionId);

        return {
            success: true,
            transcription: transcribedText,
            response: result.response,
            sessionId: result.sessionId,
        };
    }

    @Get('devices')
    async getAllDevices() {
        const devices = await this.smartHomeService.getAllDevices();
        return {
            success: true,
            devices: devices,
        };
    }

    @Get('sensors')
    async getAllSensors() {
        const sensors = await this.smartHomeService.getAllSensors();
        return {
            success: true,
            sensors: sensors,
        };
    }

    @Get('areas')
    async getAllAreas() {
        const areas = await this.smartHomeService.getAllAreas();
        return {
            success: true,
            areas: areas,
        };
    }

    @Get('health')
    async healthCheck() {
        return {
            success: true,
            status: 'Smart Home Assistant is running',
            timestamp: new Date().toISOString(),
        };
    }

    @Get('ha/test')
    async testHomeAssistantConnection() {
        if (!this.homeAssistantService.isEnabled()) {
            return {
                success: false,
                message: 'Home Assistant is not configured. Please set HOME_ASSISTANT_URL and HOME_ASSISTANT_TOKEN in .env',
            };
        }

        try {
            const isConnected = await this.homeAssistantService.testConnection();
            return {
                success: isConnected,
                message: isConnected ? 'Successfully connected to Home Assistant' : 'Failed to connect to Home Assistant',
                connected: isConnected,
            };
        } catch (error) {
            return {
                success: false,
                message: `Connection failed: ${error.message}`,
                error: error.message,
            };
        }
    }

    @Get('ha/status')
    async getHomeAssistantStatus() {
        if (!this.homeAssistantService.isEnabled()) {
            return {
                success: false,
                message: 'Home Assistant is not configured',
            };
        }

        try {
            const config = await this.homeAssistantService.getConfig();
            return {
                success: true,
                config: {
                    version: config.version,
                    location: config.location_name,
                    timezone: config.time_zone,
                    unit_system: config.unit_system,
                    components: config.components.length,
                },
            };
        } catch (error) {
            return {
                success: false,
                message: `Failed to get HA status: ${error.message}`,
                error: error.message,
            };
        }
    }

    @Get('ha/entities')
    async getHomeAssistantEntities() {
        if (!this.homeAssistantService.isEnabled()) {
            return {
                success: false,
                message: 'Home Assistant is not configured',
            };
        }

        try {
            const entities = await this.homeAssistantService.getAllStates();

            // Group by domain for easier viewing
            const grouped = entities.reduce((acc, entity) => {
                const domain = entity.entity_id.split('.')[0];
                if (!acc[domain]) acc[domain] = [];
                acc[domain].push({
                    entity_id: entity.entity_id,
                    name: entity.attributes.friendly_name || entity.entity_id,
                    state: entity.state,
                    area: entity.attributes.area_id,
                });
                return acc;
            }, {} as Record<string, any[]>);

            return {
                success: true,
                total: entities.length,
                domains: Object.keys(grouped),
                entities: grouped,
            };
        } catch (error) {
            return {
                success: false,
                message: `Failed to get entities: ${error.message}`,
                error: error.message,
            };
        }
    }
}
