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
        // See config.actionDamageFormulaOperators for operator mapping.
        base_formula_operator: FormulaOperator;
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

    // ME :)
    
    /**
     * A list of pack names defined within the system.
     *
     * Mainly here to prohibit using missing packs in code.
     */
    export type PackName = 'Matrix Actions'|'General Actions';
    /**
     * A list of action names defined in any system pack.
     *
     * Mainly here to prohibit using missing actions in code.
     */
    export type PackActionName =
        'physical_damage_resist'
        | 'drain'
        | 'natural_recovery_stun'
        | 'natural_recovery_physical'
        | 'armor'
        | 'fade'
        | 'composure'
        | 'judge_intentions'
        | 'lift_carry'
        | 'memory'
        | 'physical_defense'
        | 'drone_pilot_vehicle'
        | 'drone_perception'
        | 'drone_infiltration';

    
    /**
     * Copy of FoundryVTT RollMode for messages and rolls.
     */
    type FoundryRollMode = 'publicroll' | 'gmroll' | 'blindroll' | 'selfroll'
    /**
     * The actual usable values for an action.
     */
    type ActionRollMode = FoundryRollMode | ''

    /**
     * What kind of action is being performed.
     * 
     * This can be used to group different actions together for different purposes.
     * It can also be used for ActiveEffects to target a group of tests, if skill or test implementations used
     * are to specific.
     */
    type ActionCategories = 
        '' | // Empty values are allowed to allow users not having to set an action category.
        'addiction_mental' | // resisting against mental addiction
        'addiction_physical' | // resisting against physical addiction
        'addiction' | // resisting against addiction in general
        'attack_melee' | // attacks made with melee weapons
        'attack_ranged' | // attacks made with ranged weapons
        'attack_thrown' | // attacks made with thrown weapons
        'attack' | // attacks in general, includes all other attack types
        'brute_force' | // matrix brute force action
        'climbing' | // using climbing skills
        'compiling' | // technomancer compiling sprites action
        'complex_form' | // technomancer threading complex form action
        'defense_suppression' | // defending against suppression attacks
        'defense' | // defending in general, includes all other defense types
        'drain' | // resisting against drain
        'fade' | // resisting against fade
        'hack_on_the_fly' | // matrix hack on the fly action
        'magic' | // all magic actions in general
        'matrix' | // all  matrix actions in general
        'recovery_physical' | // natural recovery of physical damage
        'recovery_stun' | // natural recovery of stun damage
        'recovery' | // natural recovery in general, includes all other recovery types
        'resist' | // resisting damage after getting hit
        'resist_disease' | // resisting against diseases
        'resist_toxin' | // resisting against toxins
        'resonance' | // all resonance actions in general
        'rigging' | // all rigging actions in general
        'social' | // all social skill actions
        'spell_combat' |  // all combat spells
        'spell_detection' | // all detection spells
        'spell_healing' | // all healing spells
        'spell_illusion' | // all illusion spells
        'spell_manipulation' | // all manipulation spells
        'spell_ritual' |  // all ritual spells
        'summoning' // magical summoning of spirits
}
