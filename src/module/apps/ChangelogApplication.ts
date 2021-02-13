import {FLAGS, SYSTEM_NAME} from "../constants";

export class ChangelogApplication extends Application {
    get template(): string {
        return 'systems/shadowrun5e/dist/templates/apps/changelog.html';
    }

    static get defaultOptions() {
        const options = super.defaultOptions;
        options.classes = ['shadowrun5e'];
        options.title = game.i18n.localize('SR5.ChangelogApplication.Title');
        options.width = 500;
        options.height = 'auto';
        return options;
    }

    render(force?: boolean, options?: Application.RenderOptions): Application {
        ChangelogApplication.setRenderForCurrentVersion();
        return super.render(force, options);
    }

    // Let the async operation happen in background.
    private static setRenderForCurrentVersion() {
        game.user.setFlag(SYSTEM_NAME, FLAGS.ChangelogShownForVersion, game.system.data.version);
    }

    static get showApplication(): boolean {
        if (!game.user.isGM || !game.user.isTrusted) return false;

        const shownForVersion = game.user.getFlag(SYSTEM_NAME, FLAGS.ChangelogShownForVersion);
        return shownForVersion !== game.system.data.version;
    }
}