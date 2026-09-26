import { ParseData } from "./Types";
import { CompendiumKey } from "../importer/Constants";
import { Sanitizer } from "@/module/sanitizer/Sanitizer";
import { BonusHelper as BH } from "../helper/BonusHelper";
import { IconAssign } from "../../iconAssigner/IconAssign";
import { ImportHelper as IH } from "../helper/ImportHelper";
import { ItemAvailabilityFlow } from "@/module/item/flows/ItemAvailabilityFlow";
import { TechnologyType } from "src/module/types/template/Technology";
import { DataDefaults, SystemConstructorArgs, SystemEntityType } from "src/module/data/DataDefaults";
import TypeDataModel = foundry.abstract.TypeDataModel;
import { ChummerFormulaParser } from '../helper/ChummerFormula';
import { ChummerImportCoverage } from '../helper/ChummerImportCoverage';
import { ModifiableValue } from '@/module/mods/ModifiableValue';
import type { DocCreateData } from '../helper/BonusConstant';

export type SystemType<T extends SystemEntityType> = ReturnType<Parser<T>["getBaseSystem"]>;

export abstract class Parser<SubType extends SystemEntityType> {
    protected abstract readonly parseType: SubType;

    private isActor(): this is Parser<SystemEntityType & Actor.SubType> {
        return (Object.keys(CONFIG.Actor.dataModels) as string[]).includes(this.parseType);
    }

    /**
     * Turn an item into one included in the weapon, armor or vehicle it's nested in. The parent's
     * own values already account for it, so drop the item's cost and capacity, and the changes it
     * makes to its parent item.
     *
     * @param item The nested item
     * @param options.parentStats Also drop changes to the owning actor, for a vehicle whose own
     *        stats already include the item
     */
    public static includeInParent(item: Item.Source, options: { parentStats?: boolean } = {}) {
        const system = item.system as Partial<SystemType<'modification'>>;
        if (system.technology) {
            system.technology.cost.base = 0;
            system.technology.cost.value = 0;
        }
        if (system.slots !== undefined) system.slots = 0;

        const dropped = options.parentStats ? ['parent_item', 'actor'] : ['parent_item'];
        item.effects = item.effects.filter(effect => {
            const effectSystem = effect.system as {
                targets: { id: string; applyTo: string }[];
                changes: { key: string; target: string }[];
            };
            const droppedIds = new Set(effectSystem.targets.filter(target => dropped.includes(target.applyTo)).map(target => target.id));
            effectSystem.targets = effectSystem.targets.filter(target => !droppedIds.has(target.id));
            effectSystem.changes = effectSystem.changes.filter(change => !droppedIds.has(change.target)
                && !change.key.startsWith('system.technology.cost') && change.key !== 'system.slots');
            return effectSystem.changes.length > 0;
        });
    }

    protected getBonus(jsonData: ParseData) { return 'bonus' in jsonData ? jsonData.bonus : undefined; }
    protected abstract getFolder(jsonData: ParseData, compendiumKey: CompendiumKey): Promise<Folder>;
    protected async getItems(jsonData: ParseData): Promise<Item.Source[]> { return []; }
    protected getSystem(jsonData: ParseData) { return this.getBaseSystem(); }

    private getSanitizedSystem(jsonData: ParseData) {
        const system = this.getSystem(jsonData);
        const dataModels = CONFIG[this.isActor() ? "Actor" : "Item"].dataModels as Record<string, TypeDataModel.AnyConstructor>;
        const schema = dataModels[this.parseType].schema;
        const correctionLogs = Sanitizer.sanitize(schema, system);

        if (correctionLogs) {
            console.warn(
                `Document Sanitized on Import:\n` +
                `Name: ${jsonData.name._TEXT};\n` +
                `Type: ${this.isActor() ? "Actor" : "Item"}; SubType: ${this.parseType};\n`
            );
            console.table(correctionLogs);
        }

        return system;
    }

    public async Parse(jsonData: ParseData, compendiumKey: CompendiumKey): Promise<Actor.CreateData | Item.CreateData> {
        const itemPromise = this.getItems(jsonData);

        const entity = {
            img: undefined as string | undefined | null,
            name: IH.translate(IH.getArray(jsonData.translate)[0]?._TEXT ?? jsonData.name._TEXT, jsonData.id?._TEXT),
            type: this.parseType as any,
            system: this.getSanitizedSystem(jsonData),
            folder: (await this.getFolder(jsonData, compendiumKey)).id,
        } satisfies Actor.CreateData | Item.CreateData;

        const system = entity.system;

        // Add technology
        if ('technology' in system && system.technology)
            this.setTechnology(system.technology, jsonData, this.formulaIdentifiers(system));

        this.setImporterFlags(entity, jsonData);

        entity.img = IconAssign.iconAssign(entity);

        BH.addBonus(entity, this.getBonus(jsonData));
        if (!this.isActor()) {
            this.addFormulaEffects(entity as Item.CreateData, jsonData);
            if ('wirelessbonus' in jsonData && jsonData.wirelessbonus)
                BH.addBonus(entity, jsonData.wirelessbonus as never, { onlyForWireless: true });
        }
        for (const [block, reason] of Object.entries(this.unsupportedBlocks())) {
            if (block in jsonData && jsonData[block as keyof ParseData])
                ChummerImportCoverage.skip(`${block}: ${reason}`, entity.name);
        }

        if (jsonData.page && jsonData.source) {
            const page = IH.getArray(jsonData.altpage)[0]?._TEXT ?? jsonData.page._TEXT;
            const source = jsonData.source._TEXT;
            system.description.source = `${source} ${page}`;
        }

        // Runtime branching
        if (this.isActor())
            (entity as Actor.CreateData).items = await itemPromise;
        else
            (entity as Item.CreateData).flags = { shadowrun5e: { embeddedItems: await itemPromise } };

        return entity;
    }

    private setTechnology(technology: TechnologyType, jsonData: ParseData, identifiers: Record<string, string>) {
        if ('avail' in jsonData && jsonData.avail) {
            const raw = ChummerFormulaParser.firstAlternative(jsonData.avail._TEXT || '');
            const isFormula = ChummerFormulaParser.isFormula(raw) || Parser.hasIdentifier(raw, identifiers);
            const formula = isFormula && !ChummerFormulaParser.isRelative(raw)
                ? ChummerFormulaParser.parse(raw, { availability: true, minRating: this.getMinRating(jsonData), identifiers }) : null;
            Object.assign(technology.availability, ItemAvailabilityFlow.parseAvailabilityString(formula ? '0' : raw));
            if (formula?.restriction && !formula.restriction.startsWith('['))
                technology.availability.restriction = ItemAvailabilityFlow.normalizeRestriction(formula.restriction);
        }
        const cost = 'cost' in jsonData ? jsonData.cost?._TEXT : undefined;
        technology.cost.base = Number.isFinite(Number(cost)) ? Number(cost)
            : ChummerFormulaParser.variableMinimum(cost ?? '') ?? 0;
        // Chummer's data files store the item's *maximum* rating in <rating>. An item starts out at
        // rating 1, as it does in Chummer when added to a character. A rating read from the character,
        // like {STRMaximum}, has no value here, so such an item starts at rating 1 too.
        const maxRating = 'rating' in jsonData ? jsonData.rating?._TEXT
            : 'maxrating' in jsonData ? jsonData.maxrating?._TEXT : undefined;
        technology.max_rating = Number(maxRating) || 0;
        technology.rating = technology.max_rating > 0 || /\{\w+\}/.test(maxRating ?? '') ? 1 : 0;
        technology.conceal.base = 'conceal' in jsonData && jsonData.conceal ? Number(jsonData.conceal._TEXT) || 0 : 0;
    }

    private getMinRating(jsonData: ParseData): number | undefined {
        const raw = 'minrating' in jsonData ? jsonData.minrating?._TEXT : undefined;
        if (!raw) return undefined;
        const value = Number(raw);
        return Number.isFinite(value) ? value : undefined;
    }

    /** Chummer blocks that need context an imported item doesn't have, with the reason reported. */
    private unsupportedBlocks(): Record<string, string> {
        return {
            pairbonus: 'requires matching owned items',
            wirelesspairbonus: 'requires matching owned items',
            wirelesspairinclude: 'requires matching owned items',
            wirelessweaponbonus: 'requires weapon context',
            flechetteweaponbonus: 'requires weapon context',
            // Ammo applies its weapon bonus itself.
            ...(this.parseType === 'ammo' ? {} : { weaponbonus: 'requires weapon context' }),
        };
    }

    /** Chummer names this item's formulas may use, mapped to effect value references. */
    protected formulaIdentifiers(system: object): Record<string, string> {
        return 'slots' in system ? { Slots: '@system.slots' } : {};
    }

    /** Whether imported items can sit in another item, so parent-relative values can change it. */
    protected changesParentItem(system: object): boolean {
        return this.parseType === 'modification' && 'type' in system
            && ['weapon', 'armor', 'ware'].includes(String(system.type));
    }

    private static hasIdentifier(raw: string, identifiers: Record<string, string>) {
        return Object.keys(identifiers).some(identifier => new RegExp(`\\b${identifier}\\b`).test(raw));
    }

    private addFormulaEffects(entity: Item.CreateData, jsonData: ParseData) {
        const system = entity.system;
        if (!system) return;
        type FormulaChange = { key: string; value: string; type: 'override' | 'add'; priority?: number; target: 'item' | 'parent' };
        const changes: FormulaChange[] = [];
        const override = (key: string, value: string) =>
            changes.push({ key, value, type: 'override', priority: ModifiableValue.Priority.RATING, target: 'item' });
        const minRating = this.getMinRating(jsonData);
        const identifiers = this.formulaIdentifiers(system);
        const addToParent = (field: string, raw: string, skip: (reason: string) => void) => {
            const formula = ChummerFormulaParser.parse(raw, { availability: true, minRating, identifiers });
            if (!formula) return skip(ChummerFormulaParser.classify(raw, { minRating }));
            changes.push({ key: field, value: formula.value, type: 'add', target: 'parent' });
            // A restricted modification makes its parent at least restricted, never less than forbidden.
            const restriction = formula.restriction === 'restricted'
                ? "@affected.system.technology.availability.restriction == 'forbidden' ? 'forbidden' : 'restricted'"
                : formula.restriction;
            if (restriction && restriction !== 'none')
                changes.push({ key: `${field}.restriction`, value: restriction, type: 'override', priority: ModifiableValue.Priority.RATING, target: 'parent' });
            ChummerImportCoverage.add(`${field}: parent item`);
        };
        const add = (field: string, raw: string | undefined, availability = false) => {
            if (!raw) return;
            if (availability) raw = ChummerFormulaParser.firstAlternative(raw);
            const skip = (reason: string) => ChummerImportCoverage.skip(`${field}: ${reason}`, `${entity.name}: ${raw}`);
            // A signed availability or capacity changes the parent; signed slots and cost stay the item's own.
            if ((availability || field === 'system.capacity.total') && ChummerFormulaParser.isRelative(raw)) {
                if (availability && this.changesParentItem(system)) return addToParent(field, raw, skip);
                return skip('relative to parent');
            }
            if (!ChummerFormulaParser.isFormula(raw) && !Parser.hasIdentifier(raw, identifiers)) {
                if ((availability && !ItemAvailabilityFlow.parseAvailability(raw).isValid)
                    || (field === 'system.technology.cost' && !Number.isFinite(Number(raw))))
                    skip(ChummerFormulaParser.classify(raw, { minRating }));
                return;
            }
            const formula = ChummerFormulaParser.parse(raw, { availability, minRating, identifiers });
            if (!formula) return skip(ChummerFormulaParser.classify(raw, { minRating }));
            override(field, formula.value);
            if (availability && formula.restriction?.startsWith('['))
                override('system.technology.availability.restriction', formula.restriction);
            ChummerImportCoverage.add(field);
        };

        if ('technology' in system && system.technology) {
            add('system.technology.cost', 'cost' in jsonData ? jsonData.cost?._TEXT : undefined);
            add('system.technology.availability', 'avail' in jsonData ? jsonData.avail?._TEXT : undefined, true);
            if ('ess' in jsonData)
                add('essence' in system ? 'system.essence' : 'system.technology.essence', jsonData.ess?._TEXT);
        }
        const capacity = 'armorcapacity' in jsonData ? jsonData.armorcapacity?._TEXT
            : 'capacity' in jsonData ? jsonData.capacity?._TEXT : undefined;
        if ('capacity' in system && capacity) {
            // Ware keeps its bracketed capacity as its total.
            const isWare = this.parseType === 'bioware' || this.parseType === 'cyberware';
            add('system.capacity.total', isWare ? capacity : ChummerFormulaParser.splitCapacity(capacity).own);
        }
        if ('slots' in system) {
            const slots = 'slots' in jsonData ? jsonData.slots?._TEXT : undefined;
            add('system.slots', slots ?? ChummerFormulaParser.usedCapacity(capacity ?? ''));
        }
        if (!changes.length) return;
        const targets = [{ id: 'item', applyTo: 'item' }, { id: 'parent', applyTo: 'parent_item' }]
            .filter(target => changes.some(change => change.target === target.id));
        const effects = (entity as DocCreateData).effects ??= [];
        effects.push({ name: 'Chummer formulas', system: { targets, changes } });
    }

    protected setImporterFlags(entity: Actor.CreateData | Item.CreateData, jsonData: ParseData) {
        const category = 'category' in jsonData ? jsonData.category?._TEXT || '' : '';

        entity.system!.importFlags = {
            category,
            isFreshImport: true,
            name: jsonData.name._TEXT,
            sourceid: jsonData.id._TEXT,
        };
    }

    protected getBaseSystem(createData: SystemConstructorArgs<SubType> = {}) {
        return DataDefaults.baseSystemData<SubType>(this.parseType, createData);
    };
}
