export enum DeviceType {
    LIGHT = 'light',
    THERMOSTAT = 'thermostat',
    DOOR_LOCK = 'door_lock',
    WINDOW = 'window',
    FAN = 'fan',
    CAMERA = 'camera',
    SENSOR = 'sensor',
}

export enum SensorType {
    TEMPERATURE = 'temperature',
    HUMIDITY = 'humidity',
    MOTION = 'motion',
    DOOR = 'door',
    SMOKE = 'smoke',
}

export interface DeviceState {
    power?: 'on' | 'off';
    brightness?: number; // 0-100 for lights
    temperature?: number; // for thermostat
    locked?: boolean; // for door locks
    open?: boolean; // for windows
    speed?: number; // 0-100 for fans
    recording?: boolean; // for cameras
}

export interface SensorState {
    value: number | boolean | string;
    unit?: string;
    lastUpdated: Date;
}

export interface Device {
    id: string;
    name: string;
    type: DeviceType;
    area: string;
    state: DeviceState;
    metadata?: Record<string, any>;
}

export interface Sensor {
    id: string;
    name: string;
    type: SensorType;
    area: string;
    state: SensorState;
    metadata?: Record<string, any>;
}

export interface SmartHomeData {
    devices: Device[];
    sensors: Sensor[];
    areas: string[];
}
