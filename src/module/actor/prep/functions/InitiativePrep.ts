import { SR5Actor } from '../../SR5Actor';
import { ModifiableValue } from '@/module/mods/ModifiableValue';
import { InitiativeType } from '@/module/types/template/Initiative';

const isKeyOf = <T extends object>(obj: T, key: PropertyKey): key is keyof T => key in obj;

export class InitiativePrep {

    private static getAttributeValue(
        system: SR5Actor['system'],
        attribute: InitiativeType['formula']['attribute_a']
    ): number {
        if (!attribute) return 0;

        if (attribute === 'rating' && 'host' in system)
            return system.host?.rating ?? 0;

        if ('attributes' in system && system.attributes && isKeyOf(system.attributes, attribute))
            return system.attributes[attribute].value;

        if ('vehicle_stats' in system && system.vehicle_stats && isKeyOf(system.vehicle_stats, attribute))
            return system.vehicle_stats[attribute].value;

        if (attribute !== 'rating' && 'matrix' in system && system.matrix && isKeyOf(system.matrix, attribute))
            return system.matrix[attribute].value;

        return 0;
    }

    private static prepareFormulaMode(system: SR5Actor['system'], mode: Shadowrun.SpaceTypes) {
        const modeInitiative = system.initiative[mode] as InitiativeType | undefined;
        if (!modeInitiative?.formula) return;

        const formula = modeInitiative.formula;
        const attributeA = this.getAttributeValue(system, formula.attribute_a);
        const attributeB = this.getAttributeValue(system, formula.attribute_b);

        modeInitiative.base.base = attributeA + attributeB + formula.constant;
        ModifiableValue.calcTotal(modeInitiative.base);

        modeInitiative.dice.base = formula.dice;
        ModifiableValue.calcTotal(modeInitiative.dice, { min: 0, max: 5 });
    }

    /**
     * Current initiative is the selected initiative to be used within FoundryVTT Combat.
     *
     */
    private static prepareCurrentInitiative(system: SR5Actor['system']) {
        const { initiative, attributes } = system;

        initiative.current = initiative[initiative.perception] as InitiativeType;

        // Recalculate selected initiative to be sure.
        ModifiableValue.calcTotal(initiative.current.base);

        // Disable blitz if edge is depleted.
        if (attributes.edge.uses >= attributes.edge.value)
            initiative.blitz = false;

        // Apply blitz ini rules.
        if (initiative.blitz)
            ModifiableValue.addUnique(initiative.current.dice, "SR5.Blitz", 5, CONST.ACTIVE_EFFECT_MODES.OVERRIDE, ModifiableValue.TOP_PRIORITY);
        ModifiableValue.calcTotal(initiative.current.dice, {min: 0, max: 5});

        initiative.current.dice.text = `${initiative.current.dice.value}d6`;        
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
