import { quenchRegister } from "@/unittests/quench";
import { PackSourceExportFlow } from './flows/PackSourceExportFlow';

/**
 * This module is only used in development builds and contains hooks for testing and debugging purposes.
 */
export const DevHooks = {
    registerHooks() {
        Hooks.once('init', () => {
            game.shadowrun5e.PackSourceExportFlow = PackSourceExportFlow;
        });
        this.registerQuenchHooks();
    },

    registerQuenchHooks() {
        Hooks.on('quenchReady', (quench) => {
            quenchRegister(quench);
        });
    }
};
