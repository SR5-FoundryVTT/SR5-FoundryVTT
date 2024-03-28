import { SR5Actor } from "../actor/SR5Actor";
import { SR5Item } from "../item/SR5Item";
import { SuccessTest } from "./SuccessTest";
import { MarkPlacementFlow, MatrixPlacementData } from "./flows/MarkPlacementFlow";


/**
 * Brute force tests implement the Brute Force action on SR5#238
 */
export class BruteForceTest extends SuccessTest<MatrixPlacementData> {
    override actor: SR5Actor;
    icon: SR5Actor|SR5Item;

    override _prepareData(data: MatrixPlacementData, options): any {
        data = super._prepareData(data, options);
        return MarkPlacementFlow._prepareData(data, options);
    }

    /**
     * Brute Force is a matrix action.
     */
    override get testCategories(): Shadowrun.ActionCategories[] {
        return ['matrix', 'brute_force'];
    }

    /**
     * Set a target for this test.
     * 
     * @param uuid The uuid to target for. This can point to an actor or item.
     */
    setTarget(uuid: string) {
        this.data.iconUuid = uuid;
    }

    /**
     * Any matrix action gets the noise modifier.
     */
    override get testModifiers(): Shadowrun.ModifierTypes[] {
        const modifiers = super.testModifiers;
        modifiers.push('noise');
        return modifiers;
    }

    override get _dialogTemplate(): string {
        return 'systems/shadowrun5e/dist/templates/apps/dialogs/brute-force-test-dialog.html';
    }

    /**
     * When placing a mark the actual target might not be a token or actor. Instead of the default targeting 
     * use a specific way for matrix targets.
     * 
     * @returns 
     */
    override async populateDocuments() {
        await super.populateDocuments();

        if (this.data.iconUuid) {
            const icon = await fromUuid(this.data.iconUuid);
            if (!(icon instanceof SR5Actor) && !(icon instanceof SR5Item)) {
                console.error('Shadowrun 5e | Invalid target for mark placement', icon);
                return;
            }

            this.icon = icon;
        }
    }

    /**
     * Base on test dialog selection, different modifiers apply.
     */
    override prepareTestModifiers() {
        super.prepareTestModifiers();

        MarkPlacementFlow.prepareTestModifiers(this);
    }

    override validateBaseValues() {
        super.validateBaseValues();

        MarkPlacementFlow.validateBaseValues(this);
    }
}
