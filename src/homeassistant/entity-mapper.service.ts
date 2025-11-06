import { Injectable } from '@nestjs/common';
import { HAEntity } from './homeassistant.types';
import { Device, Sensor, DeviceType, SensorType } from '../models/device.model';

@Injectable()
export class EntityMapperService {
    /**
     * Convert HA entity to Device model
     */
    mapEntityToDevice(entity: HAEntity): Device | null {
        const domain = entity.entity_id.split('.')[0];

        // Skip sensors and binary_sensors
        if (domain === 'sensor' || domain === 'binary_sensor') {
            return null;
        }

        const deviceType = this.getDomainToDeviceType(domain);
        if (!deviceType) {
            return null;
        }

        const state: Device['state'] = {
            power: entity.state === 'on' ? 'on' : 'off',
        };

        // Add type-specific attributes
        if (deviceType === DeviceType.LIGHT && entity.attributes.brightness !== undefined) {
            state.brightness = Math.round((entity.attributes.brightness / 255) * 100);
        }

        if (deviceType === DeviceType.THERMOSTAT) {
            state.temperature = entity.attributes.temperature || entity.attributes.current_temperature;
        }

        if (deviceType === DeviceType.DOOR_LOCK) {
            state.locked = entity.state === 'locked';
        }

        if (deviceType === DeviceType.FAN && entity.attributes.percentage !== undefined) {
            state.speed = entity.attributes.percentage;
        }

        const device: Device = {
            id: entity.entity_id,
            name: entity.attributes.friendly_name || entity.entity_id,
            type: deviceType,
            state,
            area: this.extractArea(entity),
        };

        return device;
    }

    /**
     * Convert HA entity to Sensor model
     */
    mapEntityToSensor(entity: HAEntity): Sensor | null {
        const domain = entity.entity_id.split('.')[0];

        // Only process sensors and binary_sensors
        if (domain !== 'sensor' && domain !== 'binary_sensor') {
            return null;
        }

        const sensorType = this.getDeviceClassToSensorType(
            entity.attributes.device_class,
            domain,
        );

        if (!sensorType) {
            return null;
        }

        // Parse value based on sensor type
        let value: number | boolean | string;
        if (sensorType === SensorType.MOTION) {
            value = entity.state === 'on';
        } else if (sensorType === SensorType.TEMPERATURE || sensorType === SensorType.HUMIDITY) {
            value = parseFloat(entity.state) || 0;
        } else {
            value = entity.state;
        }

        const sensor: Sensor = {
            id: entity.entity_id,
            name: entity.attributes.friendly_name || entity.entity_id,
            type: sensorType,
            area: this.extractArea(entity),
            state: {
                value,
                unit: entity.attributes.unit_of_measurement,
                lastUpdated: new Date(entity.last_updated),
            },
        };

        return sensor;
    }

    /**
     * Map multiple HA entities to devices
     */
    mapEntitiesToDevices(entities: HAEntity[]): Device[] {
        return entities
            .map(entity => this.mapEntityToDevice(entity))
            .filter((device): device is Device => device !== null);
    }

    /**
     * Map multiple HA entities to sensors
     */
    mapEntitiesToSensors(entities: HAEntity[]): Sensor[] {
        return entities
            .map(entity => this.mapEntityToSensor(entity))
            .filter((sensor): sensor is Sensor => sensor !== null);
    }

    /**
     * Extract area name from entity
     */
    private extractArea(entity: HAEntity): string {
        // Try area_id first
        if (entity.attributes.area_id) {
            return this.formatAreaName(entity.attributes.area_id);
        }

        // Try to extract from friendly_name
        const friendlyName = entity.attributes.friendly_name || '';
        const areaMatch = friendlyName.match(/^(\w+\s+\w+)/);
        if (areaMatch) {
            return areaMatch[1];
        }

        return 'Unknown';
    }

    /**
     * Format area name (e.g., 'living_room' -> 'Living Room')
     */
    private formatAreaName(areaId: string): string {
        return areaId
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }

    /**
     * Map HA domain to our DeviceType
     */
    private getDomainToDeviceType(domain: string): DeviceType | null {
        const mapping: Record<string, DeviceType> = {
            light: DeviceType.LIGHT,
            switch: DeviceType.LIGHT, // Map switches to lights for simplicity
            climate: DeviceType.THERMOSTAT,
            lock: DeviceType.DOOR_LOCK,
            fan: DeviceType.FAN,
        };

        return mapping[domain] || null;
    }

    /**
     * Map HA device_class to our SensorType
     */
    private getDeviceClassToSensorType(
        deviceClass: string | undefined,
        domain: string,
    ): SensorType | null {
        // For temperature sensors
        if (deviceClass === 'temperature') {
            return SensorType.TEMPERATURE;
        }

        // For humidity sensors
        if (deviceClass === 'humidity') {
            return SensorType.HUMIDITY;
        }

        // For motion/occupancy sensors
        if (deviceClass === 'motion' || deviceClass === 'occupancy') {
            return SensorType.MOTION;
        }

        // For binary_sensor domain without specific class
        if (domain === 'binary_sensor' && (deviceClass === 'motion' || deviceClass === 'occupancy')) {
            return SensorType.MOTION;
        }

        return null;
    }
}
