import { SR5Actor } from '../../SR5Actor';
import { ModifiableValue } from '@/module/mods/ModifiableValue';
import { InitiativeType } from '@/module/types/template/Initiative';

const isKeyOf = <T extends object>(obj: T, key: PropertyKey): key is keyof T => key in obj;

export class InitiativePrep {
    private static getAttributeValue(
        system: SR5Actor['system'],
        attribute: InitiativeType['attribute_a']
    ): number {
        if (!attribute) return 0;

        if (attribute === 'rating' && 'host' in system)
            return system.host?.rating ?? 0;

        if (attribute !== 'rating' && 'matrix' in system && system.matrix && isKeyOf(system.matrix, attribute))
            return system.matrix[attribute].value;

        if ('attributes' in system && system.attributes && isKeyOf(system.attributes, attribute))
            return system.attributes[attribute].value;

        if ('vehicle_stats' in system && system.vehicle_stats && isKeyOf(system.vehicle_stats, attribute))
            return system.vehicle_stats[attribute].value;

        return 0;
    }

    private static prepareFormulaMode(system: SR5Actor['system'], mode: Shadowrun.SpaceTypes) {
        const modeInit = system.initiative[mode] as InitiativeType | undefined;
        if (!modeInit) return;

        const constMod = new ModifiableValue(modeInit.constant);
        if (modeInit.attribute_a) {
            const attributeA = this.getAttributeValue(system, modeInit.attribute_a);
            constMod.addBase(`SR5.attributes.${modeInit.attribute_a}`, attributeA);
        }

        if (modeInit.attribute_b) {
            const attributeB = this.getAttributeValue(system, modeInit.attribute_b);
            constMod.addBase(`SR5.attributes.${modeInit.attribute_b}`, attributeB);
        }

        constMod.calcTotal();
        ModifiableValue.calcTotal(modeInit.dice, { min: 0, max: 5 });
    }

    /**
     * Current initiative is the selected initiative to be used within FoundryVTT Combat.
     *
     */
    private static prepareCurrentInitiative(system: SR5Actor['system']) {
        const { initiative, attributes } = system;

        initiative.current = initiative[initiative.perception] as InitiativeType;

        // Recalculate selected initiative to be sure.
        ModifiableValue.calcTotal(initiative.current.constant);

        // Disable blitz if edge is depleted.
        if (attributes.edge.uses >= attributes.edge.value)
            initiative.blitz = false;

        // Apply blitz ini rules.
        if (initiative.blitz) {
            ModifiableValue.addUnique(initiative.current.dice, "SR5.Blitz", 5,
                { mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE, priority: ModifiableValue.TOP_PRIORITY }
            );
        }
        ModifiableValue.calcTotal(initiative.current.dice, {min: 0, max: 5});

        (initiative.current.dice as any).text = `${initiative.current.dice.value}d6`;
    }

    /**
     * Prepares initiative for an actor.
     */
    static prepareInit<ST extends Actor.ConfiguredSubType>(actorType: ST, system: Actor.SystemOfType<ST>) {
        if ('meatspace' in system.initiative)
            this.prepareFormulaMode(system, 'meatspace');
        if ('astral' in system.initiative)
            this.prepareFormulaMode(system, 'astral');
        if ('matrix' in system.initiative && 'matrix' in system) {
            if (actorType === 'character' && system.matrix.hot_sim)
                ModifiableValue.addUniqueBase(system.initiative.matrix.dice, "SR5.HotSim", 1);

            this.prepareFormulaMode(system, 'matrix');
        }

        this.prepareCurrentInitiative(system);
    }
}
