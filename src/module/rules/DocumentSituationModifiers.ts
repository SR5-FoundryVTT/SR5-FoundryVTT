import { SuccessTest } from './../tests/SuccessTest';
import { RecoilModifier } from './modifiers/RecoilModifier';
import { BackgroundCountModifier } from './modifiers/BackgroundCountModifier';
import { NoiseModifier } from './modifiers/NoiseModifier';
import { SituationalModifierApplyOptions, } from './modifiers/SituationModifier';
import { EnvironmentalModifier } from './modifiers/EnvironmentalModifier';
import { SR5Actor } from "../actor/SR5Actor";
import {FLAGS, SYSTEM_NAME} from "../constants";
import SituationModifiersSourceData = Shadowrun.SituationModifiersSourceData;
import SituationModifiersData = Shadowrun.SituationModifiersData;
import { DefenseModifier } from './modifiers/DefenseModifier';


interface DocumentSituationModifiersTotalForOptions {
    // Set true to always re-apply selections.
    reapply?: boolean;
    // Only apply these modifier categories.
    applicable?: string[]
    // Modifiers are calculated within this tests context.
    test?: SuccessTest
}

/**
 * These documents can store situational modifiers
 */
export type ModifiableDocumentTypes = SR5Actor | Scene;

/**
 * Handle all per document situation modifiers.
 * 
 * Each situational modifier has a 'category' like 'environmental' or 'noise'.
 * Each category has a situation modifier handler to calculate it's total based on
 * user selection and rules for that category.
 * 
 * A selection is based on Shadowrun modifier tables and can either result in a summed total
 * or rule specific rules based on what is selected (environmental).
 * 
 * A category should be matched a top-level property to the documents source object.
 * 
 * A DocumentSituationModifiers instance doesn't do any handling of values but delegates to
 * the respective handler of each category.
 * 
 * Documents only store source data per document, while a document might have other
 * document source data applied first. The resulting applied data is what's actually used to
 * calculate a modifiers total.
 * 
 * This allows for modifiers to be defined globally (scene), while also locally (actor) and, in theory,
 * add more other other modifier sources in that chain of application to reach the actual modifier.
 * 
 * Usage Examples:
 * 
 * Get modifiers for the current scene:
 * > const modifiers = DocumentSituationModifiers.fromDocument(canvas.scene);
 * 
 * Get modifiers for a specific actor:
 * > const actor = game.actors.getName('John Doe');
 * > const modifiers = DocumentSituationModifiers.fromDocument(actor);
 * > // or
 * > // const modifiers = actor.getSituationModifiers();
 * > // NOTE: actor modifiers will take scene modifiers into account when it's a token actor.
 * 
 * Access modifier total value for any modifier category:
 * > const modifiers = DocumentSituationModifiers.fromDocument(canvas.scene);
 * > const total = modifiers.getTotalFor('noise');
 * > // or
 * > // modifiers.noise.apply();
 * > // const total = modifiers.noise.total;
 * 
 * Access any modifier total:
 * > const modifiers = DocumentSituationModifiers.fromDocument(canvas.scene);
 * > modifiers.applyAll();
 * > const total = modifiers.getTotalFor('background_count');
 * 
 * Change modifiers for a document:
 * > const modifiers = DocumentSituationModifiers.fromDocument(canvas.scene);
 * > modifiers.environmental.set('light', -3);
 * > await modifiers.updateDocument();
 */
export class DocumentSituationModifiers {
    // A reference to the original document holding modifier source data.
    document: ModifiableDocumentTypes | undefined;
    // The source data stored on the document.
    source: SituationModifiersSourceData;
    // The applied data from the document and it's apply chain.
    applied!: SituationModifiersData;
    // Handlers for the different modifier categories.
    _modifiers!: {
        noise: NoiseModifier,
        background_count: BackgroundCountModifier,
        environmental: EnvironmentalModifier,
        recoil: RecoilModifier,
        defense: DefenseModifier
    };

    /**
     * Prepare a Modifiers instance for a and allow handling of the resulting modifiers.
     * 
     * @param data situational modifiers taken from a Document.
     * @param document The source document used to retrieve data.
     */
    constructor(data?: SituationModifiersSourceData, document?: ModifiableDocumentTypes) {
        // Fail gracefully for no modifiers given.
        // This can happen as Foundry returns empty objects for no flags set.
        if (!data || foundry.utils.getType(data) !== 'Object') {
            data = DocumentSituationModifiers._defaultModifiers;
        }

        this.source = this. _completeSourceData(data);
        this.document = document;

        // Map all modifier types to their respectiv implementation.
        this._prepareModifiers();
    }

    /**
     * Prepare modifier handlers and their source data.
     */
    _prepareModifiers() {
        this._modifiers = {
            noise: new NoiseModifier(this.source.noise, this),
            background_count: new BackgroundCountModifier(this.source.background_count, this),
            environmental: new EnvironmentalModifier(this.source.environmental, this),
            recoil: new RecoilModifier({}, this),
            defense: new DefenseModifier({}, this)
        }
    }

    /**
     * Does this document have a handle a situation modifier category
     * 
     * @param category A category found within the handler registry
     * @returns true, when a total modifier can be calculated by a handler.
     */
    handlesTotalFor(category: string) {
        return this._modifiers.hasOwnProperty(category);
    }

    /**
     * Access helper for the noise modifier handler.
     */
    get noise(): NoiseModifier {
        return this._modifiers.noise;
    }

    /**
     * Access helper for the background modifier handler.
     */
    get background_count(): BackgroundCountModifier {
        return this._modifiers.background_count;
    }

    /**
     * Access helper for the environmental modifier handler.
     */
    get environmental(): EnvironmentalModifier {
        return this._modifiers.environmental;
    }

    /**
     * Access helper for the recoilModifier handler.
     */
    get recoil(): RecoilModifier {
        return this._modifiers.recoil;
    }

    /**
     * Access helper for the defense modifier handler
     */
    get defense(): DefenseModifier {
        return this._modifiers.defense;
    }

    /**
     * Complete a partial modifier data object, making sure all modifier category fields are set.
     * 
     * @param data An incomplete modifier data object.
     * @returns A completed modifier data object.
     */
    _completeSourceData(data: Partial<SituationModifiersSourceData>): SituationModifiersSourceData {
        // Duplicate data to avoid cross talk between different entities over different Modifier instances.
        data = foundry.utils.duplicate(data);

        for (const [category, modifiers] of Object.entries(DocumentSituationModifiers._defaultModifiers)) {
            if (!data.hasOwnProperty(category)) data[category] = modifiers;
        }

        return data as SituationModifiersSourceData;
    }

    /**
     * Return this total value for a modifiers category selection.
     * 
     * @param category A string matching a situation modifiers category.
     * @param options
     */
    getTotalFor(category: keyof SituationModifiersSourceData|string, options:DocumentSituationModifiersTotalForOptions={}): number {
        const modifier = this._modifiers[category];

        if (options.reapply || options.applicable) {
            modifier.apply({applicable: options.applicable, test: options.test})
        }

        return modifier.total;
    }

    /**
     * Re-apply all situational modifiers totals based on their active selections made.
     * 
     * This will turn the source data per modifier category over to their matching handler
     * and apply that categories total according to the rules for that category.
     * 
     * The result will be stored in the applied modifiers, where a total and the applied
     * selections can be found.
     * 
     * @params options What options to pass onto the SituationModifier.apply method.
     *                 The source property will be overriden.
     */
    applyAll(options: SituationalModifierApplyOptions={}) {
        //@ts-expect-error // Rebuild applied data fully for all modifiers.
        this.applied = {};

        // Let all handlers apply their modifier rules on the documents source data.
        Object.entries(this._modifiers).forEach(([category, handler]) => {
            // Some situational modifiers might choose not to apply any source data.
            if (Object.getPrototypeOf(handler).constructor.hasSourceData) {
                // Befor application, remove invalid selections. 
                // This happens when a selection has been set with an empty input DOM element.
                Object.entries(this.source[category].active).forEach(([modifier, value]) => {
                    switch (value) {
                        case null:
                        case undefined:
                            delete this.source[category].active[modifier];
                    }
                })
            }

            // Update category modifier source data and reapply.
            options.reapply = options.reapply ?? true;
            options.source = this.source[category];
            handler.apply(options);

            // Move the applied modifier data to the document space.
            this.applied[category] = handler.applied;
        });
    }

    /**
     * Clear a given document from all situation modifiers selection.
     * 
     * @param document The document to clear.
     * @returns A new instance with the resulting modifiers structure
     */
    static async clearAllOn(document: ModifiableDocumentTypes) {
        if (document instanceof SR5Actor) {
            // Overwrite all selections with default values.
            //@ts-expect-error Does fvtt support == operator?
            await document.update({ system: { '==situation_modifiers': DocumentSituationModifiers._defaultModifiers } });
        } else {
            await document.unsetFlag(SYSTEM_NAME, FLAGS.Modifier);
            await document.setFlag(SYSTEM_NAME, FLAGS.Modifier, DocumentSituationModifiers._defaultModifiers);
        }
    }

    /**
     * Clear a given modifiers categories selection from a document.
     * 
     * @param document The document to clear.
     * @param category Modifiers category to clear
     * @returns A new instance with the resulting modifiers structure
     */
    static async clearTypeOn(document: ModifiableDocumentTypes, category: keyof SituationModifiersSourceData): Promise<DocumentSituationModifiers> {
        const modifiers = DocumentSituationModifiers.getDocumentModifiers(document);

        if (!modifiers.source.hasOwnProperty(category)) return modifiers;
        modifiers.source[category] = DocumentSituationModifiers._defaultModifier;

        await DocumentSituationModifiers.setDocumentModifiers(document, modifiers.source);
        return modifiers;
    }

    /**
     * Prepare complete default modifier structure for a single modifier category.
     */
    static get _defaultModifier()  {
        return {
            active: {}
        }
    }

    /**
     * Prepare complete default modifier data structure for a single document.
     */
    static get _defaultModifiers(): SituationModifiersSourceData {
        return {
            environmental: DocumentSituationModifiers._defaultModifier,
            noise: DocumentSituationModifiers._defaultModifier,
            background_count: DocumentSituationModifiers._defaultModifier
        }
    }

    /**
     * Determine if the current document is a scene.
     */
    get documentIsScene(): boolean {
        return this.document instanceof CONFIG.Scene.documentClass
    }

    /**
     * Determine if the current document is an actor.
     */
    get documentIsActor(): boolean {
        return this.document instanceof CONFIG.Actor.documentClass;
    }

    /**
     * Retrieve the situational modifiers data.
     * 
     * @param document Any document with flags support.
     * @returns The raw modifier data of a document
     */
    static getDocumentModifiersData(document: ModifiableDocumentTypes): SituationModifiersSourceData {
        if (document instanceof SR5Actor) {
            return document.system.situation_modifiers;
        } else {
            return document.getFlag(SYSTEM_NAME, FLAGS.Modifier) as SituationModifiersSourceData;
        }
    }

    /**
     * For a modifiable document return all situational modifiers.
     * 
     * @param document The document containing modifiers or implementing a custom modifier retrieval system.
     */
    static fromDocument(document: ModifiableDocumentTypes): DocumentSituationModifiers {
        // Actor targets might have no personal modifiers, but still see the scene modifiers then, and use those
        // as a template for their local modifiers.
        if (document instanceof SR5Actor) {
            return document.getSituationModifiers();
        }
        // All other types are handled without special cases.
        return DocumentSituationModifiers.getDocumentModifiers(document);
    }

    /**
     * Build a full set of situational modifiers for a document.
     * 
     * @param document Any document that may contain situational modifiers.
     * @returns A full set of situational modifiers.
     */
    static getDocumentModifiers(document: ModifiableDocumentTypes): DocumentSituationModifiers {
        const data = DocumentSituationModifiers.getDocumentModifiersData(document);
        return new DocumentSituationModifiers(data, document);
    }

    /**
     * Set the situation modifiers data on the given document.
     * 
     * @param document Any document with flags support.
     * @param modifiers Source data of all situation modifiers for this document.
     */
    static async setDocumentModifiers(document: ModifiableDocumentTypes, modifiers: SituationModifiersSourceData) {
        if (document instanceof SR5Actor) {
            // Disable diffing to overwrite the whole object.
            // @ts-expect-error fvtt doesn't support == operator
            await document.update({ system: { "==situation_modifiers": modifiers } }, { diff: false });
        } else {
            // Due to active selection merging by Foundry mergeObject, we need to delete first.
            await document.unsetFlag(SYSTEM_NAME, FLAGS.Modifier);
            await document.setFlag(SYSTEM_NAME, FLAGS.Modifier, modifiers);
        }
    }

    /**
     * Helper for instances to update modifiers on a document
     */
    async updateDocument() {
        if (!this.document) return console.error(`'Shadowrun 5e | ${this.constructor.name} can't update without connected document'`);
        await DocumentSituationModifiers.setDocumentModifiers(this.document, this.source);
    }

    /**
     * Helper for instances to clear all modifiers on a document
     */
    async clearAll() {
        if (!this.document) return console.error(`'Shadowrun 5e | ${this.constructor.name} can't clear without connected document'`);
        await DocumentSituationModifiers.clearAllOn(this.document);
        // Reset local source data.
        this.source = DocumentSituationModifiers.getDocumentModifiersData(this.document);
    }

    /**
     * Helper for scene modifier instances to clear all modifiers for all placed tokens
     */
    async clearAllTokensOnScene() {
        if (!canvas.ready || !canvas.scene) return;
        if (!this.documentIsScene) return;

        // Validate that modifiers scene is same to current scene.
        const scene = this.document as Scene;
        if (canvas.scene.id !== scene.id) return;

        // Use current scene for ease of access to tokens
        canvas.scene.tokens.forEach(token => token.actor?.getSituationModifiers().clearAll());
    }
}