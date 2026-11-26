import { DeepPartial } from 'fvtt-types/utils';
import { FLAGS, SYSTEM_NAME } from '../constants';

import ApplicationV2 = foundry.applications.api.ApplicationV2;
import HandlebarsApplicationMixin = foundry.applications.api.HandlebarsApplicationMixin;

export class ChangelogApplication extends HandlebarsApplicationMixin(ApplicationV2) {
    static override PARTS = {
        main: {
            template: 'systems/shadowrun5e/dist/templates/apps/changelog.hbs',
        },
    };

    static override DEFAULT_OPTIONS = {
        classes: ['shadowrun5e'],
        window: {
            title: 'SR5.ChangelogApplication.Title',
        },
        position: {
            width: 500,
            height: 'auto' as const,
        },
    };

    protected override async _onRender(
        context: DeepPartial<HandlebarsApplicationMixin.RenderContext>,
        options: DeepPartial<ApplicationV2.RenderOptions>,
    ) {
        ChangelogApplication.setRenderForCurrentVersion();
        return super._onRender(context, options);
    }

    // Let the async operation happen in background.
    private static setRenderForCurrentVersion() {
        void game.user?.setFlag(SYSTEM_NAME, FLAGS.ChangelogShownForVersion, game.system.version);
    }

    static get showApplication(): boolean {
        if (!game.user?.isGM || !game.user?.isTrusted) return false;

        const shownForVersion = game.user?.getFlag(SYSTEM_NAME, FLAGS.ChangelogShownForVersion);
        return shownForVersion !== game.system.version;
    }
}