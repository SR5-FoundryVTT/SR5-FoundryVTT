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
        const control = document.createElement('button');
        control.type = 'button';
        control.className = 'control-icon sr5-astral-perception';
        control.dataset.tooltip = game.i18n.localize('SR5.Vision.ToggleAstralPerception');
        control.setAttribute('aria-label', game.i18n.localize('SR5.Vision.ToggleAstralPerception'));
        control.innerHTML = '<i class="fa-solid fa-eye" aria-hidden="true"></i>';
        control.classList.toggle('active', AstralPerceptionFlow.isActive(token.document));
        control.addEventListener('click', (event) => {
            event.preventDefault();
            control.disabled = true;
            void AstralPerceptionFlow.toggle(token.document)
                .then((active) => control.classList.toggle('active', active))
                .catch((error) => this.reportToggleFailure(error))
                .finally(() => {
                    control.disabled = false;
                });
        });
        return control;
    }

    private static astralProjectionControl(token: Token) {
        const projected = AstralProjectionFlow.isProjected(token.document);
        const localizationKey = projected
            ? 'SR5.Vision.ReturnFromAstralProjection'
            : 'SR5.Vision.BeginAstralProjection';
        const control = document.createElement('button');
        control.type = 'button';
        control.className = 'control-icon sr5-astral-projection';
        control.dataset.tooltip = game.i18n.localize(localizationKey);
        control.setAttribute('aria-label', game.i18n.localize(localizationKey));
        control.innerHTML = '<i class="fa-solid fa-ghost" aria-hidden="true"></i>';
        control.classList.toggle('active', projected);
        control.addEventListener('click', (event) => {
            event.preventDefault();
            control.disabled = true;
            void AstralProjectionFlow.toggle(token.document)
                .catch((error) => this.reportToggleFailure(error))
                .finally(() => {
                    control.disabled = false;
                });
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
