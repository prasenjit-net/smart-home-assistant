import { Injectable, OnModuleInit } from '@nestjs/common';
import * as fs from 'fs/promises';
import * as path from 'path';
import { SmartHomeData, Device, Sensor } from '../models/device.model';

@Injectable()
export class DatabaseService implements OnModuleInit {
    private readonly dbPath = path.join(process.cwd(), 'data', 'smarthome.json');
    private data: SmartHomeData = {
        devices: [],
        sensors: [],
        areas: [],
    };

    async onModuleInit() {
        await this.loadData();
    }

    private async loadData(): Promise<void> {
        try {
            const dataDir = path.dirname(this.dbPath);
            await fs.mkdir(dataDir, { recursive: true });

            const fileContent = await fs.readFile(this.dbPath, 'utf-8');
            this.data = JSON.parse(fileContent);
            console.log('Database loaded successfully');
        } catch (error) {
            console.log('No existing database found, initializing with sample data');
            await this.initializeWithSampleData();
        }
    }

    private async saveData(): Promise<void> {
        const dataDir = path.dirname(this.dbPath);
        await fs.mkdir(dataDir, { recursive: true });
        await fs.writeFile(this.dbPath, JSON.stringify(this.data, null, 2), 'utf-8');
    }

    private async initializeWithSampleData(): Promise<void> {
        this.data = {
            areas: ['Living Room', 'Bedroom', 'Kitchen', 'Bathroom', 'Garage'],
            devices: [
                {
                    id: 'light-1',
                    name: 'Living Room Ceiling Light',
                    type: 'light' as any,
                    area: 'Living Room',
                    state: { power: 'off', brightness: 0 },
                },
                {
                    id: 'light-2',
                    name: 'Bedroom Table Lamp',
                    type: 'light' as any,
                    area: 'Bedroom',
                    state: { power: 'off', brightness: 0 },
                },
                {
                    id: 'thermostat-1',
                    name: 'Main Thermostat',
                    type: 'thermostat' as any,
                    area: 'Living Room',
                    state: { power: 'on', temperature: 22 },
                },
                {
                    id: 'lock-1',
                    name: 'Front Door Lock',
                    type: 'door_lock' as any,
                    area: 'Living Room',
                    state: { locked: true },
                },
                {
                    id: 'fan-1',
                    name: 'Bedroom Ceiling Fan',
                    type: 'fan' as any,
                    area: 'Bedroom',
                    state: { power: 'off', speed: 0 },
                },
            ],
            sensors: [
                {
                    id: 'temp-1',
                    name: 'Living Room Temperature Sensor',
                    type: 'temperature' as any,
                    area: 'Living Room',
                    state: { value: 22.5, unit: '°C', lastUpdated: new Date() },
                },
                {
                    id: 'humid-1',
                    name: 'Bathroom Humidity Sensor',
                    type: 'humidity' as any,
                    area: 'Bathroom',
                    state: { value: 65, unit: '%', lastUpdated: new Date() },
                },
                {
                    id: 'motion-1',
                    name: 'Garage Motion Sensor',
                    type: 'motion' as any,
                    area: 'Garage',
                    state: { value: false, lastUpdated: new Date() },
                },
            ],
        };
        await this.saveData();
    }

    // Device operations
    async getAllDevices(): Promise<Device[]> {
        return this.data.devices;
    }

    async getDeviceById(id: string): Promise<Device | undefined> {
        return this.data.devices.find((d) => d.id === id);
    }

    async getDevicesByArea(area: string): Promise<Device[]> {
        return this.data.devices.filter((d) => d.area.toLowerCase() === area.toLowerCase());
    }

    async updateDeviceState(id: string, state: Partial<Device['state']>): Promise<Device | null> {
        const device = this.data.devices.find((d) => d.id === id);
        if (!device) return null;

        device.state = { ...device.state, ...state };
        await this.saveData();
        return device;
    }

    // Sensor operations
    async getAllSensors(): Promise<Sensor[]> {
        return this.data.sensors;
    }

    async getSensorById(id: string): Promise<Sensor | undefined> {
        return this.data.sensors.find((s) => s.id === id);
    }

    async getSensorsByArea(area: string): Promise<Sensor[]> {
        return this.data.sensors.filter((s) => s.area.toLowerCase() === area.toLowerCase());
    }

    // Area operations
    async getAllAreas(): Promise<string[]> {
        return this.data.areas;
    }

    // Complete data access
    async getAllData(): Promise<SmartHomeData> {
        return this.data;
    }
}
