import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AssistantController } from './assistant.controller';
import { AgentService } from '../agent/agent.service';
import { SmartHomeService } from '../smarthome/smarthome.service';
import { DatabaseService } from '../database/database.service';
import { HomeAssistantService } from '../homeassistant/homeassistant.service';
import { EntityMapperService } from '../homeassistant/entity-mapper.service';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),
    ],
    controllers: [AssistantController],
    providers: [
        AgentService,
        SmartHomeService,
        DatabaseService,
        HomeAssistantService,
        EntityMapperService,
    ],
})
export class AssistantModule { }
