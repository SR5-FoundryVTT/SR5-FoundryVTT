import { DeepReadonly } from 'fvtt-types/utils';
import { SR5Actor } from '@/module/actor/SR5Actor';
import { SYSTEM_NAME } from '@/module/constants';
import { RiggerFlow } from '@/module/flows/RiggerFlow';

export const TokenLockHooks = {
    registerHooks: () => {
        Hooks.on('preMoveToken', TokenLockHooks.onPreMoveToken_LockJumpedInRigger);
        Hooks.on('preUpdateToken', TokenLockHooks.onPreUpdateToken_NotifyDroneMovement);
    },

    /**
     * Set or clear the jumped-in state for a driver actor.
     */
    setJumpedInState: async (driver: SR5Actor | null, vehicle: SR5Actor | null, isJumpedIn: boolean) => {
        if (!driver) return;

        const driverInstances = RiggerFlow.getActorInstances(driver);

        if (isJumpedIn && vehicle) {
            const vehicleInstances = RiggerFlow.getActorInstances(vehicle);

            for (const d of driverInstances) {
                await d.setFlag(SYSTEM_NAME, 'jumpedInVehicle', vehicle.name || 'Vehicle');
                await d.toggleStatusEffect('sr5jumpedIn', { active: true });
            }

            for (const v of vehicleInstances) {
                await v.toggleStatusEffect('sr5riggedVehicle', { active: true });
            }
        } else {
            for (const d of driverInstances) {
                await d.unsetFlag(SYSTEM_NAME, 'jumpedInVehicle');
                await d.toggleStatusEffect('sr5jumpedIn', { active: false });
            }

            if (vehicle) {
                const vehicleInstances = RiggerFlow.getActorInstances(vehicle);
                for (const v of vehicleInstances) {
                    await v.toggleStatusEffect('sr5riggedVehicle', { active: false });
                }
            }
        }
    },

    /**
     * Prevent movement of character token if the character is currently jumped into a drone or vehicle,
     * while still allowing GM unconstrained movement.
     */
    onPreMoveToken_LockJumpedInRigger: (
        tokenDoc: TokenDocument,
        movement: DeepReadonly<TokenDocument.MovementOperation>,
        _operation?: Partial<foundry.abstract.types.DatabaseUpdateOperation>
    ): boolean | void => {
        if (game.user?.isGM && (movement?.constrainOptions?.ignoreWalls || movement?.constrainOptions?.ignoreCost)) {
            return;
        }

        const actor = tokenDoc.actor as SR5Actor | null;
        if (!actor) return;

        const vehicleName = actor.getFlag(SYSTEM_NAME, 'jumpedInVehicle') as string | undefined;

        if (vehicleName) {
            ui.notifications?.warn(game.i18n.format('SR5.Warnings.TokenMovementLockedJumpedIn', {
                vehicle: vehicleName
            }));
            return false;
        }
    },

    /**
     * Provide a visual movement indicator on canvas when a jumped-in drone/vehicle token is moved.
     */
    onPreUpdateToken_NotifyDroneMovement: (tokenDoc: TokenDocument, update: Record<string, any>): void => {
        const xChanged = update.x !== undefined && update.x !== tokenDoc.x;
        const yChanged = update.y !== undefined && update.y !== tokenDoc.y;
        if (!xChanged && !yChanged) return;

        const actor = tokenDoc.actor as SR5Actor | null;
        if (!actor || !actor.isType('vehicle')) return;

        if (actor.system.controlMode === 'rigger') {
            const driver = actor.getVehicleDriver();
            const riggerName = driver?.name || 'Rigger';
            const vehicleName = tokenDoc.name || actor.name;
            const msg = game.i18n.format('SR5.Rigger.RiggerMovingVehicle', {
                rigger: riggerName,
                vehicle: vehicleName
            });

            const center = tokenDoc.object?.center;
            if (canvas.interface?.createScrollingText && center) {
                canvas.interface.createScrollingText(center, msg, {
                    anchor: CONST.TEXT_ANCHOR_POINTS.TOP,
                    direction: CONST.TEXT_ANCHOR_POINTS.TOP,
                    fill: 0xffaa00,
                    stroke: 0x000000,
                    strokeThickness: 4,
                    fontSize: 22
                });
            }
        }
    }
};
