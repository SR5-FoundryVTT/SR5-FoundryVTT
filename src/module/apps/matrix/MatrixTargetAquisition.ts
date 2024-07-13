import { SR5Actor } from "../../actor/SR5Actor";
import { SR5Item } from "../../item/SR5Item";
import { BruteForceTest } from "../../tests/BruteForceTest";
import { TestCreator } from "../../tests/TestCreator";

/**
 * This application is used by users and gms to acquire targets for their matrix actions
 * from the point of view of a specific matrix user.
 */
// An atomic data point for a single matrix item
interface MatrixItemSheetData {
    item: SR5Item
    marks: number
}
// An atomic data point for a single matrix target, containing all matrix items within, used for display.
interface MatrixTargetSheetData {
    actor: SR5Actor
    marks: number
    matrixItems: MatrixItemSheetData[]
    // Indicates if the target is running silent.
    runningSilent: boolean
}

// Overall Sheet Data for this application.
interface MatrixTargetAcquisitionSheetData {
    targets: MatrixTargetSheetData[]
}


/**
 * This application collects matrix items from tokens and actors visible to the matrix user based on shadowrun rules.
 */
export class MatrixTargetAcquisitionApplication extends Application {
    // The matrix user to be used for target acquisition.
    public actor: SR5Actor;

    constructor(actor: SR5Actor) {
        super();

        this.actor = actor;
    }

    override get template() {
        return 'systems/shadowrun5e/dist/templates/apps/matrix/matrix-target-acquisition.hbs';
    }

    static override get defaultOptions() {
        const options = super.defaultOptions;

        options.classes = ['sr5']
        options.id = 'matrix-target-acquisition';
        options.title = game.i18n.localize('SR5.MatrixTargetAcquisitionApplication.Title');

        options.height = 'auto';
        options.resizable = true;

        return options;
    }

    override async getData(options?: Partial<ApplicationOptions> | undefined): Promise<MatrixTargetAcquisitionSheetData> {
        const data = await super.getData(options) as MatrixTargetAcquisitionSheetData;

        data.targets = this.prepareMatrixTargets();

        return data;
    }

    /**
     * Collect all possible matrix targets visible to the matrix user.
     */
    prepareMatrixTargets() {
        const targets: MatrixTargetSheetData[] = [];

        if (!canvas.scene?.tokens) return targets;

        for (const token of canvas.scene?.tokens) {
            // Throw away unneeded tokens.
            if (!token.actor) continue;
            if (token.actor?.id === this.actor.id) continue;
            if (!token.actor.isMatrixActor) continue;
            // TODO: Check for silent actors and for silent but found actors.

            // Collect matrix items from each token
            const matrixItems: MatrixItemSheetData[] = [];

            for (const item of token.actor.items) {
                if (!item.isMatrixItem) continue;
                const marks = this.actor.getMarksPlaced(item.uuid);

                matrixItems.push({
                    item, marks
                });
            }

            targets.push({
                actor: token.actor,
                marks: this.actor.getMarksPlaced(token.actor.uuid),
                matrixItems,
                runningSilent: false
            })
        }

        return targets;
    }

    override activateListeners(html: JQuery<HTMLElement>): void {
        super.activateListeners(html);

        html.find('.show-matrix-placement').on('click', this.handleMatrixPlacement.bind(this));
    }

    async handleMatrixPlacement(event) {
        event.preventDefault();
        event.stopPropagation();

        const element = event.currentTarget;
        const targetUuid = element.dataset.targetUuid;

        if (!targetUuid) return;

        const target = await fromUuid(targetUuid);
        if (!target) return;

        const test = await TestCreator.fromPackAction('matrix-actions', 'brute_force', this.actor);
        if (!test) return;
        //@ts-expect-error Typing issues with dynamic classes based on actions.
        test.data.targetUuid = targetUuid;
        // const test = new BruteForceTest({targetUuid}, {actor: this.actor});
        await test.execute();
    }
}