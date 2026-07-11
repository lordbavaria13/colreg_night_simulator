import { MAX_DIST } from '../config.js';

const RADIUS      = MAX_DIST * 0.5;
const PASS_OFFSET = MAX_DIST * 0.1;
const LINE_LENGTH = MAX_DIST * 1.6;

export const ROUTES = [

    {
        type: 'loop',
        fn: (t) => {
            const angle = t * Math.PI * 2;
            return {
                x:       Math.sin(angle) * RADIUS,
                z:       Math.cos(angle) * RADIUS,
                heading: Math.atan2(Math.cos(angle), -Math.sin(angle)),
            };
        },
    },

    {
        type: 'loop',
        fn: (t) => {
            const angle = -t * Math.PI * 2;
            return {
                x:       Math.sin(angle) * RADIUS,
                z:       Math.cos(angle) * RADIUS,
                heading: Math.atan2(-Math.cos(angle), Math.sin(angle)),
            };
        },
    },

    {
        type: 'pingpong',
        fn: (t) => {
            const progress = t * LINE_LENGTH - LINE_LENGTH / 2;
            const angle    = 0.3;
            return {
                x:       Math.cos(angle) * progress + Math.sin(angle) * PASS_OFFSET,
                z:       Math.sin(angle) * progress - Math.cos(angle) * PASS_OFFSET,
                heading: Math.atan2(Math.cos(angle), Math.sin(angle)),
            };
        },
    },

    {
        type: 'pingpong',
        fn: (t) => {
            const progress = t * LINE_LENGTH - LINE_LENGTH / 2;
            const angle    = 0.3 + Math.PI / 2;
            return {
                x:       Math.cos(angle) * progress + Math.sin(angle) * PASS_OFFSET,
                z:       Math.sin(angle) * progress - Math.cos(angle) * PASS_OFFSET,
                heading: Math.atan2(Math.cos(angle), Math.sin(angle)),
            };
        },
    },

    {
        type: 'pingpong',
        fn: (t) => {
            const progress = t * LINE_LENGTH - LINE_LENGTH / 2;
            const zigzag   = Math.sin(t * Math.PI * 6) * PASS_OFFSET * 0.8;
            const dxdt     = Math.cos(t * Math.PI * 6) * PASS_OFFSET * 0.8 * Math.PI * 6 / LINE_LENGTH;
            const dzdt     = 1;
            return {
                x:       zigzag,
                z:       progress,
                heading: Math.atan2(dxdt, dzdt),
            };
        },
    },
];

export function getRandomRoute() {
    const route = ROUTES[Math.floor(Math.random() * ROUTES.length)];
    return {
        type:   route.type,
        fn:     route.fn,
        startT: Math.random(),
        dir:    1,
    };
}

const FIXED_PRESETS = {
    stationary: { x: 0, z: -85, heading: 0 },
    head_on: { x: 0, z: -85, heading: 0 },
    port_side: { x: 0, z: -85, heading: -Math.PI / 2 },
    starboard_side: { x: 0, z: -85, heading: Math.PI / 2 },
    approaching_from_stern: { x: 0, z: 95, heading: Math.PI },
};

export function getScenarioRoute(preset) {
    if (preset === 'gyring_head_on' || preset === 'gyring_stern') {
        const stern = preset === 'gyring_stern';
        return {
            type: 'loop',
            speed: 0.025,
            startT: 0,
            dir: 1,
            fn: (t) => ({
                x: 0,
                z: -85,
                heading: (stern ? Math.PI : 0) + Math.sin(t * Math.PI * 2) * 0.38,
            }),
        };
    }

    const fixed = FIXED_PRESETS[preset];
    if (!fixed) return getRandomRoute();

    return {
        type: 'fixed',
        speed: 0,
        startT: 0,
        dir: 1,
        fn: () => fixed,
    };
}
