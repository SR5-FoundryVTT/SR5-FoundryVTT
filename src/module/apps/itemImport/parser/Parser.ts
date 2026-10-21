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
import { ChummerFormulaOptions, ChummerFormulaParser } from '../helper/ChummerFormula';
import { ModifiableValue } from '@/module/mods/ModifiableValue';
import type { DocCreateData } from '../helper/BonusConstant';

export type SystemType<T extends SystemEntityType> = ReturnType<Parser<T>["getBaseSystem"]>;

/** A change of the effect holding an item's Chummer formulas. */
type FormulaChange = { key: string; value: string; type: 'override' | 'add'; priority?: number; target: 'item' | 'parent' };

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

        Parser.dropChanges(item, options.parentStats ? ['parent_item', 'actor'] : ['parent_item'], ['system.technology.cost', 'system.slots']);
    }

    /**
     * Remove an item's effect changes, and any effect left without changes.
     *
     * @param item The item whose effects to trim
     * @param applyTos Drop the changes of targets with these apply-tos
     * @param keys Drop the changes to keys starting with these paths
     */
    public static dropChanges(item: Pick<Item.Source, 'effects'>, applyTos: string[], keys: string[] = []) {
        if (!item.effects) return;
        item.effects = item.effects.filter(effect => {
            const effectSystem = effect.system as {
                targets: { id: string; applyTo: string }[];
                changes: { key: string; target: string }[];
            };
            const droppedIds = new Set(effectSystem.targets.filter(target => applyTos.includes(target.applyTo)).map(target => target.id));
            effectSystem.targets = effectSystem.targets.filter(target => !droppedIds.has(target.id));
            effectSystem.changes = effectSystem.changes.filter(change => !droppedIds.has(change.target)
                && !keys.some(key => change.key.startsWith(key)));
            return effectSystem.changes.length > 0;
        });
    }

    protected getBonus(jsonData: ParseData) { return 'bonus' in jsonData ? jsonData.bonus : undefined; }
    protected abstract getFolder(jsonData: ParseData, compendiumKey: CompendiumKey): Promise<Folder>;
    // oxlint-disable-next-line typescript/require-await -- Default for an async hook that subclasses override with awaiting implementations.
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
                BH.addBonus(entity, jsonData.wirelessbonus, { onlyForWireless: true });
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
            const formula = ChummerFormulaParser.isFormula(raw, identifiers) && !ChummerFormulaParser.isRelative(raw)
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

    /** Chummer names this item's formulas may use, mapped to effect value references. */
    protected formulaIdentifiers(system: object): Record<string, string> {
        return 'slots' in system ? { Slots: '@system.slots' } : {};
    }

    /** Whether imported items can sit in another item, so parent-relative values can change it. */
    protected changesParentItem(system: object): boolean {
        return this.parseType === 'modification' && 'type' in system
            && ['weapon', 'armor', 'ware'].includes(String(system.type));
    }

    /** Add an effect that turns Chummer formulas in the item's values, like a rating-based cost, into changes. */
    private addFormulaEffects(entity: Item.CreateData, jsonData: ParseData) {
        const system = entity.system;
        if (!system) return;
        const options = { minRating: this.getMinRating(jsonData), identifiers: this.formulaIdentifiers(system) };
        const changes = [
            ...this.technologyFormulas(system, jsonData, options),
            ...this.capacityFormulas(system, jsonData, options),
            ...(this.parseType === 'weapon' ? Parser.weaponFormulas(jsonData, options) : []),
        ];
        if (!changes.length) return;

        const targets = [{ id: 'item', applyTo: 'item' }, { id: 'parent', applyTo: 'parent_item' }]
            .filter(target => changes.some(change => change.target === target.id));
        const effects = (entity as DocCreateData).effects ??= [];
        effects.push({ name: 'Chummer formulas', system: { targets, changes } });
    }

    /** Cost, availability and essence formulas. A signed availability adds to the parent item instead. */
    private technologyFormulas(system: object, jsonData: ParseData, options: ChummerFormulaOptions): FormulaChange[] {
        if (!('technology' in system && system.technology)) return [];
        const changes = Parser.ownFormula('system.technology.cost', 'cost' in jsonData ? jsonData.cost?._TEXT : undefined, options);

        const avail = ChummerFormulaParser.firstAlternative('avail' in jsonData ? jsonData.avail?._TEXT ?? '' : '');
        if (!ChummerFormulaParser.isRelative(avail))
            changes.push(...Parser.ownFormula('system.technology.availability', avail, { ...options, availability: true }));
        else if (this.changesParentItem(system))
            changes.push(...Parser.parentAvailability(avail, options));

        if ('ess' in jsonData)
            changes.push(...Parser.ownFormula('essence' in system ? 'system.essence' : 'system.technology.essence', jsonData.ess?._TEXT, options));
        return changes;
    }

    /** Capacity and slot formulas. A signed capacity changes the parent, which an imported item can't. */
    private capacityFormulas(system: object, jsonData: ParseData, options: ChummerFormulaOptions): FormulaChange[] {
        const changes: FormulaChange[] = [];
        const capacity = 'armorcapacity' in jsonData ? jsonData.armorcapacity?._TEXT
            : 'capacity' in jsonData ? jsonData.capacity?._TEXT : undefined;
        if ('capacity' in system && capacity) {
            // Ware keeps its bracketed capacity as its total.
            const isWare = this.parseType === 'bioware' || this.parseType === 'cyberware';
            const total = isWare ? capacity : ChummerFormulaParser.splitCapacity(capacity).own;
            if (total && !ChummerFormulaParser.isRelative(total))
                changes.push(...Parser.ownFormula('system.capacity.total', total, options));
        }
        if ('slots' in system) {
            const slots = 'slots' in jsonData ? jsonData.slots?._TEXT : undefined;
            changes.push(...Parser.ownFormula('system.slots', slots ?? ChummerFormulaParser.usedCapacity(capacity ?? ''), options));
        }
        return changes;
    }

    /** Rating formulas of weapon damage and AP. Attribute formulas like ({STR}+2)P are parsed with the damage. */
    private static weaponFormulas(jsonData: ParseData, options: ChummerFormulaOptions): FormulaChange[] {
        const damage = 'damage' in jsonData ? /^\((.*\bRating\b.*)\)[PSM]?$/i.exec(jsonData.damage?._TEXT ?? '')?.[1] : undefined;
        const changes = Parser.ownFormula('system.action.damage', damage, options);

        const ap = 'ap' in jsonData ? jsonData.ap?._TEXT : undefined;
        const formula = ap && /\bRating\b/i.test(ap) ? ChummerFormulaParser.parse(ap, options) : null;
        // Chummer rounds a fractional AP away from zero.
        if (formula)
            changes.push(Parser.ratingOverride('system.action.damage.ap', `(${formula.value}) < 0 ? floor(${formula.value}) : ceil(${formula.value})`));
        return changes;
    }

    /** Override a value with the formula in raw, if it is one. A rating lookup of the restriction overrides that too. */
    private static ownFormula(key: string, raw: string | undefined, options: ChummerFormulaOptions): FormulaChange[] {
        const formula = raw && ChummerFormulaParser.isFormula(raw, options.identifiers) ? ChummerFormulaParser.parse(raw, options) : null;
        if (!formula) return [];
        const changes = [Parser.ratingOverride(key, formula.value)];
        if (formula.restriction?.startsWith('['))
            changes.push(Parser.ratingOverride(`${key}.restriction`, formula.restriction));
        return changes;
    }

    /** Add a signed availability to the parent item's. */
    private static parentAvailability(raw: string, options: ChummerFormulaOptions): FormulaChange[] {
        const formula = ChummerFormulaParser.parse(raw, { ...options, availability: true });
        if (!formula) return [];
        const key = 'system.technology.availability';
        const changes: FormulaChange[] = [{ key, value: formula.value, type: 'add', target: 'parent' }];
        // A restricted modification makes its parent at least restricted, never less than forbidden.
        const restriction = formula.restriction === 'restricted'
            ? "@affected.system.technology.availability.restriction == 'forbidden' ? 'forbidden' : 'restricted'"
            : formula.restriction;
        if (restriction && restriction !== 'none')
            changes.push(Parser.ratingOverride(`${key}.restriction`, restriction, 'parent'));
        return changes;
    }

    private static ratingOverride(key: string, value: string, target: FormulaChange['target'] = 'item'): FormulaChange {
        return { key, value, type: 'override', priority: ModifiableValue.Priority.RATING, target };
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
