import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import {
    HAEntity,
    HAConfig,
    HAService,
    HAServiceCall,
    ClimateSetTemperatureParams,
    FanSetPercentageParams,
} from './homeassistant.types';

@Injectable()
export class HomeAssistantService {
    private readonly logger = new Logger(HomeAssistantService.name);
    private readonly axiosInstance: AxiosInstance;
    private readonly baseUrl: string;
    private readonly token: string;
    private isConnected: boolean = false;

    constructor(private readonly configService: ConfigService) {
        this.baseUrl = this.configService.get<string>('HOME_ASSISTANT_URL') || '';
        this.token = this.configService.get<string>('HOME_ASSISTANT_TOKEN') || '';

        if (!this.baseUrl || !this.token) {
            this.logger.warn('Home Assistant URL or token not configured');
        }

        this.axiosInstance = axios.create({
            baseURL: `${this.baseUrl}/api`,
            headers: {
                'Authorization': `Bearer ${this.token}`,
                'Content-Type': 'application/json',
            },
            timeout: 10000,
        });

        // Test connection on initialization
        this.testConnection().catch(err => {
            this.logger.error('Failed to connect to Home Assistant', err.message);
        });
    }

    /**
     * Test connection to Home Assistant
     */
    async testConnection(): Promise<boolean> {
        try {
            const response = await this.axiosInstance.get('/');
            this.isConnected = response.data.message === 'API running.';
            if (this.isConnected) {
                this.logger.log('Successfully connected to Home Assistant');
            }
            return this.isConnected;
        } catch (error) {
            this.logger.error('Failed to connect to Home Assistant:', error.message);
            this.isConnected = false;
            throw error;
        }
    }

    /**
     * Get Home Assistant configuration
     */
    async getConfig(): Promise<HAConfig> {
        try {
            const response = await this.axiosInstance.get<HAConfig>('/config');
            return response.data;
        } catch (error) {
            this.logger.error('Failed to get HA config:', error.message);
            throw error;
        }
    }

    /**
     * Get all entity states
     */
    async getAllStates(): Promise<HAEntity[]> {
        try {
            const response = await this.axiosInstance.get<HAEntity[]>('/states');
            return response.data;
        } catch (error) {
            this.logger.error('Failed to get all states:', error.message);
            throw error;
        }
    }

    /**
     * Get state of a specific entity
     */
    async getEntityState(entityId: string): Promise<HAEntity> {
        try {
            const response = await this.axiosInstance.get<HAEntity>(`/states/${entityId}`);
            return response.data;
        } catch (error) {
            this.logger.error(`Failed to get state for ${entityId}:`, error.message);
            throw error;
        }
    }

    /**
     * Get all entities by domain (e.g., 'light', 'switch', 'sensor')
     */
    async getEntitiesByDomain(domain: string): Promise<HAEntity[]> {
        const allStates = await this.getAllStates();
        return allStates.filter(entity => entity.entity_id.startsWith(`${domain}.`));
    }

    /**
     * Get all available services
     */
    async getServices(): Promise<HAService[]> {
        try {
            const response = await this.axiosInstance.get<HAService[]>('/services');
            return response.data;
        } catch (error) {
            this.logger.error('Failed to get services:', error.message);
            throw error;
        }
    }

    /**
     * Call a Home Assistant service
     */
    async callService(domain: string, service: string, data?: any): Promise<any> {
        try {
            const response = await this.axiosInstance.post(
                `/services/${domain}/${service}`,
                data || {},
            );
            this.logger.log(`Called service ${domain}.${service} for ${data?.entity_id || 'multiple entities'}`);
            return response.data;
        } catch (error) {
            this.logger.error(`Failed to call service ${domain}.${service}:`, error.message);
            throw error;
        }
    }

    /**
     * Turn on a device
     */
    async turnOn(entityId: string, params?: Partial<{ brightness: number; rgb_color: [number, number, number] }>): Promise<any> {
        const domain = entityId.split('.')[0];
        const data: any = { entity_id: entityId };

        // Add brightness for lights (HA uses 0-255, we'll convert from 0-100)
        if (params?.brightness !== undefined && domain === 'light') {
            data.brightness = Math.round((params.brightness / 100) * 255);
        }

        if (params?.rgb_color) {
            data.rgb_color = params.rgb_color;
        }

        return this.callService(domain, 'turn_on', data);
    }

    /**
     * Turn off a device
     */
    async turnOff(entityId: string): Promise<any> {
        const domain = entityId.split('.')[0];
        return this.callService(domain, 'turn_off', { entity_id: entityId });
    }

    /**
     * Set brightness for a light (0-100)
     */
    async setBrightness(entityId: string, brightness: number): Promise<any> {
        // Convert 0-100 to 0-255 for HA
        const haBrightness = Math.round((brightness / 100) * 255);
        return this.callService('light', 'turn_on', {
            entity_id: entityId,
            brightness: haBrightness,
        });
    }

    /**
     * Set temperature for climate device
     */
    async setTemperature(entityId: string, temperature: number): Promise<any> {
        const params: ClimateSetTemperatureParams = {
            entity_id: entityId,
            temperature,
        };
        return this.callService('climate', 'set_temperature', params);
    }

    /**
     * Lock a door
     */
    async lockDoor(entityId: string): Promise<any> {
        return this.callService('lock', 'lock', { entity_id: entityId });
    }

    /**
     * Unlock a door
     */
    async unlockDoor(entityId: string): Promise<any> {
        return this.callService('lock', 'unlock', { entity_id: entityId });
    }

    /**
     * Set fan speed (0-100)
     */
    async setFanSpeed(entityId: string, speed: number): Promise<any> {
        const params: FanSetPercentageParams = {
            entity_id: entityId,
            percentage: speed,
        };
        return this.callService('fan', 'set_percentage', params);
    }

    /**
     * Get devices by area (requires area_id in entity attributes)
     */
    async getDevicesByArea(areaName: string): Promise<HAEntity[]> {
        const allStates = await this.getAllStates();

        // Filter by area_id or friendly_name containing area name
        return allStates.filter(entity => {
            const areaId = entity.attributes?.area_id;
            const friendlyName = entity.attributes?.friendly_name || '';

            // Check if area_id matches or friendly name contains area name
            return (
                areaId?.toLowerCase().includes(areaName.toLowerCase()) ||
                friendlyName.toLowerCase().includes(areaName.toLowerCase())
            );
        }).filter(entity => {
            // Exclude sensors and binary_sensors
            return !entity.entity_id.startsWith('sensor.') &&
                !entity.entity_id.startsWith('binary_sensor.');
        });
    }

    /**
     * Get sensors by area
     */
    async getSensorsByArea(areaName: string): Promise<HAEntity[]> {
        const allStates = await this.getAllStates();

        return allStates.filter(entity => {
            const areaId = entity.attributes?.area_id;
            const friendlyName = entity.attributes?.friendly_name || '';
            const isSensor = entity.entity_id.startsWith('sensor.') ||
                entity.entity_id.startsWith('binary_sensor.');

            return isSensor && (
                areaId?.toLowerCase().includes(areaName.toLowerCase()) ||
                friendlyName.toLowerCase().includes(areaName.toLowerCase())
            );
        });
    }

    /**
     * Get all unique areas from entities
     */
    async getAreas(): Promise<string[]> {
        const allStates = await this.getAllStates();
        const areas = new Set<string>();

        allStates.forEach(entity => {
            const areaId = entity.attributes?.area_id;
            if (areaId) {
                areas.add(areaId);
            }
        });

        return Array.from(areas);
    }

    /**
     * Check if HA integration is enabled
     */
    isEnabled(): boolean {
        return !!this.baseUrl && !!this.token;
    }

    /**
     * Get connection status
     */
    getConnectionStatus(): boolean {
        return this.isConnected;
    }
}
