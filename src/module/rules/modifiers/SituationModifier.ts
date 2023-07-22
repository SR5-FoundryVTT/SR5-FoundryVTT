import { SuccessTest } from './../../tests/SuccessTest';
import { SR5Actor } from './../../actor/SR5Actor';
import { DocumentSituationModifiers, ModifiableDocumentTypes } from '../DocumentSituationModifiers';
import Modifier = Shadowrun.ModifierData;
import SourceModifierData = Shadowrun.SourceModifierData;
import ActiveModifierValue = Shadowrun.ActiveModifierValue;
import { SituationModifierEffectsFlow } from './flows/SituationModifierEffectsFlow';


export interface SituationalModifierApplyOptions {
    // When set to true, applied will be regenerated always.
    reapply?: boolean
    // When new source data is given, internal source is overwritten.
    source?: SourceModifierData
    // When given will be used to ONLY use applied active selections of a modifier.
    // keys should be included as applied.active.<applicable>
    // <applicable> would be <light> or <wind> based on modifier 'environmental.light'/'.wind'.
    applicable?: string[]
    // Apply modifier within this tests context.
    test?: SuccessTest
}

/**
 * Base class for handling a single modifier type that's applied to a document.
 * 
 * Each situational modifier allows for generic handling of it's active selections, totals and manual
 * override values, while also allowing to apply custom rules to each.
 * 
 * A modifier category would be: environmental, matrix, magic/astral, social, ...
 * 
 * Each modifier works on the document level, which might have local source modifier data containing
 * selections for a scene, a position, an actor or else.
 * 
 * A user/GM can select specific modifier values (so called active modifiers) via GUI.
 * 
 * This allows users to have active selections for their character, while the GM has active selections 
 * for a more global document (scene, token position, ...). All active selections will be merged
 * to an applied selection, which is used to calculate the total modifier value. The more specific
 * a document is, the higher it's priority in the merge order.
 * 
 * Each SituationModifier only handles its own type, while the DocumentSituationModifiers handles
 * all types for a document.
 */
export class SituationModifier {
    type: Shadowrun.SituationModifierType;
    // A reference to the modifiers this handler is used within.
    modifiers?: DocumentSituationModifiers
    // The original source modifier data. This shouldn't be altered.
    source: SourceModifierData
    // The applied modifier data, originating from the original source data.
    applied: Modifier

    globalActivesApplied: boolean;

    // The effects flow for this modifier.
    effects: SituationModifierEffectsFlow<this>;

    /**
     * 
     * @param data The low level modifier data for this handler to work on.
     * @param modifiers Modifiers instances this handler is used in.
     */
    constructor(data?: Partial<SourceModifierData>, modifiers?: DocumentSituationModifiers) {
        this.source = this._prepareSourceData(data);
        this.modifiers = modifiers;

        this.effects = new SituationModifierEffectsFlow<typeof this>(this);
    }

    /**
     * Prepare valid source modifier data.
     * 
     * @param data A documents source modifier data
     * @returns Either a documents source modifier data or a valid fallback.
     */
    _prepareSourceData(data: Partial<SourceModifierData>={}): SourceModifierData {
        // Avoid incomplete source data from documents.
        return {...{active: {}}, ...data};
    }

    /** 
     * Determine if any documents have been added to this instance.
     */
    get hasDocuments(): boolean {
        return this.modifiers !== undefined;
    }

    /**
     * Determine if the source document used is an actor.
     */
    get sourceDocumentIsActor(): boolean {
        return this.modifiers !== undefined && this.modifiers.documentIsActor;
    }

    /**
     * Determine if the source document used is a scene.
     */
    get sourceDocumentIsScene(): boolean {
        return this.modifiers !== undefined && this.modifiers.documentIsScene;
    }    

    /**
     * Return the source active values for use during selection.
     */
    get active(): ActiveModifierValue {
        return this.source.active;
    }

    /**
     * Allow a situational modifier to NOT need any source data to apply it's modifiers.
     * 
     * This can be used to implement a modifier that IS situational but doesn't need data structures for selection.
     * 
     * @returns false, when a handler doesn't use any document source data.
     */
    static get hasSourceData(): boolean {
        return true;
    }

    /**
     * Determine if the source data has an active modifier set for this situational modifier.
     */
    get hasActive(): boolean {
        //@ts-ignore TODO: foundry-vtt-types v10
        return !foundry.utils.isEmpty(this.source.active);
    }

    /**
     * Determine if a fixed value has been set.
     */
    get hasFixed(): boolean {
        return this.applied.hasOwnProperty('fixed');
    }

    /**
     * Determine if a fixed user selection has been made.
     */
    get hasFixedSelection(): boolean {
        return this.applied.active.hasOwnProperty('value');
    }

    /**
     * Determine if any user selection has been made.
     */
    get hasSelection(): boolean {
        return this.hasActive || this.hasFixed;
    }

    /**
     * Does the applied selection match?
     * 
     * Use applied as source might not match, but applied might.
     * 
     * In that case a matching applied might need to be altered in source.
     * 
     * @param modifier The selection / active identifier
     * @param level The modifier level
     */
    isMatching(modifier: string, level: number): boolean {
        return this.applied.active[modifier] === level;
    }

    /**
     * Set a active selection to a modifier level.
     * 
     * @param modifier The selection / active identifier.
     * @param level The modifier level
     */
    setActive(modifier: string, level: number) {
        this.source.active[modifier] = level;
        this._updateDocumentSourceModifiers();
    }

    /**
     * Set a active selection as inactive.
     *
     * @param modifier The selection / active identivier.
     */
    setInactive(modifier: string) {
        delete this.source.active[modifier];
        this._updateDocumentSourceModifiers();
    }

    /**
     * Determine if the given modifier is active
     * @param modifier The possibly active modifier to check
     */
    isActive(modifier: string) {
        return this.source.active.hasOwnProperty(modifier);
    }

    /**
     * When using a selection this method will toggle an active modifier on and off.
     * 
     * @param modifier The active modifier name
     * @param value The value the modifier uses currently.
     */
    toggleSelection(modifier: string, value: number) {
        if (this.isMatching(modifier, value)) {
            this.setInactive(modifier)
        } else {
            this.setActive(modifier, value);
        }
    }

    /**
     * Using the local documents source modifier data apply all higher-level situational modifiers
     * on top and apply to the actual modifiers.
     * 
     * @params options An optional set of options.
     * @params options.reapply When set to true, should cause a full re application.
     */
    apply(options: SituationalModifierApplyOptions={}) {
        // Initial application or reapplication
        if (!this.applied || options.reapply || options.source) {
            // Clear current application.
            this.applied = {
                active: {},
                total: 0
            }
        }   

        // Update source when given.
        this.source = options.source ?? this.source;

        // To filter active selections.
        const applicable = options.applicable ?? null;

        // Collected source to applied in order.
        const sources: SourceModifierData[] = [];

        // CASE 1 - Actor document class - apply all top level documents first.
        // Note, instance against configured class to be change resistant.
        if (Object.getPrototypeOf(this).constructor.hasSourceData && this.modifiers && this.sourceDocumentIsActor) {
            // Using a document source, a category is necessary to extract the right source modifiers.
            if (!this.type) return console.error(`Shadowrun 5e | ${this.constructor.name} can't interact with documents without a modifier category set.`)

            const actor = this.modifiers.document as SR5Actor;
            this._addSceneSourceDataFromActor(actor, sources);
        }

        // Add local source (last) into order.
        sources.push(this.source);

        // Apply each source in order.
        sources.forEach(source => foundry.utils.mergeObject(this.applied, source));

        // Remove not applicable active selections.
        if (applicable && applicable.length > 0) {
            Object.keys(this.applied.active).forEach((selection) => {
                if (!applicable.includes(selection)) delete this.applied.active[selection];
            });
        }
        
        // Apply effect changes for this modifier type.
        this.effects.apply();

        // If a fixed value selection has been made, use that.
        if (!this.hasFixed && this.hasFixedSelection) this.applied.fixed = this.applied.active.value;

        // After merging active and fixed value, derive total.
        if (this.hasFixed) this.applied.total = this.applied.fixed as number;
        else this.applied.total = this._calcActiveTotal(options);

        console.debug(`Shadowrun 5e | Totalled situational modifiers for ${this.modifiers?.document?.name} to be: ${this.applied.total}`, this.applied);
    }

    /**
     * Add scene modifier sources into the applicable sources, when an actor is present on scene
     * 
     * @param actor The actor to check for tokens
     * @param sources The sources list, as used within #apply
     */
    _addSceneSourceDataFromActor(actor: SR5Actor, sources: SourceModifierData[]) {
        const scene = actor.getToken()?.parent;

        if (!scene) return;
        const sceneSource = this._getDocumentsSourceData(scene);
        if (!sceneSource) return;

        // Add parent scene (top most) into order.
        sources.push(sceneSource);
    }

    _getDocumentsSourceData(document: ModifiableDocumentTypes): SourceModifierData|undefined {
        // To access another objects
        if (!this.type) return;
        // A placed token must apply it's scene modifiers first.
        const modifiers = DocumentSituationModifiers.getDocumentModifiers(document);
        // Select the modifier category only.
        return modifiers.source[this.type];
    }

    /**
     * Determine the total value of all active modifier values.
     * 
     * Override this method if you want to apply different rules depending on the situational modifier category.
     * 
     * By default the active modifiers will simply be sumed up.
     * 
     * @param options.test The SuccessTest implementation used to access this modifier. Use if the modifier changes based on test configuration.
     * 
     * @returns The total modifier value to be used for this situational modifier category.
     */
    _calcActiveTotal(options: SituationalModifierApplyOptions={}): number {
        return Object.values(this.applied.active).reduce((sum, current) => sum + current, 0) || 0;
    }

    /**
     * Give the total modifier value for this category.
     *  
     * Should this modifier not yet been applied, this will apply it.
     * 
     * NOTE: Always use this field to access resulting modifier values as some modifiers might have a total level applied vs a total modifer given.
     */
    get total(): number {
        if (!this.applied) {
            this.apply();
        }
        return this.applied.total;
    }

    /**
     * Clear the source modifier data to a default state.
     */
    clear() {
        this.source = this._prepareSourceData();
        // With source default, reapply all values
        this.apply({reapply: true});

        this._updateDocumentModifiers();
    }

    _updateDocumentSourceModifiers() {
        if (!this.type || !this.modifiers) return;
        this.modifiers.source[this.type] = this.source;
    }
    
    _updateDocumentAppliedModifiers() {
        if (!this.type || !this.modifiers) return;
        this.modifiers.applied[this.type] = this.applied;
    }

    _updateDocumentModifiers() {
        this._updateDocumentSourceModifiers();
        this._updateDocumentAppliedModifiers();
    }
}