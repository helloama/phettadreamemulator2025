export const ZoneIds = {
    VOID: 'void'
};

export const ZoneDefinitions = {
    [ZoneIds.VOID]: {
        name: 'Void',
        skyColor: 0x06030f,
        fog: { color: 0x06030f, density: 0.01 },
        ground: { color: 0x1b1236, size: 200 },
        objects: {
            count: [6, 12], // min, max
            palette: [0xffd400, 0xff93a6, 0x8ef9f3, 0xb084ff],
            geometries: ['box','sphere','torus']
        },
        audio: null
    }
};
