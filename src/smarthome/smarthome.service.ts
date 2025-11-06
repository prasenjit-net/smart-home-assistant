import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DatabaseService } from '../database/database.service';
import { HomeAssistantService } from '../homeassistant/homeassistant.service';
import { EntityMapperService } from '../homeassistant/entity-mapper.service';
import { Device, Sensor, DeviceState } from '../models/device.model';

@Injectable()
export class SmartHomeService {
    private readonly logger = new Logger(SmartHomeService.name);
    private readonly useHomeAssistant: boolean;

    constructor(
        private readonly configService: ConfigService,
        private readonly databaseService: DatabaseService,
        private readonly homeAssistantService: HomeAssistantService,
        private readonly entityMapperService: EntityMapperService,
    ) {
        this.useHomeAssistant = this.configService.get<string>('USE_HOME_ASSISTANT') === 'true';
        
        if (this.useHomeAssistant) {
            this.logger.log('Using Home Assistant as data source');
        } else {
            this.logger.log('Using JSON database as data source');
        }
    }

    async getAllDevices(): Promise<Device[]> {
        if (this.useHomeAssistant) {
            const entities = await this.homeAssistantService.getAllStates();
            return this.entityMapperService.mapEntitiesToDevices(entities);
        }
        return this.databaseService.getAllDevices();
    }

    async getDeviceById(id: string): Promise<Device | undefined> {
        if (this.useHomeAssistant) {
            try {
                const entity = await this.homeAssistantService.getEntityState(id);
                return this.entityMapperService.mapEntityToDevice(entity) || undefined;
            } catch (error) {
                this.logger.error(`Failed to get device ${id} from HA:`, error.message);
                return undefined;
            }
        }
        return this.databaseService.getDeviceById(id);
    }

    async getDevicesByArea(area: string): Promise<Device[]> {
        if (this.useHomeAssistant) {
            const entities = await this.homeAssistantService.getDevicesByArea(area);
            return this.entityMapperService.mapEntitiesToDevices(entities);
        }
        return this.databaseService.getDevicesByArea(area);
    }

    async getAllSensors(): Promise<Sensor[]> {
        if (this.useHomeAssistant) {
            const entities = await this.homeAssistantService.getAllStates();
            return this.entityMapperService.mapEntitiesToSensors(entities);
        }
        return this.databaseService.getAllSensors();
    }

    async getSensorById(id: string): Promise<Sensor | undefined> {
        if (this.useHomeAssistant) {
            try {
                const entity = await this.homeAssistantService.getEntityState(id);
                return this.entityMapperService.mapEntityToSensor(entity) || undefined;
            } catch (error) {
                this.logger.error(`Failed to get sensor ${id} from HA:`, error.message);
                return undefined;
            }
        }
        return this.databaseService.getSensorById(id);
    }

    async getSensorsByArea(area: string): Promise<Sensor[]> {
        if (this.useHomeAssistant) {
            const entities = await this.homeAssistantService.getSensorsByArea(area);
            return this.entityMapperService.mapEntitiesToSensors(entities);
        }
        return this.databaseService.getSensorsByArea(area);
    }

    async getAllAreas(): Promise<string[]> {
        if (this.useHomeAssistant) {
            return this.homeAssistantService.getAreas();
        }
        return this.databaseService.getAllAreas();
    }

    async updateDeviceState(deviceId: string, state: Partial<DeviceState>): Promise<Device | null> {
        return this.databaseService.updateDeviceState(deviceId, state);
    }

    async turnOnDevice(deviceId: string): Promise<Device | null> {
        if (this.useHomeAssistant) {
            try {
                await this.homeAssistantService.turnOn(deviceId);
                // Return updated device state
                const entity = await this.homeAssistantService.getEntityState(deviceId);
                return this.entityMapperService.mapEntityToDevice(entity);
            } catch (error) {
                this.logger.error(`Failed to turn on device ${deviceId}:`, error.message);
                return null;
            }
        }

        const device = await this.databaseService.getDeviceById(deviceId);
        if (!device) return null;

        const newState: Partial<DeviceState> = { power: 'on' };

        // Set default brightness for lights
        if (device.type === 'light' && device.state.brightness === 0) {
            newState.brightness = 100;
        }

        // Set default speed for fans
        if (device.type === 'fan' && device.state.speed === 0) {
            newState.speed = 50;
        }

        return this.databaseService.updateDeviceState(deviceId, newState);
    }

    async turnOffDevice(deviceId: string): Promise<Device | null> {
        if (this.useHomeAssistant) {
            try {
                await this.homeAssistantService.turnOff(deviceId);
                const entity = await this.homeAssistantService.getEntityState(deviceId);
                return this.entityMapperService.mapEntityToDevice(entity);
            } catch (error) {
                this.logger.error(`Failed to turn off device ${deviceId}:`, error.message);
                return null;
            }
        }
        return this.databaseService.updateDeviceState(deviceId, { power: 'off' });
    }

    async setBrightness(deviceId: string, brightness: number): Promise<Device | null> {
        if (this.useHomeAssistant) {
            try {
                await this.homeAssistantService.setBrightness(deviceId, brightness);
                const entity = await this.homeAssistantService.getEntityState(deviceId);
                return this.entityMapperService.mapEntityToDevice(entity);
            } catch (error) {
                this.logger.error(`Failed to set brightness for ${deviceId}:`, error.message);
                return null;
            }
        }

        const device = await this.databaseService.getDeviceById(deviceId);
        if (!device || device.type !== 'light') return null;

        return this.databaseService.updateDeviceState(deviceId, {
            brightness: Math.max(0, Math.min(100, brightness)),
            power: brightness > 0 ? 'on' : 'off',
        });
    }

    async setTemperature(deviceId: string, temperature: number): Promise<Device | null> {
        if (this.useHomeAssistant) {
            try {
                await this.homeAssistantService.setTemperature(deviceId, temperature);
                const entity = await this.homeAssistantService.getEntityState(deviceId);
                return this.entityMapperService.mapEntityToDevice(entity);
            } catch (error) {
                this.logger.error(`Failed to set temperature for ${deviceId}:`, error.message);
                return null;
            }
        }

        const device = await this.databaseService.getDeviceById(deviceId);
        if (!device || device.type !== 'thermostat') return null;

        return this.databaseService.updateDeviceState(deviceId, {
            temperature: Math.max(10, Math.min(35, temperature)),
        });
    }

    async lockDoor(deviceId: string): Promise<Device | null> {
        if (this.useHomeAssistant) {
            try {
                await this.homeAssistantService.lockDoor(deviceId);
                const entity = await this.homeAssistantService.getEntityState(deviceId);
                return this.entityMapperService.mapEntityToDevice(entity);
            } catch (error) {
                this.logger.error(`Failed to lock door ${deviceId}:`, error.message);
                return null;
            }
        }

        const device = await this.databaseService.getDeviceById(deviceId);
        if (!device || device.type !== 'door_lock') return null;

        return this.databaseService.updateDeviceState(deviceId, { locked: true });
    }

    async unlockDoor(deviceId: string): Promise<Device | null> {
        if (this.useHomeAssistant) {
            try {
                await this.homeAssistantService.unlockDoor(deviceId);
                const entity = await this.homeAssistantService.getEntityState(deviceId);
                return this.entityMapperService.mapEntityToDevice(entity);
            } catch (error) {
                this.logger.error(`Failed to unlock door ${deviceId}:`, error.message);
                return null;
            }
        }

        const device = await this.databaseService.getDeviceById(deviceId);
        if (!device || device.type !== 'door_lock') return null;

        return this.databaseService.updateDeviceState(deviceId, { locked: false });
    }

    async setFanSpeed(deviceId: string, speed: number): Promise<Device | null> {
        if (this.useHomeAssistant) {
            try {
                await this.homeAssistantService.setFanSpeed(deviceId, speed);
                const entity = await this.homeAssistantService.getEntityState(deviceId);
                return this.entityMapperService.mapEntityToDevice(entity);
            } catch (error) {
                this.logger.error(`Failed to set fan speed for ${deviceId}:`, error.message);
                return null;
            }
        }

        const device = await this.databaseService.getDeviceById(deviceId);
        if (!device || device.type !== 'fan') return null;

        return this.databaseService.updateDeviceState(deviceId, {
            speed: Math.max(0, Math.min(100, speed)),
            power: speed > 0 ? 'on' : 'off',
        });
    }

    async getDeviceStatus(deviceId: string): Promise<{ device: Device; status: string } | null> {
        const device = await this.databaseService.getDeviceById(deviceId);
        if (!device) return null;

        let status = `${device.name} in ${device.area} is `;

        switch (device.type) {
            case 'light':
                status += device.state.power === 'on'
                    ? `on at ${device.state.brightness}% brightness`
                    : 'off';
                break;
            case 'thermostat':
                status += `set to ${device.state.temperature}°C`;
                break;
            case 'door_lock':
                status += device.state.locked ? 'locked' : 'unlocked';
                break;
            case 'fan':
                status += device.state.power === 'on'
                    ? `on at ${device.state.speed}% speed`
                    : 'off';
                break;
            default:
                status += device.state.power || 'unknown';
        }

        return { device, status };
    }

    async getSensorStatus(sensorId: string): Promise<{ sensor: Sensor; status: string } | null> {
        const sensor = await this.databaseService.getSensorById(sensorId);
        if (!sensor) return null;

        const status = `${sensor.name} in ${sensor.area}: ${sensor.state.value}${sensor.state.unit || ''}`;
        return { sensor, status };
    }
}
