import { SR5Actor } from "../../actor/SR5Actor";
import { SR5 } from "../../config";
import { SR5Item } from "../SR5Item";
import { RollDataOptions } from "../Types";

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
        const againstData = options.againstData ?? null;
        const actor = item.actorOwner;

        // CASE - Matrix Device is slaved inside a PAN or WAN
        // => Weapon slaved to owned commlink
        // => Camera slaved to host
        if (item.isMatrixDevice && item.isSlave) {
            const master = item.master;
            if (!master) {
                ui.notifications?.error("SR5.Errors.MasterDeviceIsMissing", {localize: true});
                return rollData;
            }
            
            const directConnection = againstData?.directConnection ?? false;;
            ItemRollDataFlow.injectMasterRatingsForPAN(master, actor, rollData, directConnection)
        }

        // CASE - General Matrix Device with owner
        // => Carried weapon
        // => Equipped persona icon
        else if (item.isMatrixDevice && actor) {
            ItemRollDataFlow.injectOwnerMentalAttributes(actor, rollData);
        }

        return rollData;
    },

    getRollDataForSlaveDevice(item: SR5Item, rollData: any, options: RollDataOptions) {

    },
    /**
     * Inject an actors mental attributes into an items test data.
     * 
     * This case implements SR5#237 'Matrix Actions' devices owned by characters.
     * The special case 'a device is completely unattended' is ignored.
     * 
     * @param actor Whatever actor to use for mental attributes
     * @param rollData TestData that will get modified in place
     */
    injectOwnerMentalAttributes: (actor: SR5Actor, rollData: Shadowrun.ShadowrunItemDataData) => {
        if (!rollData.attributes) return;

        for (const name of SR5.mentalAttributes) {
            rollData.attributes[name] = foundry.utils.duplicate(actor.getAttribute(name));
        }
    },


    /**
     * Inject actors matrix attributes into an items test data.
     * 
     * Rule wise the persona icon is providing this attributes, within the system those attributes are copied to the
     * actor and we can copy them from there.
     * 
     * @param actor The carrier of the persona icon
     * @param rollData TestData that will get modified in place
     */
    injectOwnerRatingsForPAN: (actor: SR5Actor, rollData: Shadowrun.ShadowrunItemDataData) => {
        if (!rollData.attributes) return;

        const PANMatrixAttributes = ['data_processing', 'firewall'];
        ItemRollDataFlow._injectAttributes(PANMatrixAttributes, actor.system.attributes, rollData, { bigger: true });
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
    injectMasterRatingsForPAN: (master: SR5Item, actor: SR5Actor|undefined, rollData: Shadowrun.ShadowrunItemDataData, directConnection?: boolean) => {
        // As per SR5#233, slaved devices can't use the masters ratings.
        if (directConnection) return;

        const attributes = master.system.attributes as Shadowrun.AttributesData;

        const injectAttributes = ['data_processing', 'firewall', 'rating'];
        ItemRollDataFlow._injectAttributes(injectAttributes, attributes, rollData, { bigger: true });
        if (actor) ItemRollDataFlow.injectOwnerMentalAttributes(actor, rollData);
    },

    /**
     * Inject all attributes into testData that match the given attribute names list.
     * 
     * Also implements the 'use bigger value rule',if necessary.
     * 
     * @param names A list of attribute names to inject
     * @param attributes The list of source attribute to pull from
     * @param rollData The testData to inject attributes into
     * @param options.bigger If true, the bigger value will be used, if false the source value will always be used.
     */
    _injectAttributes(names: string[], attributes: Shadowrun.AttributesData, rollData: Shadowrun.ShadowrunItemDataData, options: { bigger: boolean }) {
        const targetAttributes = rollData.attributes as Shadowrun.AttributesData;
        for (const name of names) {
            const sourceAttribute = foundry.utils.duplicate(attributes[name]);
            const targetAttribute = targetAttributes[name];

            if (options.bigger) {
                targetAttributes[name] = sourceAttribute.value > targetAttribute.value ? sourceAttribute : targetAttribute;
            } else {
                targetAttributes[name] = sourceAttribute;
            }
        }
    }
}