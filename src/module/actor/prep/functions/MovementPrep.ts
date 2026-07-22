import { ModifiableValue } from "@/module/mods/ModifiableValue";
import { ModifiableValueType } from "@/module/types/template/Base";

export class MovementPrep {
    static prepareMovement(system: Actor.SystemOfType<'character' | 'spirit'>) {
        const { attributes, modifiers } = system;

        const movement = system.movement;

        // Derived anchors are logged as BASE_PRIORITY change entries instead of the `base` field, then
        // folded from 0. Preparation recomputes them every cycle, so they stay stable without `base`.
        const resolve = <F extends ModifiableValueType>(field: F, base: number) => {
            const mod = new ModifiableValue(field);
            mod.addUniqueBase('SR5.BaseValue', base);
            return mod.applyChanges({ from: 0, min: 0 });
        };

        // default movement: WALK = AGI * 2, RUN = AGI * 4
        resolve(movement.walk, attributes.agility.value * (2 + modifiers.walk));
        resolve(movement.run, attributes.agility.value * (4 + modifiers.run));
    }
}
