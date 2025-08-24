import { ActionRollType } from "@/module/types/item/Action";
import { SR5Actor } from "../../actor/SR5Actor";
import { SR5Item } from "../SR5Item";
import { RollDataOptions } from "../Types";
import { AttributeRules } from '@/module/rules/AttributeRules';

type ActionCategoryRollDataCallback = (item: SR5Item, rollData: any, action?: ActionRollType, testData?: any) => undefined;

/**
 * Handle value retrieval for SR5Item test data values.
 */
export const ItemRollDataFlow = {
    /**
     * Transparently build a set of roll data based on this items type and network status.
     * 
     * This roll data can depend upon other actors and items.
     * 
     * NOTE: You group all rollData changes into one CASE to avoid confusion over multiple cases.
     * 
     * NOTE: Since getRollData is sync by default, we can't retrieve compendium documents here, resulting in fromUuidSync calls down
     *       the line.
     */
    getRollData(item: SR5Item, rollData: any, options: RollDataOptions) {
        const action = options?.againstData?.action ?? options?.testData?.action ?? options?.action;
        const testData = options?.againstData ?? options?.testData;
        if (!action) return rollData;

        // Change how roll data behaves based on the action categories used.
        const handlers: Record<string, ActionCategoryRollDataCallback> = {
            'matrix': ItemRollDataFlow.matrixTestRollDataFlow.bind(ItemRollDataFlow),
        };

        // Alter roll data for each action category used that provides different handling.
        for (const category of action.categories ?? []) {
            const callback = handlers[category];
            if (!callback) continue;
            callback(item, rollData, action, testData);
        }

        return rollData;
    },

    /**
     * Change a devices ratings by those of the PAN master and device owner.
     * 
     * This case implements SR5#233 'PANS and WANS', the PAN section.
     * 
     * @param master A PAN master device
     * @param rollData The test data to be altered
     * @param directConnection true, a direct connection has been made. false, a wire-less connection is used.
     */
    injectMasterAttributesForPAN: (master: SR5Item, actor: SR5Actor|undefined, rollData: SR5Item['system'], directConnection?: boolean) => {
        // As per SR5#233, slaved devices can't use the masters ratings.
        if (directConnection) return;

        const attributes = master.system.attributes!;

        const injectAttributes = ['data_processing', 'firewall', 'rating'];
        AttributeRules.injectAttributes(injectAttributes, attributes, rollData, { bigger: true });
        if (actor) AttributeRules.injectMentalAttributes(actor, rollData);
    },

    /**
     * Apply changes to roll data for matrix actions.
     * 
     * TODO: Provide the rule basis for this... move it to a Rule file?
     * 
     * @param item The source item to use for roll data.
     * @param rollData The roll data of that source item.
     * @param testData The current tests data.
     * @param againstData The original tests data, when testData is an OpposedTest.
     * @returns 
     */
    matrixTestRollDataFlow(item: SR5Item, rollData: any, action?: ActionRollType, testData?: any) {
        const actor = item.actorOwner;

        // CASE - Matrix Device is slaved inside a PAN or WAN
        // => Weapon slaved to owned commlink
        // => Camera slaved to host
        if (item.isMatrixDevice && item.isSlave) {
            // don't inject master device data for resist tests
            if (testData?.action?.test === 'MatrixResistTest') return;
            const master = item.master;
            if (!master) {
                ui.notifications?.error("SR5.Errors.MasterDeviceIsMissing", {localize: true});
                return rollData;
            }
            
            const directConnection = testData?.directConnection ?? false;
            ItemRollDataFlow.injectMasterAttributesForPAN(master, actor, rollData, directConnection)
        }

        // CASE - General Matrix Device with owner
        // => Carried weapon
        // => Equipped persona icon
        else if (item.isMatrixDevice && actor) {
            AttributeRules.injectMentalAttributes(actor, rollData);
        }

    }
}
