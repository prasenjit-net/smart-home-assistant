/**
 * Home Assistant API Type Definitions
 */

export interface HAEntity {
    entity_id: string;
    state: string;
    attributes: {
        friendly_name?: string;
        area_id?: string;
        device_class?: string;
        unit_of_measurement?: string;
        brightness?: number;
        temperature?: number;
        current_temperature?: number;
        hvac_mode?: string;
        supported_features?: number;
        [key: string]: any;
    };
    last_changed: string;
    last_updated: string;
    context: {
        id: string;
        parent_id: string | null;
        user_id: string | null;
    };
}

export interface HAServiceCall {
    domain: string;
    service: string;
    service_data?: Record<string, any>;
    target?: {
        entity_id?: string | string[];
        device_id?: string | string[];
        area_id?: string | string[];
    };
}

export interface HAConfig {
    latitude: number;
    longitude: number;
    elevation: number;
    unit_system: {
        length: string;
        mass: string;
        temperature: string;
        volume: string;
    };
    location_name: string;
    time_zone: string;
    components: string[];
    config_dir: string;
    whitelist_external_dirs: string[];
    version: string;
    state: string;
}

export interface HAService {
    domain: string;
    services: {
        [serviceName: string]: {
            name?: string;
            description?: string;
            fields?: {
                [fieldName: string]: {
                    description?: string;
                    example?: any;
                    required?: boolean;
                };
            };
        };
    };
}

export interface HAArea {
    area_id: string;
    name: string;
    picture?: string;
}

// Domain types
export type HADomain =
    | 'light'
    | 'switch'
    | 'climate'
    | 'lock'
    | 'fan'
    | 'cover'
    | 'sensor'
    | 'binary_sensor'
    | 'media_player'
    | 'camera'
    | 'vacuum';

// Common service parameters
export interface TurnOnParams {
    entity_id: string;
    brightness?: number;
    rgb_color?: [number, number, number];
    color_temp?: number;
    transition?: number;
}

export interface ClimateSetTemperatureParams {
    entity_id: string;
    temperature?: number;
    target_temp_high?: number;
    target_temp_low?: number;
    hvac_mode?: string;
}

export interface FanSetPercentageParams {
    entity_id: string;
    percentage: number;
}
