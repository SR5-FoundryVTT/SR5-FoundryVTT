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

    /**
     * Types of actions that can be taken during the combat action phase.
     */
    export type ActionType = 'free'|'simple'|'complex';

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

    // A modifier value with a name string in FoundryVTT label format (SR5.<>) used during ActorPrep to collect modifying values.
    export type ModListEntry<TType> = { name: string; value: TType };

    /**
     * A simple modifiable numerical value.
     */
    export type ValueField =
        BaseValuePair<number> &
        ModifiableValue &
        LabelField &
        ManualModField;

    /**
     * A modifiable value of any type.
     */
    export type GenericValueField =
        BaseValuePair<any> &
        ModifiableValue &
        LabelField &
        ManualModField

    /**
     * A value that is modifiable, having a base and current value, along with associated mod list.
     */
    export type ModifiableValue = BaseValuePair<number> & {
        mod: ModList<number>
        override?: ModListEntry<number>
        temp?: number
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

    export type IDField = string;
    /*
     * Meant for storing a connected actor while only storing it's id and source.
     */
    export type SourceEntityField = {
        id: IDField
        name: string
        pack: string|null
        type: 'Actor'|'Item'
        // Custom data. Whatever you want.
        data?: Record<string, any>
    };
}
