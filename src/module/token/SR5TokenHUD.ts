import { SR5Actor } from '@/module/actor/SR5Actor';
import { Helpers } from '@/module/helpers';
import { TestCreator } from '@/module/tests/TestCreator';
import { SR5 } from '@/module/config';
import { TokenLockHooks } from './TokenLockHooks';

const { TokenHUD } = foundry.applications.hud;

/**
 * Custom SR5 Token HUD extending Foundry VTT App V2 TokenHUD natively.
 */
export class SR5TokenHUD extends TokenHUD {
    override async _onRender(context: foundry.applications.hud.TokenHUD.RenderContext, options: foundry.applications.hud.TokenHUD.RenderOptions): Promise<void> {
        await super._onRender(context, options);
        await this.#injectRiggerButtons();
    }

    async #injectRiggerButtons() {
        const token = this.object;
        if (!token) return;

        const actor = token.actor as SR5Actor | null;
        if (!actor || !actor.isType('vehicle')) return;

        // Determine driver candidate
        let driver: SR5Actor | null = actor.getVehicleDriver() || null;

        // Fallback 1: Check player's assigned character document
        if (!driver && game.user.character && (game.user.character as SR5Actor).isType('character')) {
            driver = game.user.character as SR5Actor;
        }

        // Fallback 2: Check canvas controlled tokens (excluding target vehicle)
        if (!driver) {
            const controlled = Helpers.getControlledTokenActors();
            const charActor = controlled.find(a => a.isType('character') && a.id !== actor.id);
            if (charActor) driver = charActor;
        }

        // Hide Jump In button for GM if no rigger/driver is assigned or selected
        if (game.user.isGM && !driver) return;

        const rightColumn = this.element.querySelector('.col.right');
        if (!rightColumn) return;

        const isJumpedIn = actor.system.controlMode === 'rigger';
        const iconClass = isJumpedIn ? 'fas fa-sign-out-alt' : 'fas fa-steering-wheel';
        const tooltip = isJumpedIn ? 'SR5.Rigger.JumpOut' : 'SR5.Rigger.JumpIn';

        const btn = document.createElement('div');
        btn.classList.add('control-icon', 'rigger-jump-btn');
        if (isJumpedIn) btn.classList.add('active');
        btn.dataset.tooltip = game.i18n.localize(tooltip);

        const icon = document.createElement('i');
        icon.className = iconClass;
        btn.appendChild(icon);

        btn.addEventListener('click', async (event) => {
            event.preventDefault();
            event.stopPropagation();

            if (isJumpedIn) {
                // Jump Out
                const currentDriver = actor.getVehicleDriver() || driver;
                await actor.update({ system: { controlMode: 'autopilot' } } as any);
                if (currentDriver) {
                    await TokenLockHooks.setJumpedInState(currentDriver, null, false);
                }

                ui.notifications?.info(game.i18n.format('SR5.Rigger.JumpedOutSuccess', { vehicle: actor.name }));
            } else {
                // Jump In
                if (!driver) {
                    ui.notifications?.error(game.i18n.localize('SR5.Errors.NoDriverSelectedForJumpIn'));
                    return;
                }

                // If player does not own the vehicle, trigger a Jump In test first
                if (!actor.isOwner && !game.user.isGM) {
                    ui.notifications?.info(game.i18n.format('SR5.Rigger.JumpInTestRequired', { vehicle: actor.name }));
                    const test = await TestCreator.fromPackAction(
                        SR5.packNames.GeneralActionsPack,
                        'drone_pilot_vehicle',
                        actor,
                        { showDialog: true }
                    );
                    if (test) {
                        await test.execute();
                    }
                }

                if (driver.uuid) {
                    await actor.addVehicleDriver(driver.uuid);
                }

                await actor.update({ system: { controlMode: 'rigger' } } as any);
                await driver.update({
                    system: {
                        matrix: {
                            vr: true,
                            hot_sim: true
                        }
                    }
                } as any);

                await TokenLockHooks.setJumpedInState(driver, actor, true);

                ui.notifications?.info(game.i18n.format('SR5.Rigger.JumpedInSuccess', {
                    rigger: driver.name,
                    vehicle: actor.name
                }));
            }

            this.render();
        });

        rightColumn.appendChild(btn);
    }
}
