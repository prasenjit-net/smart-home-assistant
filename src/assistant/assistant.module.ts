import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AssistantController } from './assistant.controller';
import { AgentService } from '../agent/agent.service';
import { SmartHomeService } from '../smarthome/smarthome.service';
import { DatabaseService } from '../database/database.service';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),
    ],
    controllers: [AssistantController],
    providers: [AgentService, SmartHomeService, DatabaseService],
})
export class AssistantModule { }
