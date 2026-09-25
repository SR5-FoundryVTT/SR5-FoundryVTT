import { Helpers } from '@/module/helpers';
import { SR5Actor } from '@/module/actor/SR5Actor';
import { AstralPerceptionFlow } from '@/module/vision/astralPerception/AstralPerceptionFlow';
import { AstralProjectionFlow } from '@/module/vision/astralProjection/AstralProjectionFlow';

export class VisionHUD {
    static onRenderTokenHUD(
        _app: foundry.applications.hud.TokenHUD,
        html: HTMLElement,
        context: foundry.applications.hud.TokenHUD.RenderContext & { _id?: string },
        _options: foundry.applications.hud.TokenHUD.RenderOptions,
    ) {
        if (!context._id) return;
        const token = Helpers.getToken(context._id);
        const actor = token?.actor as SR5Actor | undefined;
        if (!token || !actor) return;

        const leftColumn = html.querySelector<HTMLElement>('.col.left');
        if (!leftColumn) return;

        const projectionState = AstralProjectionFlow.getState(token.document);
        if (AstralPerceptionFlow.canPerceive(actor) && !projectionState) {
            leftColumn.append(this.astralPerceptionControl(token));
        }
        if (AstralProjectionFlow.canProject(actor)) {
            leftColumn.append(this.astralProjectionControl(token));
        }
    }

    private static astralPerceptionControl(token: Token) {
        return this.toggleControl({
            className: 'sr5-astral-perception',
            label: 'SR5.Vision.ToggleAstralPerception',
            icon: 'fa-eye',
            active: AstralPerceptionFlow.isActive(token.document),
            toggle: () => AstralPerceptionFlow.toggle(token.document),
        });
    }

    private static astralProjectionControl(token: Token) {
        const projected = AstralProjectionFlow.isProjected(token.document);
        return this.toggleControl({
            className: 'sr5-astral-projection',
            label: projected ? 'SR5.Vision.ReturnFromAstralProjection' : 'SR5.Vision.BeginAstralProjection',
            icon: 'fa-ghost',
            active: projected,
            toggle: () => AstralProjectionFlow.toggle(token.document),
        });
    }

    /**
     * A HUD button that is disabled while its toggle runs and then shows the resulting state.
     *
     * @param options.toggle Resolves to whether the toggled state is now active.
     */
    private static toggleControl(options: {
        className: string;
        label: string;
        icon: string;
        active: boolean;
        toggle: () => Promise<boolean>;
    }) {
        const label = game.i18n.localize(options.label);
        const control = document.createElement('button');
        control.type = 'button';
        control.className = `control-icon ${options.className}`;
        control.dataset.tooltip = label;
        control.setAttribute('aria-label', label);
        control.innerHTML = `<i class="fa-solid ${options.icon}" aria-hidden="true"></i>`;
        control.classList.toggle('active', options.active);
        control.addEventListener('click', (event) => {
            event.preventDefault();
            control.disabled = true;
            void options.toggle()
                .then((active) => control.classList.toggle('active', active))
                .catch((error) => this.reportToggleFailure(error))
                .finally(() => { control.disabled = false; });
        });
        return control;
    }

    /**
     * Surface failures of the vision controls, which otherwise only ever show up as an unhandled
     * rejection. Missing GMs and failed token creation both end up here.
     */
    private static reportToggleFailure(error: unknown) {
        console.error('Shadowrun 5e | Astral vision toggle failed.', error);
        ui.notifications?.error(game.i18n.localize('SR5.Vision.AstralToggleFailed'));
    }
}
