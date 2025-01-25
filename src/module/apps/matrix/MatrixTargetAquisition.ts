import { SR5Actor } from "../../actor/SR5Actor";
import { Helpers } from "../../helpers";
import { SR5Item } from "../../item/SR5Item";
import { BruteForceTest } from "../../tests/BruteForceTest";
import { HackOnTheFlyTest } from "../../tests/HackOnTheFlyTest";
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
    placementActions: string[]
    targets: MatrixTargetSheetData[]
    hosts: SR5Item[]
}

type MatrixPlacementTests = BruteForceTest | HackOnTheFlyTest;


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

    override activateListeners(html: JQuery<HTMLElement>): void {
        super.activateListeners(html);

        html.find('.show-matrix-placement').on('click', this.handleMarkPlacement.bind(this));
    }

    override async getData(options?: Partial<ApplicationOptions> | undefined): Promise<MatrixTargetAcquisitionSheetData> {
        const data = await super.getData(options) as MatrixTargetAcquisitionSheetData;

        data.placementActions = ['brute_force', 'hack_on_the_fly'];
        data.targets = this.prepareMatrixTargets();
        data.hosts = this.prepareMatrixHosts();

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
            const target = token.actor;
            // Skip the deckers token.
            if (target?.id === this.actor.id) continue;
            // Skip based on FoundryVTT details.
            if (game.user?.isGM && token.hidden) continue;
            // Skip actors based on their persona and visibility.
            if (!target.hasPersona) continue;
            if (!this.actor.matrixPersonaIsVisible(target)) continue;

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

    /**
     * Collect all hosts for selection, based on current network.
     */
    prepareMatrixHosts() {
        return game.items?.filter(item => item.isHost) ?? [];
    }


    /**
     * Trigger Mark Placement for selected target document.
     * 
     * @param event A event triggered from within a Handble ListItem
     */
    async handleMarkPlacement(event) {
        event.preventDefault();
        event.stopPropagation();

        const targetUuid = Helpers.listItemId(event);
        if (!targetUuid) return;

        const target = await fromUuid(targetUuid) as Shadowrun.NetworkDevice;
        if (!target) {
            console.error('Shadowrun 5e | Could not find target with uuid', targetUuid);
            return;
        }

        // Get default mark placement action.
        const character = this.actor.asCharacter();
        if (!character) return;
        const markPlacementAction = character.system.matrix.markPlacementAction;
        if (!markPlacementAction) return;

        // Get test for that action.
        const test = await TestCreator.fromPackAction('matrix-actions', markPlacementAction, this.actor) as MatrixPlacementTests;
        if (!test) return;

        this.close();

        // Prepare test for placing a mark on the target.
        // test.data.iconUuid = targetUuid;
        test.addTarget(target);
        await test.execute();
    }
}