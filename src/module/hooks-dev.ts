import { quenchRegister } from "@/unittests/quench";

/**
 * This module is only used in development builds and contains hooks for testing and debugging purposes.
 */
export const DevHooks = {
    registerHooks() {
        this.registerQuenchHooks();
    },

    registerQuenchHooks() {
        Hooks.on('quenchReady', (quench) => {
            quenchRegister(quench);
        });
    }
}