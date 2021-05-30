declare const SR5CONFIG: any;

declare namespace Shadowrun {
    export type PhysicalAttribute = 'body' | 'agility' | 'reaction' | 'strength';
    export type MentalAttribute = 'logic' | 'intuition' | 'charisma' | 'willpower';
    export type SpecialAttribute = 'edge' | 'essence' | 'magic' | 'resonance';
    export type MatrixAttribute = 'attack' | 'sleaze' | 'data_processing' | 'firewall';

    /**
     * Any valid attribute that an actor can have.
     */
    export type ActorAttribute = PhysicalAttribute | MentalAttribute | SpecialAttribute | MatrixAttribute | '';

    export type DamageType = 'physical' | 'stun' | 'matrix' | '';

    export type DamageElement = 'fire' | 'cold' | 'acid' | 'electricity' | 'radiation' | '';

    export type OpposedType = 'defense' | 'soak' | 'armor' | 'custom' | '';

    export type NumberOrEmpty = number | '';

    export type SkillName = string;

    export type NameField = {
        name: SkillName;
    };

    export type CanHideFiled = {
        hidden: boolean;
    };

    /**
     * A pair of fields for types that have a base and current value.
     */
    export type BaseValuePair<TType> = {
        base: TType;
        value: TType;
    };
    /**
     * A pair of fields for types that have a current and max value.
     */
    export type ValueMaxPair<TType> = {
        value: TType;
        max: TType;
    };

    /**
     * A list of mods to apply to a value.
     */
    export type ModList<TType> = Array<ModListEntry<TType>>;

    export type ModListEntry<TType> = { name: string; value: TType };
    /**
     * A value that is modifiable, having a base and current value, along with associated mod list.
     */
    export type ModifiableValue = BaseValuePair<number> & {
        mod: ModList<number>;
    };
    /**
     * A modifiable value that also scales with an attribute.
     */
    export type ModifiableValueLinked = ModifiableValue & {
        attribute: ActorAttribute;
    };

    export type RemovableField = {
        _delete?: boolean;
    };

    export type LabelField = {
        label: string;
    };

    export type ManualModField = {
        temp: number;
    };

    export type HasBonus = {
        bonus: KeyValuePair[];
    };

    type KeyValuePair = {
        key: string;
        value: number;
    };

    export type DisableField = {
        disabled: boolean;
    };

    export type ModifierField = {
        modifier: number;
    };
}
