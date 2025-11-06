import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { Device, Sensor, DeviceState } from '../models/device.model';

@Injectable()
export class SmartHomeService {
    constructor(private readonly databaseService: DatabaseService) { }

    async getAllDevices(): Promise<Device[]> {
        return this.databaseService.getAllDevices();
    }

    async getDeviceById(id: string): Promise<Device | undefined> {
        return this.databaseService.getDeviceById(id);
    }

    async getDevicesByArea(area: string): Promise<Device[]> {
        return this.databaseService.getDevicesByArea(area);
    }

    async getAllSensors(): Promise<Sensor[]> {
        return this.databaseService.getAllSensors();
    }

    async getSensorById(id: string): Promise<Sensor | undefined> {
        return this.databaseService.getSensorById(id);
    }

    async getSensorsByArea(area: string): Promise<Sensor[]> {
        return this.databaseService.getSensorsByArea(area);
    }

    async getAllAreas(): Promise<string[]> {
        return this.databaseService.getAllAreas();
    }

    async updateDeviceState(deviceId: string, state: Partial<DeviceState>): Promise<Device | null> {
        return this.databaseService.updateDeviceState(deviceId, state);
    }

    async turnOnDevice(deviceId: string): Promise<Device | null> {
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
        return this.databaseService.updateDeviceState(deviceId, { power: 'off' });
    }

    async setBrightness(deviceId: string, brightness: number): Promise<Device | null> {
        const device = await this.databaseService.getDeviceById(deviceId);
        if (!device || device.type !== 'light') return null;

        return this.databaseService.updateDeviceState(deviceId, {
            brightness: Math.max(0, Math.min(100, brightness)),
            power: brightness > 0 ? 'on' : 'off',
        });
    }

    async setTemperature(deviceId: string, temperature: number): Promise<Device | null> {
        const device = await this.databaseService.getDeviceById(deviceId);
        if (!device || device.type !== 'thermostat') return null;

        return this.databaseService.updateDeviceState(deviceId, {
            temperature: Math.max(10, Math.min(35, temperature)),
        });
    }

    async lockDoor(deviceId: string): Promise<Device | null> {
        const device = await this.databaseService.getDeviceById(deviceId);
        if (!device || device.type !== 'door_lock') return null;

        return this.databaseService.updateDeviceState(deviceId, { locked: true });
    }

    async unlockDoor(deviceId: string): Promise<Device | null> {
        const device = await this.databaseService.getDeviceById(deviceId);
        if (!device || device.type !== 'door_lock') return null;

        return this.databaseService.updateDeviceState(deviceId, { locked: false });
    }

    async setFanSpeed(deviceId: string, speed: number): Promise<Device | null> {
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
