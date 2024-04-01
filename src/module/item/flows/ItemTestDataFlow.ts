import { SR5Actor } from "../../actor/SR5Actor";
import { SR5 } from "../../config";

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
    injectOwnerPANMatrixAttributes: (actor: SR5Actor, testData: Shadowrun.ShadowrunItemDataData) => {
        if (!testData.attributes) return;

        const PANMatrixAttributes = ['data_processing', 'firewall'];
        ItemTestDataFlow._injectAttributes(PANMatrixAttributes, actor.system.attributes, testData, { bigger: true });
    },

    /**
     * Inject a PAN controller and it's owners attributes into an items test data.
     * 
     * This case implements SR5#233 'PANS and WANS', the PAN section.
     * 
     * @param controller A possible PAN controller
     * @param testData 
     */
    injectPANAttributes: (controller: Shadowrun.ShadowrunTechnologyItemData, owner: SR5Actor | undefined, testData: Shadowrun.ShadowrunItemDataData) => {
        const attributes = controller.system.attributes;

        const injectAttributes = ['data_processing', 'firewall', 'rating'];
        ItemTestDataFlow._injectAttributes(injectAttributes, attributes, testData, { bigger: true });

        if (owner) { 
            ItemTestDataFlow.injectOwnerPANMatrixAttributes(owner, testData);
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