import { SR5Actor } from '@/module/actor/SR5Actor';
import { SYSTEM_NAME } from '@/module/constants';

export const TokenLockHooks = {
    registerHooks: () => {
        Hooks.on('preUpdateToken', TokenLockHooks.onPreUpdateToken_LockJumpedInRigger);
    },

    /**
     * Set or clear the jumped-in state and canvas token lock for a driver actor.
     */
    setJumpedInState: async (driver: SR5Actor, vehicle: SR5Actor | null, isJumpedIn: boolean) => {
        if (!driver) return;

        if (isJumpedIn && vehicle) {
            await (driver as any).setFlag(SYSTEM_NAME, 'jumpedInVehicle', vehicle.name || 'Vehicle');
            const charId = driver.id ? driver.id.split('.').pop()! : '';
            const sceneTokens = canvas.scene?.tokens?.contents || [];
            for (const t of sceneTokens) {
                if (t.actor?.id && (t.actor.id === driver.id || t.actor.id.split('.').pop() === charId)) {
                    await t.update({ locked: true });
                }
            }
        } else {
            await (driver as any).unsetFlag(SYSTEM_NAME, 'jumpedInVehicle');
            const charId = driver.id ? driver.id.split('.').pop()! : '';
            const sceneTokens = canvas.scene?.tokens?.contents || [];
            for (const t of sceneTokens) {
                if (t.actor?.id && (t.actor.id === driver.id || t.actor.id.split('.').pop() === charId)) {
                    await t.update({ locked: false });
                }
            }
        }
    },

    /**
     * Prevent movement of player character token if the character is currently jumped into a drone or vehicle.
     */
    onPreUpdateToken_LockJumpedInRigger: (tokenDoc: TokenDocument, update: Record<string, any>): boolean | void => {
        if (!('x' in update || 'y' in update)) return;

        const actor = tokenDoc.actor as SR5Actor | null;
        if (!actor) return;

        const vehicleName = ((actor as any).getFlag?.(SYSTEM_NAME, 'jumpedInVehicle') as string | undefined) ||
                            ((actor as any).baseActor?.getFlag?.(SYSTEM_NAME, 'jumpedInVehicle') as string | undefined);

        if (vehicleName) {
            ui.notifications?.warn(game.i18n.format('SR5.Warnings.TokenMovementLockedJumpedIn', {
                vehicle: vehicleName
            }));
            return false; // Abort token position update in Foundry VTT!
        }
    }
};
