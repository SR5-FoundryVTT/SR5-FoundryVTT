import { BackgroundCountModifier as BackgroundCountModifier } from './modifiers/BackgroundCountModifier';
import { NoiseModifier as NoiseModifer } from './modifiers/NoiseModifier';
import { SituationalModifierApplyOptions, SituationModifier } from './modifiers/SituationModifier';
import { EnvironmentalModifier } from './modifiers/EnvironmentalModifier';
import { SR5Actor } from "../actor/SR5Actor";
import {FLAGS, SR, SYSTEM_NAME} from "../constants";
import SituationModifiersSourceData = Shadowrun.SituationModifiersSourceData;
import SituationModifiersData = Shadowrun.SituationModifiersData;


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
 * A DocumentSitiationModifiers instance doesn't do any handling of values but delegates to
 * the respectiv handler of each category.
 * 
 * Documents only store source data per document, while a document might have other
 * document source data applied first. The resulting applied data is what's actually used to
 * calculate a modifiers total.
 * 
 * This allows for modifiers to be defined globally (scene) for all other documents (actors), while
 * also allowing as many documents in that apply chain as necessary.
 * 
 * TODO: Apply active effects 
 * TODO: Move into flow instead of rules
 * TODO: Define document application order here via configuration for each document type instead of
 *       via implementation for each.
 * 
 */
export class DocumentSituationModifiers {
    // A reference to the original document holding modifier source data.
    document: ModifiableDocumentTypes | undefined;
    // The source data stored on the document.
    source: SituationModifiersSourceData;
    // The applied data from the document and it's apply chain.
    applied: SituationModifiersData;
    // Handlers for the different modifier categories.
    handlers: {
        noise: NoiseModifer,
        background_count: BackgroundCountModifier,
        environmental: EnvironmentalModifier
    }

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

        // Provide all categories to their respective handlers.
        this.handlers = {
            noise: new NoiseModifer(this.source.noise, this),
            background_count: new BackgroundCountModifier(this.source.background_count, this),
            environmental: new EnvironmentalModifier(this.source.environmental, this)
        }
    }

    /**
     * A factory for the SituationalModifier handler of the matrix modifier category
     */
    get noise(): NoiseModifer {
        return this.handlers.noise;
    }

    /**
     * A factory for the MagicModifier handler of the magic modifier category.
     */
    get background_count(): BackgroundCountModifier {
        return this.handlers.background_count;
    }

    /**
     * A factory for the EnvironmentalModifier handler of the environmental modifier category.
     */
    get environmental(): EnvironmentalModifier {
        return this.handlers.environmental;
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
     */
    getTotalFor(category: string): number {
        const modifier = this.applied[category] || {total: 0};
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
        //@ts-ignore // Rebuild applied data fully for all modifiers.
        this.applied = {};

        // Let all handlers apply their modifier rules on the documents source data.
        Object.entries(this.handlers).forEach(([category, handler]) => {
            // Befor application, remove invalid selections. 
            // This happens when a selection has been set with an empty input DOM element.
            Object.entries(this.source[category].active).forEach(([modifier, value]) => {
                switch (value) {
                    case null:
                    case undefined:
                        delete this.source[category].active[modifier];
                }
            })

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
    static async clearAllOnDocument(document: ModifiableDocumentTypes): Promise<DocumentSituationModifiers> {
        await document.unsetFlag(SYSTEM_NAME, FLAGS.Modifier);
        return new DocumentSituationModifiers(DocumentSituationModifiers._defaultModifiers);
    }

    /**
     * Clear a given modifiers categories selection from a document.
     * 
     * @param document The document to clear.
     * @param category Modifiers category to clear
     * @returns A new instance with the resulting modifiers structure
     */
    static async clearCategoryOnDocument(document: ModifiableDocumentTypes, category: keyof SituationModifiersSourceData): Promise<DocumentSituationModifiers> {
        const modifiers = DocumentSituationModifiers.getDocumentModifiers(document);

        if (!modifiers.source.hasOwnProperty(category)) return modifiers;
        modifiers.source[category] = DocumentSituationModifiers._defaultModifier;

        await DocumentSituationModifiers.setDocumentModifiers(document, modifiers.source);
        return modifiers;
    }

    /**
     * Clear the environmental modifier selection for a document.
     * 
     * @param document The document to clear.
     * @returns A new instance with the resulting modifiers structure
     */
    static async clearEnvironmentalOn(document: ModifiableDocumentTypes): Promise<DocumentSituationModifiers> {
        return await DocumentSituationModifiers.clearCategoryOnDocument(document, 'environmental');
    }

    /**
     * Clear the background count modifier selection for a document.
     * 
     * @param document The document to clear.
     * @returns A new instance with the resulting modifiers structure
     */
    static async clearBackgroundCountOn(document: ModifiableDocumentTypes): Promise<DocumentSituationModifiers> {
        return await DocumentSituationModifiers.clearCategoryOnDocument(document, 'background_count');
    }

    /**
     * Clear the noise modifier selection for a document.
     * 
     * @param document The document to clear.
     * @returns A new instance with the resulting modifiers structure
     */
    static async clearNoiseOn(document: ModifiableDocumentTypes): Promise<DocumentSituationModifiers> {
        return await DocumentSituationModifiers.clearCategoryOnDocument(document, 'noise');
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
        return document.getFlag(SYSTEM_NAME, FLAGS.Modifier) as SituationModifiersSourceData;
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
     * Retrieve the situational modifiers data.
     * 
     * @param document Any document with flags support.
     * @returns The raw modifier data of a document
     */
    static getDocumentModifiers(document: ModifiableDocumentTypes): DocumentSituationModifiers {
        // It's possible for scene modifiers to chosen, while no scene is actually opened.
        // if (!document) return new Modifiers(Modifiers.getDefaultModifiers());
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
        // Removing unsetFlag causes strange update behaviour...
        // ...this behaviour has been observed at other updates on flags.
        await document.unsetFlag(SYSTEM_NAME, FLAGS.Modifier);
        await document.setFlag(SYSTEM_NAME, FLAGS.Modifier, modifiers);
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
        await DocumentSituationModifiers.clearAllOnDocument(this.document);
        // Reset local source data.
        // Let caller decide time of re-apply
        this.source = DocumentSituationModifiers._defaultModifiers;
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