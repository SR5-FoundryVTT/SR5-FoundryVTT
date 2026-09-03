import { SR5Actor } from '@/module/actor/SR5Actor';
import { Helpers } from '@/module/helpers';
import { RiggerFlow } from '@/module/flows/RiggerFlow';

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

            await RiggerFlow.toggleJumpIn(driver, actor);
            this.render();
        });

        rightColumn.appendChild(btn);
    }
}
