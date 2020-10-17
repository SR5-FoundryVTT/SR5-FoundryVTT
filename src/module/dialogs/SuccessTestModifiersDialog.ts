export class SuccessTestModifiersDialog extends Application {
    static RollButtonName: string = 'Roll';
    static EdgeButtonName: string = 'Edge';

    callback: Function;

    constructor(templateData, callback: Function, actor?) {
        renderTemplate(SuccessTestModifiersDialog.template, templateData).then();

        const data = {
            content,
            buttons: SuccessTestModifiersDialog._getButtons(actor),
            default: SuccessTestModifiersDialog.RollButtonName,
            close: SuccessTestModifiersDialog.closeCallback
        };
        const options = {};

        super(data);

        this.callback = callback;
    }

    static get template(): string {
        return 'systems/shadowrun5e/dist/templates/rolls/roll-dialog.html';
    }

    static _getButtons(actor): Record<string, DialogButton> {
        const buttons = {};

        buttons[SuccessTestModifiersDialog.RollButtonName] = {
            label: game.i18n.localize('SR5.Roll'),
            icon: '<i class="fas fa-dice-six"></i>',
            name: SuccessTestModifiersDialog.RollButtonName
        };

        if (actor) {
            buttons[SuccessTestModifiersDialog.EdgeButtonName] = {
                label: `${game.i18n.localize('SR5.PushTheLimit')} (+${actor.getEdge().value})`,
                icon: '<i class="fas fa-bomb"></i>',
                name: SuccessTestModifiersDialog.EdgeButtonName
            }
        }

        return buttons;
    }

    submit(button) {
        console.error('submit', button);
        // @ts-ignore
        super.submit(button);
    }

    // TODO: Application.close will provide rendered dialog html
    static async closeCallback(html: JQuery) {

    }
}