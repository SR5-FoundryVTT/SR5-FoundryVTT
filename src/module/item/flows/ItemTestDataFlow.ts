import { SR5Actor } from "../../actor/SR5Actor";
import { SR5 } from "../../config";
import { BruteForceTest } from "../../tests/BruteForceTest";
import { HackOnTheFlyTest } from "../../tests/HackOnTheFlyTest";

/**
 * Handle value retrieval for SR5Item test data values.
 * 
 */
export const ItemTestDataFlow = {
    /**
     * Inject an actors mental attributes into an items test data.
     * 
     * This case implements SR5#237 'Matrix Actions' devices owned by characters.
     * The special case 'a device is completely unattended' is ignored.
     * 
     * @param actor Whatever actor to use for mental attributes
     * @param testData TestData that will get modified in place
     */
    injectOwnerMentalAttributes: (actor: SR5Actor, testData: Shadowrun.ShadowrunItemDataData) => {
        if (!testData.attributes) return;

        for (const name of SR5.mentalAttributes) {
            testData.attributes[name] = foundry.utils.duplicate(actor.getAttribute(name));
        }
    },


    /**
     * Inject actors matrix attributes into an items test data.
     * 
     * While the actual controller would be the one to provide matrix attributes, the system uses the device
     * item as value carrier while the actual matrix attributes are derived from the item onto the actor owner.
     * 
     * @param actor The carrier of the controller item
     * @param testData TestData that will get modified in place
     */
    injectOwnerRatingsForPAN: (actor: SR5Actor, testData: Shadowrun.ShadowrunItemDataData) => {
        if (!testData.attributes) return;

        const PANMatrixAttributes = ['data_processing', 'firewall'];
        ItemTestDataFlow._injectAttributes(PANMatrixAttributes, actor.system.attributes, testData, { bigger: true });
    },

    /**
     * Change a devices ratings by those of the PAN master and device owner.
     * 
     * This case implements SR5#233 'PANS and WANS', the PAN section.
     * 
     * @param master A PAN master device
     * @param testData The test data to be altered
     * @param directConnection true, a direct connection has been made. false, a wire-less connection is used.
     */
    injectMasterAndOwnerRatingsForPAN: (master: Shadowrun.ShadowrunTechnologyItemData, owner: SR5Actor | undefined, testData: Shadowrun.ShadowrunItemDataData, directConnection?: Boolean) => {
        // As per SR5#233, slaved devices can't use the masters ratings.
        if (directConnection) return;

        const attributes = master.system.attributes;

        const injectAttributes = ['data_processing', 'firewall', 'rating'];
        ItemTestDataFlow._injectAttributes(injectAttributes, attributes, testData, { bigger: true });

        if (owner) { 
            ItemTestDataFlow.injectOwnerRatingsForPAN(owner, testData);
        }
    },

    /**
     * Inject all attributes into testData that match the given attribute names list.
     * 
     * Also implements the 'use bigger value rule',if necessary.
     * 
     * @param names A list of attribute names to inject
     * @param attributes The list of source attribute to pull from
     * @param testData The testData to inject attributes into
     * @param options.bigger If true, the bigger value will be used, if false the source value will always be used.
     */
    _injectAttributes(names: string[], attributes: Shadowrun.AttributesData, testData: Shadowrun.ShadowrunItemDataData, options: { bigger: boolean }) {
        const targetAttributes = testData.attributes as Shadowrun.AttributesData;
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