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

@Controller('assistant')
export class AssistantController {
    constructor(
        private readonly agentService: AgentService,
        private readonly smartHomeService: SmartHomeService,
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
}
