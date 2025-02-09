import { expect } from '@jest/globals';
// Estendendo o expect para incluir funcionalidades do should
expect.extend({
    toBeDefined(received) {
        const pass = received !== undefined;
        return {
            message: () => `expected ${received} ${pass ? 'not ' : ''}to be defined`,
            pass,
        };
    },
    toBeNull(received) {
        const pass = received === null;
        return {
            message: () => `expected ${received} ${pass ? 'not ' : ''}to be null`,
            pass,
        };
    },
    toBeTrue(received) {
        const pass = received === true;
        return {
            message: () => `expected ${received} ${pass ? 'not ' : ''}to be true`,
            pass,
        };
    },
    toBeFalse(received) {
        const pass = received === false;
        return {
            message: () => `expected ${received} ${pass ? 'not ' : ''}to be false`,
            pass,
        };
    },
});
//# sourceMappingURL=setup.js.map