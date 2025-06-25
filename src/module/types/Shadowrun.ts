declare const SR5CONFIG: any;

declare namespace Shadowrun {
    export type PhysicalAttribute = 'body' | 'agility' | 'reaction' | 'strength';
    export type MentalAttribute = 'logic' | 'intuition' | 'charisma' | 'willpower';
    export type SpecialAttribute = 'edge' | 'essence' | 'magic' | 'resonance';
    export type MatrixAttribute = 'attack' | 'sleaze' | 'data_processing' | 'firewall';

    export type SpaceTypes = 'meatspace' | 'astral' | 'matrix';

    /**
     * Any valid attribute that an actor can have.
     */
    export type ActorAttribute = PhysicalAttribute | MentalAttribute | SpecialAttribute | MatrixAttribute | '';

    /**
     * A list of mods to apply to a value.
     */
    export type ModList<TType> = Array<ModListEntry<TType>>;

    // A modifier value with a name string in FoundryVTT label format (SR5.<>) used during ActorPrep to collect modifying values.
    export type ModListEntry<TType> = { name: string; value: TType };

    /**
     * ME :-)
     * A list of types from othe files 
     */

    export type SkillCategories = 'active'|'language'|'knowledge';

    export type RollEvent = PointerEvent & { shiftKey?: boolean; altKey?: boolean; ctrlKey?: boolean };

    export type ActorRollOptions = {
        event?: RollEvent
    };

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
