import { Helpers } from '@/module/helpers';
import { SR5Actor } from '@/module/actor/SR5Actor';
import { AstralPerceptionFlow } from '@/module/vision/astralPerception/AstralPerceptionFlow';

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
        if (!token || !actor || !AstralPerceptionFlow.canPerceive(actor)) return;

        const leftColumn = html.querySelector<HTMLElement>('.col.left');
        if (!leftColumn) return;

        const control = document.createElement('button');
        control.type = 'button';
        control.className = 'control-icon sr5-astral-perception';
        control.dataset.tooltip = game.i18n.localize('SR5.Vision.ToggleAstralPerception');
        control.setAttribute('aria-label', game.i18n.localize('SR5.Vision.ToggleAstralPerception'));
        control.innerHTML = '<i class="fa-solid fa-eye" aria-hidden="true"></i>';
        control.classList.toggle('active', AstralPerceptionFlow.isActive(token.document));
        control.addEventListener('click', event => {
            event.preventDefault();
            control.disabled = true;
            void AstralPerceptionFlow.toggle(token.document)
                .then(active => control.classList.toggle('active', active))
                .finally(() => { control.disabled = false; });
        });
        leftColumn.append(control);
    }
}
